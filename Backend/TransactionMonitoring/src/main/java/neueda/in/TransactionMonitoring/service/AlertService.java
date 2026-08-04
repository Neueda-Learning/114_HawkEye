package neueda.in.TransactionMonitoring.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertCreationRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.event.AlertCreatedEvent;
import neueda.in.TransactionMonitoring.repository.AlertRepository;
import neueda.in.TransactionMonitoring.repository.RuleRepository;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Person 3 â€” Alert Service.
 * Responsible for persisting new alert records and publishing AlertCreatedEvent.
 * Does NOT handle lifecycle actions (acknowledge / close / dismiss) â€” those belong to Person 4.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final AlertRepository alertRepository;
    private final TransactionRepository transactionRepository;
    private final RuleRepository ruleRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Creates a new alert record from the given request payload.
     * Returns null (and logs a warning) if a duplicate alert already exists
     * for the same rule + transaction combination.
     */
    @Transactional
    public AlertResponseDTO createAlert(AlertCreationRequestDTO request) {

        // â”€â”€ Duplicate prevention â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (alertRepository.existsByRuleIdAndTransaction_TransactionId(
                request.getRuleId(), request.getTransactionId())) {
            log.warn("Duplicate alert skipped â€” ruleId={} transactionId={}",
                    request.getRuleId(), request.getTransactionId());
            return null;
        }

        // â”€â”€ Resolve FK entities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        Rule rule = ruleRepository.findById(request.getRuleId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Rule not found with id: " + request.getRuleId()));

        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Transaction not found with id: " + request.getTransactionId()));

        // â”€â”€ Build and persist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        log.info("Alert created â€” alertId={} ruleId={} transactionId={} severity={}",
                saved.getAlertId(), rule.getId(), transaction.getTransactionId(), saved.getSeverity());

        // â”€â”€ Publish event for Person 4 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        AlertResponseDTO response = toResponseDTO(saved, rule);
        eventPublisher.publishEvent(new AlertCreatedEvent(this, response));
        return response;
    }

    // â”€â”€ Mapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private AlertResponseDTO toResponseDTO(Alert alert, Rule rule) {
        return AlertResponseDTO.builder()
                .alertId(alert.getAlertId())
                .ruleId(alert.getRuleId())
                .ruleName(rule != null ? rule.getName() : null)
                .accountId(alert.getAccount() != null ? alert.getAccount().getAccountId() : null)
                .transactionId(alert.getTransaction().getTransactionId())
                .alertStatus(alert.getAlertStatus())
                .severity(alert.getSeverity())
                .alertMessage(alert.getAlertMessage())
                .alertDetails(parseJson(alert.getAlertDetails()))
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .build();
    }

    private String toJson(java.util.Map<String, Object> details) {
        if (details == null || details.isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(details);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Unable to serialize alert details", e);
        }
    }

    private java.util.Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(json, new TypeReference<java.util.Map<String, Object>>() { });
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Unable to parse alert details JSON", e);
        }
    }
}
    // ═══════════════════════════════════════════════════════════════════════
    // ALERT LIFECYCLE MANAGEMENT (Person 4 — Alert Monitoring)
    // ═══════════════════════════════════════════════════════════════════════
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Alert not found: " + id));
        return toResponseDTO(alert, null);
    }
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO<neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO> getAlerts(
            neueda.in.TransactionMonitoring.enums.AlertStatus status,
            neueda.in.TransactionMonitoring.enums.Severity severity,
            int page, int size) {
        size = Math.min(size, 100);
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        org.springframework.data.domain.Page<Alert> result;
        if (status != null && severity != null) result = alertRepository.findByAlertStatusAndSeverity(status, severity, pageable);
        else if (status != null) result = alertRepository.findByAlertStatus(status, pageable);
        else if (severity != null) result = alertRepository.findBySeverity(severity, pageable);
        else result = alertRepository.findAll(pageable);
        return buildPagedResponse(result);
    }
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO getStats() {
        return neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO.builder()
            .open(alertRepository.countByAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.OPEN))
            .acknowledged(alertRepository.countByAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.ACKNOWLEDGED))
            .investigating(alertRepository.countByAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.INVESTIGATING))
            .closed(alertRepository.countByAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.CLOSED))
            .dismissed(alertRepository.countByAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.DISMISSED))
            .total(alertRepository.count())
            .build();
    }
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO<neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO> getAlertHistory(
            neueda.in.TransactionMonitoring.enums.Severity severity, int page, int size) {
        size = Math.min(size, 100);
        org.springframework.data.domain.PageRequest pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Alert> result = severity != null
            ? alertRepository.findHistoryBySeverity(severity, pageable)
            : alertRepository.findHistory(pageable);
        return buildPagedResponse(result);
    }
    @Transactional
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO acknowledgeAlert(Long id) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() != neueda.in.TransactionMonitoring.enums.AlertStatus.OPEN)
            throw new IllegalStateException("Alert must be OPEN to acknowledge. Current: " + alert.getAlertStatus());
        alert.setAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(java.time.LocalDateTime.now());
        log.info("Alert acknowledged — alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    @Transactional
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO startInvestigation(Long id) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() != neueda.in.TransactionMonitoring.enums.AlertStatus.ACKNOWLEDGED)
            throw new IllegalStateException("Alert must be ACKNOWLEDGED to investigate. Current: " + alert.getAlertStatus());
        alert.setAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.INVESTIGATING);
        alert.setInvestigatingAt(java.time.LocalDateTime.now());
        log.info("Alert investigation started — alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    @Transactional
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO closeAlert(Long id, neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO dto) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() != neueda.in.TransactionMonitoring.enums.AlertStatus.INVESTIGATING)
            throw new IllegalStateException("Alert must be INVESTIGATING to close. Current: " + alert.getAlertStatus());
        alert.setAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.CLOSED);
        alert.setClosedAt(java.time.LocalDateTime.now());
        if (dto != null && dto.getResolutionNotes() != null) alert.setClosedReason(dto.getResolutionNotes());
        log.info("Alert closed — alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    @Transactional
    public neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO dismissAlert(Long id, neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO dto) {
        Alert alert = findOrThrow(id);
        if (alert.getAlertStatus() == neueda.in.TransactionMonitoring.enums.AlertStatus.CLOSED
         || alert.getAlertStatus() == neueda.in.TransactionMonitoring.enums.AlertStatus.DISMISSED)
            throw new IllegalStateException("Cannot dismiss a CLOSED or already DISMISSED alert.");
        alert.setAlertStatus(neueda.in.TransactionMonitoring.enums.AlertStatus.DISMISSED);
        alert.setClosedAt(java.time.LocalDateTime.now());
        if (dto != null && dto.getResolutionNotes() != null) alert.setClosedReason("DISMISSED: " + dto.getResolutionNotes());
        log.info("Alert dismissed — alertId={}", id);
        return toResponseDTO(alertRepository.save(alert), null);
    }
    private Alert findOrThrow(Long id) {
        return alertRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Alert not found: " + id));
    }
    private neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO<neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO> buildPagedResponse(
            org.springframework.data.domain.Page<Alert> page) {
        return neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO.<neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO>builder()
            .content(page.getContent().stream().map(a -> toResponseDTO(a, null)).toList())
            .page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).last(page.isLast())
            .build();
    }
}
