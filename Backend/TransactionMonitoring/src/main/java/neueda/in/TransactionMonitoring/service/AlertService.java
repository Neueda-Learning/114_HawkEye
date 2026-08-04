package neueda.in.TransactionMonitoring.service;
import com.fasterxml.jackson.core.JsonProcessingException;
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
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.event.AlertCreatedEvent;
import neueda.in.TransactionMonitoring.repository.AlertRepository;
import neueda.in.TransactionMonitoring.repository.RuleRepository;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Map;
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final AlertRepository alertRepository;
    private final TransactionRepository transactionRepository;
    private final RuleRepository ruleRepository;
    private final ApplicationEventPublisher eventPublisher;
    // =========================================================================
    // PERSON 3 - Alert Creation
    // =========================================================================
    @Transactional
    public AlertResponseDTO createAlert(AlertCreationRequestDTO request) {
        if (alertRepository.existsByRuleIdAndTransaction_TransactionId(
                request.getRuleId(), request.getTransactionId())) {
            log.warn("Duplicate alert skipped - ruleId={} transactionId={}", request.getRuleId(), request.getTransactionId());
            return null;
        }
        Rule rule = ruleRepository.findById(request.getRuleId())
                .orElseThrow(() -> new EntityNotFoundException("Rule not found: " + request.getRuleId()));
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found: " + request.getTransactionId()));
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
        log.info("Alert created - alertId={} ruleId={} transactionId={}", saved.getAlertId(), rule.getId(), transaction.getTransactionId());
        AlertResponseDTO response = toResponseDTO(saved, rule);
        eventPublisher.publishEvent(new AlertCreatedEvent(this, response));
        return response;
    }
    // =========================================================================
    // PERSON 4 - Alert Lifecycle Management
    // =========================================================================
    @Transactional(readOnly = true)
    public AlertResponseDTO getAlertById(Long id) {
        return toResponseDTO(findOrThrow(id), null);
    }
    @Transactional(readOnly = true)
    public PagedResponseDTO<AlertResponseDTO> getAlerts(AlertStatus status, Severity severity, int page, int size) {
        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Alert> result;
        if (status != null && severity != null) result = alertRepository.findByAlertStatusAndSeverity(status, severity, pageable);
        else if (status != null) result = alertRepository.findByAlertStatus(status, pageable);
        else if (severity != null) result = alertRepository.findBySeverity(severity, pageable);
        else result = alertRepository.findAll(pageable);
        return buildPagedResponse(result);
    }
    @Transactional(readOnly = true)
    public AlertStatsResponseDTO getStats() {
        return AlertStatsResponseDTO.builder()
            .open(alertRepository.countByAlertStatus(AlertStatus.OPEN))
            .acknowledged(alertRepository.countByAlertStatus(AlertStatus.ACKNOWLEDGED))
            .investigating(alertRepository.countByAlertStatus(AlertStatus.INVESTIGATING))
            .closed(alertRepository.countByAlertStatus(AlertStatus.CLOSED))
            .dismissed(alertRepository.countByAlertStatus(AlertStatus.DISMISSED))
            .total(alertRepository.count())
            .build();
    }
    @Transactional(readOnly = true)
    public PagedResponseDTO<AlertResponseDTO> getAlertHistory(Severity severity, int page, int size) {
        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size);
        Page<Alert> result = severity != null
            ? alertRepository.findHistoryBySeverity(severity, pageable)
            : alertRepository.findHistory(pageable);
        return buildPagedResponse(result);
    }
    @Transactional
    public AlertResponseDTO acknowledgeAlert(Long id) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() != AlertStatus.OPEN)
            throw new IllegalStateException("Alert must be OPEN to acknowledge. Current: " + alert.getAlertStatus());
        alert.setAlertStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        log.info("Alert acknowledged - alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    @Transactional
    public AlertResponseDTO startInvestigation(Long id) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() != AlertStatus.ACKNOWLEDGED)
            throw new IllegalStateException("Alert must be ACKNOWLEDGED to investigate. Current: " + alert.getAlertStatus());
        alert.setAlertStatus(AlertStatus.INVESTIGATING);
        alert.setInvestigatingAt(LocalDateTime.now());
        log.info("Alert investigating - alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    @Transactional
    public AlertResponseDTO closeAlert(Long id, AlertStatusUpdateDTO dto) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() != AlertStatus.INVESTIGATING)
            throw new IllegalStateException("Alert must be INVESTIGATING to close. Current: " + alert.getAlertStatus());
        alert.setAlertStatus(AlertStatus.CLOSED);
        alert.setClosedAt(LocalDateTime.now());
        if (dto != null && dto.getResolutionNotes() != null) alert.setClosedReason(dto.getResolutionNotes());
        log.info("Alert closed - alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    @Transactional
    public AlertResponseDTO dismissAlert(Long id, AlertStatusUpdateDTO dto) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() == AlertStatus.CLOSED || alert.getAlertStatus() == AlertStatus.DISMISSED)
            throw new IllegalStateException("Cannot dismiss a CLOSED or DISMISSED alert.");
        alert.setAlertStatus(AlertStatus.DISMISSED);
        alert.setClosedAt(LocalDateTime.now());
        if (dto != null && dto.getResolutionNotes() != null) alert.setClosedReason("DISMISSED: " + dto.getResolutionNotes());
        log.info("Alert dismissed - alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    // =========================================================================
    // Helpers
    // =========================================================================
    private Alert findOrThrow(Long id) {
        return alertRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));
    }
    private PagedResponseDTO<AlertResponseDTO> buildPagedResponse(Page<Alert> page) {
        return PagedResponseDTO.<AlertResponseDTO>builder()
            .content(page.getContent().stream().map(a -> toResponseDTO(a, null)).toList())
            .page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).last(page.isLast())
            .build();
    }
    private AlertResponseDTO toResponseDTO(Alert alert, Rule rule) {
        return AlertResponseDTO.builder()
            .alertId(alert.getAlertId())
            .ruleId(alert.getRuleId())
            .ruleName(rule != null ? rule.getName() : null)
            .accountId(alert.getAccount() != null ? alert.getAccount().getAccountId() : null)
            .transactionId(alert.getTransaction() != null ? alert.getTransaction().getTransactionId() : null)
            .alertStatus(alert.getAlertStatus())
            .severity(alert.getSeverity())
            .alertMessage(alert.getAlertMessage())
            .alertDetails(parseJson(alert.getAlertDetails()))
            .createdAt(alert.getCreatedAt())
            .updatedAt(alert.getUpdatedAt())
            .build();
    }
    private String toJson(Map<String, Object> details) {
        if (details == null || details.isEmpty()) return null;
        try {
            return OBJECT_MAPPER.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Unable to serialize alert details", e);
        }
    }
    private Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Unable to parse alert details JSON", e);
        }
    }
}