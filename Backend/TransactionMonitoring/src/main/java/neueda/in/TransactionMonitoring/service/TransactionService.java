package neueda.in.TransactionMonitoring.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.TransactionRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.exception.ResourceNotFoundException;
import neueda.in.TransactionMonitoring.mapper.TransactionMapper;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper     transactionMapper;

    /** Record a new transaction. */
    @Transactional
    public TransactionResponseDTO recordTransaction(TransactionRequestDTO dto) {
        Transaction transaction = Transaction.builder()
            .accountId(dto.getAccountId())
            .payeeId(dto.getPayeeId())
            .amount(dto.getAmount())
            .currency(dto.getCurrency() != null ? dto.getCurrency() : "USD")
            .type(dto.getType())
            .status(TransactionStatus.COMPLETED)
            .timestamp(dto.getTimestamp() != null ? dto.getTimestamp() : Instant.now())
            .description(dto.getDescription())
            .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction recorded: id={}, account={}, amount={}", saved.getId(), saved.getAccountId(), saved.getAmount());
        return transactionMapper.toResponseDTO(saved);
    }

    /** Paginated list with optional filters. */
    public PagedResponseDTO<TransactionResponseDTO> getTransactions(
            String accountId, String payeeId, Instant fromTime, Instant toTime, int page, int size) {

        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<Transaction> result = transactionRepository.findWithFilters(accountId, payeeId, fromTime, toTime, pageable);

        return PagedResponseDTO.<TransactionResponseDTO>builder()
            .content(result.getContent().stream().map(transactionMapper::toResponseDTO).toList())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .last(result.isLast())
            .build();
    }

    /** Get single transaction by ID. */
    public TransactionResponseDTO getTransactionById(String id) {
        return transactionMapper.toResponseDTO(
            transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id))
        );
    }

    /** Delete a transaction by ID. */
    @Transactional
    public void deleteTransaction(String id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction", id);
        }
        transactionRepository.deleteById(id);
        log.info("Transaction deleted: id={}", id);
    }
}

