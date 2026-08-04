package neueda.in.TransactionMonitoring.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionEvaluationResponseDTO;
import neueda.in.TransactionMonitoring.service.RuleEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Person 3 — Rule Engine Controller.
 * Exposes a single debug/testing endpoint for manually triggering rule evaluation.
 * In production, evaluation is driven automatically via TransactionRecordedEvent.
 */
@RestController
@RequestMapping("/api/v1/rules")
@RequiredArgsConstructor
@Slf4j
public class RuleEngineController {

    private final RuleEngineService ruleEngineService;

    /**
     * POST /api/v1/rules/evaluate/{transactionId}
     *
     * Manually triggers rule evaluation for a transaction.
     * Useful for debugging, re-evaluation, and integration testing.
     *
     * @param transactionId the ID of the transaction to evaluate
     * @return evaluation report with all rule results and any created alerts
     */
    @PostMapping("/evaluate/{transactionId}")
    public ResponseEntity<TransactionEvaluationResponseDTO> evaluateTransaction(
            @PathVariable Long transactionId) {
        log.info("Manual evaluation triggered for transactionId={}", transactionId);
        TransactionEvaluationResponseDTO response = ruleEngineService.evaluateTransaction(transactionId);
        return ResponseEntity.ok(response);
    }
}

