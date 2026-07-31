package neueda.in.TransactionMonitoring.rule;

import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleEvaluationResultDTO;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Triggers when an account has too many transactions within a rolling time window.
 * Example: more than 5 transactions in 60 minutes.
 */
@Component
@RequiredArgsConstructor
public class VelocityEvaluator implements RuleEvaluator {

    private final TransactionRepository transactionRepository;

    @Override
    public boolean supports(RuleType ruleType) {
        return RuleType.VELOCITY.equals(ruleType);
    }

    @Override
    public RuleEvaluationResultDTO evaluate(Transaction transaction, Rule rule) {
        int windowMinutes = extractInteger(rule.getParameters(), 60, "velocityWindowMinutes", "velocity_window_minutes");
        int maxCount = extractInteger(rule.getParameters(), 5, "velocityCount", "velocity_count");

        LocalDateTime windowStart = transaction.getTransactionDate().minusMinutes(windowMinutes);
        long count = transactionRepository.countByAccountIdAndTransactionDateBetween(
                transaction.getAccountId(), windowStart, transaction.getTransactionDate());

        // The current transaction is included in count, so threshold is maxCount+1
        boolean matched = count > maxCount;

        Map<String, Object> details = new HashMap<>();
        details.put("transactionCountInWindow", count);
        details.put("maxAllowed", maxCount);
        details.put("windowMinutes", windowMinutes);
        details.put("windowStart", windowStart.toString());
        details.put("accountId", transaction.getAccountId());

        return RuleEvaluationResultDTO.builder()
                .ruleId(rule.getId())
                .ruleName(rule.getName())
                .ruleType(rule.getRuleType())
                .matched(matched)
                .matchReason(matched
                        ? String.format("High velocity: %d transactions in last %d minutes (max allowed: %d) for account %s",
                                count, windowMinutes, maxCount, transaction.getAccountId())
                        : "Transaction velocity within acceptable limits")
                .severity(Severity.valueOf(rule.getSeverity().name()))
                .matchDetails(details)
                .build();
    }

    private int extractInteger(Map<String, Object> parameters, int defaultValue, String... keys) {
        if (parameters == null) {
            return defaultValue;
        }
        for (String key : keys) {
            Object value = parameters.get(key);
            if (value != null) {
                try {
                    return Integer.parseInt(String.valueOf(value));
                } catch (NumberFormatException ignored) {
                    return defaultValue;
                }
            }
        }
        return defaultValue;
    }
}


