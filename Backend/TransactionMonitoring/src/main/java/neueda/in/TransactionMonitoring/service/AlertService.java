package neueda.in.TransactionMonitoring.service;

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
 * Person 3 — Alert Service.
 * Responsible for persisting new alert records and publishing AlertCreatedEvent.
 * Does NOT handle lifecycle actions (acknowledge / close / dismiss) — those belong to Person 4.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

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

        // ── Duplicate prevention ──────────────────────────────────────────────
        if (alertRepository.existsByRule_IdAndTransaction_TransactionId(
                request.getRuleId(), request.getTransactionId())) {
            log.warn("Duplicate alert skipped — ruleId={} transactionId={}",
                    request.getRuleId(), request.getTransactionId());
            return null;
        }

        // ── Resolve FK entities ───────────────────────────────────────────────
        Rule rule = ruleRepository.findById(request.getRuleId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Rule not found with id: " + request.getRuleId()));

        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Transaction not found with id: " + request.getTransactionId()));

        // ── Build and persist ─────────────────────────────────────────────────
        Alert alert = Alert.builder()
                .rule(rule)
                .accountId(request.getAccountId())
                .transaction(transaction)
                .alertStatus(AlertStatus.OPEN)
                .severity(request.getSeverity())
                .alertMessage(request.getAlertMessage())
                .alertDetails(request.getAlertDetails())
                .build();

        Alert saved = alertRepository.save(alert);
        log.info("Alert created — alertId={} ruleId={} transactionId={} severity={}",
                saved.getAlertId(), rule.getId(), transaction.getTransactionId(), saved.getSeverity());

        // ── Publish event for Person 4 ────────────────────────────────────────
        AlertResponseDTO response = toResponseDTO(saved);
        eventPublisher.publishEvent(new AlertCreatedEvent(this, response));
        return response;
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private AlertResponseDTO toResponseDTO(Alert alert) {
        return AlertResponseDTO.builder()
                .alertId(alert.getAlertId())
                .ruleId(alert.getRule().getId())
                .ruleName(alert.getRule().getName())
                .accountId(alert.getAccountId())
                .transactionId(alert.getTransaction().getTransactionId())
                .alertStatus(alert.getAlertStatus())
                .severity(alert.getSeverity())
                .alertMessage(alert.getAlertMessage())
                .alertDetails(alert.getAlertDetails())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .build();
    }
}


