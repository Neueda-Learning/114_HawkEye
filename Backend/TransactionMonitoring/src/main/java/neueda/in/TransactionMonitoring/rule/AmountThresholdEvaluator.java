package neueda.in.TransactionMonitoring.rule;

import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleEvaluationResultDTO;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.enums.Severity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Triggers when a single transaction amount exceeds the configured threshold.
 */
@Component
public class AmountThresholdEvaluator implements RuleEvaluator {

    @Override
    public boolean supports(RuleType ruleType) {
        return RuleType.AMOUNT_THRESHOLD.equals(ruleType);
    }

    @Override
    public RuleEvaluationResultDTO evaluate(Transaction transaction, Rule rule) {
        BigDecimal thresholdAmount = extractBigDecimal(rule.getParameters(), "thresholdAmount", "threshold_amount");
        boolean matched = transaction.getAmount() != null
                && thresholdAmount != null
                && transaction.getAmount().compareTo(thresholdAmount) > 0;

        Map<String, Object> details = new HashMap<>();
        details.put("transactionAmount", transaction.getAmount());
        details.put("thresholdAmount", thresholdAmount);
        details.put("accountId", transaction.getAccountId());

        return RuleEvaluationResultDTO.builder()
                .ruleId(rule.getId())
                .ruleName(rule.getName())
                .ruleType(rule.getRuleType())
                .matched(matched)
                .matchReason(matched
                        ? String.format("Transaction amount %.2f exceeds threshold %.2f for rule '%s'",
                                transaction.getAmount(), thresholdAmount, rule.getName())
                        : String.format("Amount %.2f is within threshold %.2f",
                                transaction.getAmount(), thresholdAmount))
                .severity(Severity.valueOf(rule.getSeverity().name()))
                .matchDetails(details)
                .build();
    }

    private BigDecimal extractBigDecimal(Map<String, Object> parameters, String... keys) {
        if (parameters == null) {
            return null;
        }
        for (String key : keys) {
            Object value = parameters.get(key);
            if (value != null) {
                try {
                    return new BigDecimal(String.valueOf(value));
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }
}


