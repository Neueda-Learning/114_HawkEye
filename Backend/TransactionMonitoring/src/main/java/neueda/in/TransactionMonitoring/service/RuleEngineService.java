package neueda.in.TransactionMonitoring.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertCreationRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleEvaluationResultDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionEvaluationResponseDTO;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.event.TransactionRecordedEvent;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.repository.RuleRepository;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import neueda.in.TransactionMonitoring.rule.RuleEvaluator;
import neueda.in.TransactionMonitoring.rule.RuleEvaluatorFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Person 3 — Rule Engine Service.
 * Core responsibilities:
 *  1. Listen for TransactionRecordedEvent (auto-evaluation pipeline)
 *  2. Evaluate all active rules against the transaction
 *  3. Build AlertCreationRequestDTO payloads for every matching rule
 *  4. Delegate alert persistence to AlertService
 *  5. Return a full evaluation report (used by the debug endpoint and the event response)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RuleEngineService {

    private final RuleRepository ruleRepository;
    private final TransactionRepository transactionRepository;
    private final AlertService alertService;
    private final RuleEvaluatorFactory evaluatorFactory;

    // ── Auto-evaluation via application event ─────────────────────────────────

    /**
     * Triggered automatically when Person 1 publishes a TransactionRecordedEvent.
     */
    @EventListener
    public void onTransactionRecorded(TransactionRecordedEvent event) {
        log.info("TransactionRecordedEvent received — transactionId={}", event.getTransactionId());
        evaluateTransaction(event.getTransactionId());
    }

    // ── Core evaluation logic ─────────────────────────────────────────────────

    /**
     * Evaluates all active rules against the given transaction.
     * Creates alerts for every matched rule (duplicates are suppressed by AlertService).
     *
     * @param transactionId the ID of the transaction to evaluate
     * @return full evaluation report
     */
    @Transactional
    public TransactionEvaluationResponseDTO evaluateTransaction(Long transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Transaction not found with id: " + transactionId));

        List<Rule> activeRules = ruleRepository.findByStatus(RuleStatus.ACTIVE);
        log.debug("Evaluating transactionId={} against {} active rules", transactionId, activeRules.size());

        List<RuleEvaluationResultDTO> results       = new ArrayList<>();
        List<AlertResponseDTO>        createdAlerts = new ArrayList<>();

        for (Rule rule : activeRules) {
            try {
                RuleEvaluator evaluator = evaluatorFactory.getEvaluator(rule.getRuleType());
                RuleEvaluationResultDTO result = evaluator.evaluate(transaction, rule);
                results.add(result);

                if (result.isMatched()) {
                    AlertCreationRequestDTO alertRequest = buildAlertRequest(transaction, rule, result);
                    AlertResponseDTO alertResponse = alertService.createAlert(alertRequest);
                    if (alertResponse != null) {
                        createdAlerts.add(alertResponse);
                    }
                }

            } catch (IllegalArgumentException e) {
                log.warn("Skipping rule {} ({}): {}", rule.getId(), rule.getRuleType(), e.getMessage());
            } catch (Exception e) {
                log.error("Error evaluating rule {} for transaction {}: {}",
                        rule.getId(), transactionId, e.getMessage(), e);
            }
        }

        long matchedCount = results.stream().filter(RuleEvaluationResultDTO::isMatched).count();
        log.info("Evaluation complete — transactionId={} rules={} matched={} alertsCreated={}",
                transactionId, activeRules.size(), matchedCount, createdAlerts.size());

        return TransactionEvaluationResponseDTO.builder()
                .transactionId(transactionId)
                .rulesEvaluated(activeRules.size())
                .rulesMatched((int) matchedCount)
                .alertsCreated(createdAlerts.size())
                .evaluationResults(results)
                .createdAlerts(createdAlerts)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AlertCreationRequestDTO buildAlertRequest(Transaction transaction,
                                                       Rule rule,
                                                       RuleEvaluationResultDTO result) {
        return AlertCreationRequestDTO.builder()
                .ruleId(rule.getId())
                .accountId(transaction.getAccountId())
                .transactionId(transaction.getTransactionId())
                .severity(result.getSeverity())
                .alertMessage(result.getMatchReason())
                .alertDetails(result.getMatchDetails())
                .build();
    }
}


