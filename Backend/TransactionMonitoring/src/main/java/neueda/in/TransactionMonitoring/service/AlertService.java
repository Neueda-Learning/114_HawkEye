package neueda.in.TransactionMonitoring.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertCreationRequestDTO;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.dto.response.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.event.AlertCreatedEvent;
import neueda.in.TransactionMonitoring.exception.InvalidStateTransitionException;
import neueda.in.TransactionMonitoring.exception.ResourceNotFoundException;
import neueda.in.TransactionMonitoring.repository.AlertRepository;
import neueda.in.TransactionMonitoring.repository.RuleRepository;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	private final AlertRepository alertRepository;
	private final TransactionRepository transactionRepository;
	private final RuleRepository ruleRepository;
	private final ApplicationEventPublisher eventPublisher;

	@Transactional
	public AlertResponseDTO createAlert(AlertCreationRequestDTO request) {
		if (alertRepository.existsByRuleIdAndTransaction_TransactionId(request.getRuleId(), request.getTransactionId())) {
			log.warn("Duplicate alert skipped — ruleId={} transactionId={}", request.getRuleId(), request.getTransactionId());
			return null;
		}

		Rule rule = ruleRepository.findById(request.getRuleId())
				.orElseThrow(() -> new EntityNotFoundException("Rule not found with id: " + request.getRuleId()));

		Transaction transaction = transactionRepository.findById(request.getTransactionId())
				.orElseThrow(() -> new EntityNotFoundException("Transaction not found with id: " + request.getTransactionId()));

		Alert alert = Alert.builder()
				.ruleId(rule.getId())
				.account(transaction.getAccount())
				.transaction(transaction)
				.alertStatus(AlertStatus.OPEN)
				.severity(request.getSeverity())
				.alertMessage(request.getAlertMessage())
				.alertDetails(toJson(request.getAlertDetails()))
				.build();

		Alert saved = alertRepository.save(alert);
		AlertResponseDTO response = toResponseDTO(saved, rule.getName());
		eventPublisher.publishEvent(new AlertCreatedEvent(this, response));
		return response;
	}

	@Transactional(readOnly = true)
	public PagedResponseDTO<AlertResponseDTO> getAlerts(AlertStatus status, Severity severity, int page, int size) {
		Specification<Alert> spec = (root, query, cb) -> cb.conjunction();
		if (status != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("alertStatus"), status));
		}
		if (severity != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
		}
		return toPagedResponse(alertRepository.findAll(spec, PageRequest.of(page, size, Sort.by("createdAt").descending())));
	}

	@Transactional(readOnly = true)
	public AlertStatsResponseDTO getStats() {
		long open = alertRepository.countByAlertStatus(AlertStatus.OPEN);
		long acknowledged = alertRepository.countByAlertStatus(AlertStatus.ACKNOWLEDGED);
		long investigating = alertRepository.countByAlertStatus(AlertStatus.INVESTIGATING);
		long closed = alertRepository.countByAlertStatus(AlertStatus.CLOSED);
		long dismissed = alertRepository.countByAlertStatus(AlertStatus.DISMISSED);
		return AlertStatsResponseDTO.builder()
				.open(open)
				.acknowledged(acknowledged)
				.investigating(investigating)
				.closed(closed)
				.dismissed(dismissed)
				.total(open + acknowledged + investigating + closed + dismissed)
				.build();
	}

	@Transactional(readOnly = true)
	public PagedResponseDTO<AlertResponseDTO> getAlertHistory(Severity severity, String ruleName, int page, int size) {
		Set<Long> ruleIds = resolveRuleIds(ruleName);
		Specification<Alert> spec = historySpec(severity, ruleIds);
		return toPagedResponse(alertRepository.findAll(spec, PageRequest.of(page, size, Sort.by("updatedAt").descending())));
	}

	@Transactional(readOnly = true)
	public PagedResponseDTO<AlertResponseDTO> getClosedAlerts(Severity severity, int page, int size) {
		Specification<Alert> spec = (root, query, cb) -> cb.equal(root.get("alertStatus"), AlertStatus.CLOSED);
		if (severity != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
		}
		return toPagedResponse(alertRepository.findAll(spec, PageRequest.of(page, size, Sort.by("closedAt").descending())));
	}

	@Transactional(readOnly = true)
	public PagedResponseDTO<AlertResponseDTO> getDismissedAlerts(Severity severity, int page, int size) {
		Specification<Alert> spec = (root, query, cb) -> cb.equal(root.get("alertStatus"), AlertStatus.DISMISSED);
		if (severity != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
		}
		return toPagedResponse(alertRepository.findAll(spec, PageRequest.of(page, size, Sort.by("dismissedAt").descending())));
	}

	@Transactional(readOnly = true)
	public AlertResponseDTO getAlertById(Long id) {
		Alert alert = findAlert(id);
		return toResponseDTO(alert, resolveRuleName(alert.getRuleId()));
	}

	@Transactional(readOnly = true)
	public List<TransactionResponseDTO> getAlertTransactions(Long id) {
		Alert alert = findAlert(id);
		return List.of(toTransactionResponseDTO(alert.getTransaction()));
	}

	@Transactional
	public AlertResponseDTO acknowledgeAlert(Long id) {
		Alert alert = findAlert(id);
		requireTransition(alert.getAlertStatus(), AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED);
		alert.setAlertStatus(AlertStatus.ACKNOWLEDGED);
		alert.setAcknowledgedAt(LocalDateTime.now());
		return toResponseDTO(alertRepository.save(alert), resolveRuleName(alert.getRuleId()));
	}

	@Transactional
	public AlertResponseDTO startInvestigation(Long id) {
		Alert alert = findAlert(id);
		if (alert.getAlertStatus() != AlertStatus.OPEN && alert.getAlertStatus() != AlertStatus.ACKNOWLEDGED) {
			throw new InvalidStateTransitionException(alert.getAlertStatus(), AlertStatus.INVESTIGATING);
		}
		alert.setAlertStatus(AlertStatus.INVESTIGATING);
		alert.setInvestigatingAt(LocalDateTime.now());
		return toResponseDTO(alertRepository.save(alert), resolveRuleName(alert.getRuleId()));
	}

	@Transactional
	public AlertResponseDTO closeAlert(Long id, AlertStatusUpdateDTO dto) {
		Alert alert = findAlert(id);
		requireTransition(alert.getAlertStatus(), AlertStatus.INVESTIGATING, AlertStatus.CLOSED);
		alert.setAlertStatus(AlertStatus.CLOSED);
		alert.setClosedAt(LocalDateTime.now());
		applyResolutionNotes(alert, dto);
		return toResponseDTO(alertRepository.save(alert), resolveRuleName(alert.getRuleId()));
	}

	@Transactional
	public AlertResponseDTO dismissAlert(Long id, AlertStatusUpdateDTO dto) {
		Alert alert = findAlert(id);
		if (alert.getAlertStatus() == AlertStatus.CLOSED || alert.getAlertStatus() == AlertStatus.DISMISSED) {
			throw new InvalidStateTransitionException(alert.getAlertStatus(), AlertStatus.DISMISSED);
		}
		alert.setAlertStatus(AlertStatus.DISMISSED);
		alert.setDismissedAt(LocalDateTime.now());
		applyResolutionNotes(alert, dto);
		return toResponseDTO(alertRepository.save(alert), resolveRuleName(alert.getRuleId()));
	}

	private Alert findAlert(Long id) {
		return alertRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Alert", "id", id));
	}

	private void requireTransition(AlertStatus current, AlertStatus expectedFrom, AlertStatus target) {
		if (current != expectedFrom) {
			throw new InvalidStateTransitionException(current, target);
		}
	}

	private void applyResolutionNotes(Alert alert, AlertStatusUpdateDTO dto) {
		String notes = dto != null ? dto.getResolutionNotes() : null;
		alert.setResolutionNotes(notes);
		alert.setClosedReason(notes);
	}

	private PagedResponseDTO<AlertResponseDTO> toPagedResponse(Page<Alert> page) {
		List<AlertResponseDTO> content = page.getContent().stream()
				.map(alert -> toResponseDTO(alert, resolveRuleName(alert.getRuleId())))
				.toList();

		return PagedResponseDTO.<AlertResponseDTO>builder()
				.content(content)
				.page(page.getNumber())
				.size(page.getSize())
				.totalElements(page.getTotalElements())
				.totalPages(page.getTotalPages())
				.first(page.isFirst())
				.last(page.isLast())
				.build();
	}

	private Specification<Alert> historySpec(Severity severity, Set<Long> ruleIds) {
		Specification<Alert> spec = (root, query, cb) -> root.get("alertStatus").in(AlertStatus.CLOSED, AlertStatus.DISMISSED);
		if (severity != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
		}
		if (ruleIds != null) {
			if (ruleIds.isEmpty()) {
				return spec.and((root, query, cb) -> cb.disjunction());
			}
			spec = spec.and((root, query, cb) -> root.get("ruleId").in(ruleIds));
		}
		return spec;
	}

	private Set<Long> resolveRuleIds(String ruleName) {
		if (ruleName == null || ruleName.isBlank()) {
			return null;
		}
		String normalized = ruleName.trim().toLowerCase();
		return ruleRepository.findAll().stream()
				.filter(rule -> rule.getName() != null && rule.getName().toLowerCase().contains(normalized))
				.map(Rule::getId)
				.collect(Collectors.toSet());
	}

	private String resolveRuleName(Long ruleId) {
		return ruleRepository.findById(ruleId).map(Rule::getName).orElse(null);
	}

	private AlertResponseDTO toResponseDTO(Alert alert, String ruleName) {
		return AlertResponseDTO.builder()
				.alertId(alert.getAlertId())
				.ruleId(alert.getRuleId())
				.ruleName(ruleName)
				.accountId(alert.getAccount() != null ? alert.getAccount().getAccountId() : null)
				.transactionId(alert.getTransaction() != null ? alert.getTransaction().getTransactionId() : null)
				.alertStatus(alert.getAlertStatus())
				.severity(alert.getSeverity())
				.alertMessage(alert.getAlertMessage())
				.alertDetails(parseJson(alert.getAlertDetails()))
				.resolutionNotes(alert.getResolutionNotes())
				.createdAt(alert.getCreatedAt())
				.updatedAt(alert.getUpdatedAt())
				.acknowledgedAt(alert.getAcknowledgedAt())
				.investigatingAt(alert.getInvestigatingAt())
				.closedAt(alert.getClosedAt())
				.dismissedAt(alert.getDismissedAt())
				.build();
	}

	private TransactionResponseDTO toTransactionResponseDTO(Transaction transaction) {
		return TransactionResponseDTO.builder()
				.transactionId(transaction.getTransactionId())
				.accountId(transaction.getAccount() != null ? transaction.getAccount().getAccountId() : null)
				.accountName(transaction.getAccount() != null ? transaction.getAccount().getAccountName() : null)
				.payeeId(transaction.getPayee() != null ? transaction.getPayee().getPayeeId() : null)
				.payeeName(transaction.getPayee() != null ? transaction.getPayee().getPayeeName() : null)
				.amount(transaction.getAmount())
				.currency(transaction.getCurrency())
				.transactionType(transaction.getTransactionType())
				.status(transaction.getStatus())
				.description(transaction.getDescription())
				.timestamp(transaction.getTimestamp())
				.createdAt(transaction.getCreatedAt())
				.build();
	}

	private String toJson(Map<String, Object> details) {
		if (details == null || details.isEmpty()) {
			return null;
		}
		try {
			return OBJECT_MAPPER.writeValueAsString(details);
		} catch (Exception e) {
			throw new IllegalArgumentException("Unable to serialize alert details", e);
		}
	}

	private Map<String, Object> parseJson(String json) {
		if (json == null || json.isBlank()) {
			return Collections.emptyMap();
		}
		try {
			return OBJECT_MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {
			});
		} catch (Exception e) {
			throw new IllegalArgumentException("Unable to parse alert details JSON", e);
		}
	}
}
