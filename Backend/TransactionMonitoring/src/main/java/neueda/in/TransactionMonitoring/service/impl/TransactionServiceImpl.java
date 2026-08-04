package neueda.in.TransactionMonitoring.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.TransactionRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertSummaryDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionDetailResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.entity.Account;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.entity.AlertTransaction;
import neueda.in.TransactionMonitoring.entity.Payee;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.event.TransactionRecordedEvent;
import neueda.in.TransactionMonitoring.enums.AccountStatus;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import neueda.in.TransactionMonitoring.exception.DuplicateTransactionException;
import neueda.in.TransactionMonitoring.exception.InvalidTransactionException;
import neueda.in.TransactionMonitoring.exception.ResourceNotFoundException;
import neueda.in.TransactionMonitoring.repository.AccountRepository;
import neueda.in.TransactionMonitoring.repository.AlertRepository;
import neueda.in.TransactionMonitoring.repository.AlertTransactionRepository;
import neueda.in.TransactionMonitoring.repository.PayeeRepository;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import neueda.in.TransactionMonitoring.service.TransactionService;
import neueda.in.TransactionMonitoring.specification.TransactionSpecification;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository     accountRepository;
    private final PayeeRepository       payeeRepository;
    private final AlertRepository       alertRepository;
    private final AlertTransactionRepository alertTransactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/v1/transactions
    // ────────────────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public TransactionResponseDTO createTransaction(TransactionRequestDTO request) {

        // 1. Validate account exists
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account", "accountId", request.getAccountId()));

        // 2. Validate account is active
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransactionException(
                    "Account '" + request.getAccountId() + "' is not active. Current status: "
                            + account.getStatus());
        }

        // 3. Find or auto-create payee
        Payee payee = payeeRepository.findById(request.getPayeeId())
                .orElseGet(() -> {
                    log.info("New payee detected — auto-creating: {}", request.getPayeeId());
                    return payeeRepository.save(Payee.builder()
                            .payeeId(request.getPayeeId())
                            .payeeName(request.getPayeeName() != null
                                    ? request.getPayeeName()
                                    : request.getPayeeId())
                            .payeeType(request.getPayeeType())
                            .build());
                });

        // 4. Resolve timestamp — use provided or default to now
        LocalDateTime timestamp = request.getTimestamp() != null
                ? request.getTimestamp()
                : LocalDateTime.now();

        // 5. Duplicate check — same account + payee + amount + timestamp
        if (transactionRepository.existsByAccountAndPayeeAndAmountAndTimestamp(
                account, payee, request.getAmount(), timestamp)) {
            throw new DuplicateTransactionException(
                    "Duplicate transaction detected for account '" + request.getAccountId()
                            + "' with payee '" + request.getPayeeId()
                            + "' amount " + request.getAmount()
                            + " at " + timestamp);
        }

        // 6. Build and save transaction
        Transaction transaction = Transaction.builder()
                .account(account)
                .payee(payee)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .transactionType(request.getTransactionType())
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription())
                .timestamp(timestamp)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction created successfully — id: {}, account: {}, amount: {}",
                saved.getTransactionId(), request.getAccountId(), request.getAmount());

        // publishing event for further processing (e.g., rule evaluation, alert generation) using Spring's event mechanism
        log.info("📢 Publishing TransactionRecordedEvent for transactionId={}", saved.getTransactionId());
        eventPublisher.publishEvent(new TransactionRecordedEvent(this, saved.getTransactionId()));
        log.info("✅ TransactionRecordedEvent published successfully — id: {}", saved.getTransactionId());

        return toResponseDTO(saved);
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/v1/transactions
    // ────────────────────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponseDTO> getAllTransactions(
            String accountId,
            TransactionStatus status,
            TransactionType transactionType,
            String payeeId,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size,
            String sort) {

        // Parse sort param: "timestamp,desc" or "amount,asc"
        Sort sortOrder;
        try {
            String[] parts = sort.split(",");
            String field     = parts[0].trim();
            String direction = parts.length > 1 ? parts[1].trim() : "desc";
            sortOrder = Sort.by(Sort.Direction.fromString(direction), field);
        } catch (Exception e) {
            sortOrder = Sort.by(Sort.Direction.DESC, "timestamp");
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Specification<Transaction> spec = Specification
                .where(TransactionSpecification.hasAccountId(accountId))
                .and(TransactionSpecification.hasStatus(status))
                .and(TransactionSpecification.hasTransactionType(transactionType))
                .and(TransactionSpecification.hasPayeeId(payeeId))
                .and(TransactionSpecification.amountGreaterThanOrEqual(minAmount))
                .and(TransactionSpecification.amountLessThanOrEqual(maxAmount))
                .and(TransactionSpecification.timestampAfter(startDate))
                .and(TransactionSpecification.timestampBefore(endDate));

        Page<Transaction> txnPage = transactionRepository.findAll(spec, pageable);

        List<TransactionResponseDTO> content = txnPage.getContent()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());

        return PagedResponse.<TransactionResponseDTO>builder()
                .content(content)
                .page(txnPage.getNumber())
                .size(txnPage.getSize())
                .totalElements(txnPage.getTotalElements())
                .totalPages(txnPage.getTotalPages())
                .first(txnPage.isFirst())
                .last(txnPage.isLast())
                .build();
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/v1/transactions/{id}
    // ────────────────────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public TransactionDetailResponseDTO getTransactionById(Long id) {
        Transaction txn = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));

        List<AlertSummaryDTO> alerts = findAlertsForTransaction(id)
                .stream()
                .map(this::toAlertSummaryDTO)
                .collect(Collectors.toList());

        return toDetailResponseDTO(txn, alerts);
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/v1/transactions/{id}/alerts
    // ────────────────────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<AlertSummaryDTO> getAlertsByTransactionId(Long id) {
        // Verify transaction exists first
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction", "id", id);
        }
        return findAlertsForTransaction(id)
                .stream()
                .map(this::toAlertSummaryDTO)
                .collect(Collectors.toList());
    }

    private List<Alert> findAlertsForTransaction(Long transactionId) {
        Map<Long, Alert> unique = new LinkedHashMap<>();

        for (Alert alert : alertRepository.findByTransaction_TransactionIdOrderByCreatedAtDesc(transactionId)) {
            unique.putIfAbsent(alert.getAlertId(), alert);
        }

        for (AlertTransaction link : alertTransactionRepository.findByTransaction_TransactionIdOrderByLinkedAtDesc(transactionId)) {
            Alert linkedAlert = link.getAlert();
            if (linkedAlert != null) {
                unique.putIfAbsent(linkedAlert.getAlertId(), linkedAlert);
            }
        }

        return unique.values().stream()
                .sorted(Comparator.comparing(Alert::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Private mappers
    // ────────────────────────────────────────────────────────────────────────

    private TransactionResponseDTO toResponseDTO(Transaction t) {
        return TransactionResponseDTO.builder()
                .transactionId(t.getTransactionId())
                .accountId(t.getAccount().getAccountId())
                .accountName(t.getAccount().getAccountName())
                .payeeId(t.getPayee().getPayeeId())
                .payeeName(t.getPayee().getPayeeName())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .transactionType(t.getTransactionType())
                .status(t.getStatus())
                .description(t.getDescription())
                .timestamp(t.getTimestamp())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private TransactionDetailResponseDTO toDetailResponseDTO(Transaction t, List<AlertSummaryDTO> alerts) {
        return TransactionDetailResponseDTO.builder()
                .transactionId(t.getTransactionId())
                .accountId(t.getAccount().getAccountId())
                .accountName(t.getAccount().getAccountName())
                .payeeId(t.getPayee().getPayeeId())
                .payeeName(t.getPayee().getPayeeName())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .transactionType(t.getTransactionType())
                .status(t.getStatus())
                .description(t.getDescription())
                .timestamp(t.getTimestamp())
                .createdAt(t.getCreatedAt())
                .alerts(alerts)
                .build();
    }

    private AlertSummaryDTO toAlertSummaryDTO(Alert a) {
        return AlertSummaryDTO.builder()
                .alertId(a.getAlertId())
                .ruleId(a.getRuleId())
                .alertStatus(a.getAlertStatus())
                .severity(a.getSeverity())
                .alertMessage(a.getAlertMessage())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

