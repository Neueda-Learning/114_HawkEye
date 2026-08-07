package neueda.in.TransactionMonitoring.rule;

import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleEvaluationResultDTO;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Triggers when the cumulative transaction total for an account exceeds the configured daily limit.
 */
@Component
@RequiredArgsConstructor
public class DailyLimitEvaluator implements RuleEvaluator {

    private final TransactionRepository transactionRepository;

    @Override
    public boolean supports(RuleType ruleType) {
        return RuleType.DAILY_LIMIT.equals(ruleType);
    }

    @Override
    public RuleEvaluationResultDTO evaluate(Transaction transaction, Rule rule) {
        BigDecimal dailyLimitAmount = extractBigDecimal(rule.getParameters(), "dailyLimitAmount", "daily_limit_amount");
        String accountId = transaction.getAccount().getAccountId();
        LocalDateTime eventTime = transaction.getTimestamp();
        LocalDateTime startOfDay = eventTime.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        List<Transaction> dailyTransactions = transactionRepository
                .findByAccount_AccountIdOrderByTimestampDesc(accountId)
                .stream()
                .filter(t -> t.getTimestamp() != null)
                .filter(t -> !t.getTimestamp().isBefore(startOfDay) && t.getTimestamp().isBefore(endOfDay))
                .collect(Collectors.toList());

        BigDecimal dailyTotal = dailyTransactions.stream()
                .map(Transaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean matched = dailyLimitAmount != null
                && dailyTotal.compareTo(dailyLimitAmount) > 0;

        Map<String, Object> details = new HashMap<>();
        details.put("dailyTotal", dailyTotal);
        details.put("dailyLimit", dailyLimitAmount);
        details.put("transactionsToday", dailyTransactions.size());
        details.put("accountId", accountId);
        details.put("date", startOfDay.toLocalDate().toString());
        details.put("linkedTransactionIds", dailyTransactions.stream()
                .map(Transaction::getTransactionId)
                .toList());

        return RuleEvaluationResultDTO.builder()
                .ruleId(rule.getId())
                .ruleName(rule.getName())
                .ruleType(rule.getRuleType())
                .matched(matched)
                .matchReason(matched
                        ? String.format("Daily cumulative total %.2f exceeds limit %.2f for account %s on %s",
                                dailyTotal, dailyLimitAmount,
                                accountId,
                                startOfDay.toLocalDate())
                        : String.format("Daily total %.2f is within limit %.2f",
                                dailyTotal, dailyLimitAmount))
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



