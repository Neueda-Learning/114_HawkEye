package neueda.in.TransactionMonitoring.rule;

import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleEvaluationResultDTO;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Triggers when money is sent to a payee that this account has never transacted with before.
 */
@Component
@RequiredArgsConstructor
public class NewPayeeEvaluator implements RuleEvaluator {

    private final TransactionRepository transactionRepository;

    @Override
    public boolean supports(RuleType ruleType) {
        return RuleType.NEW_PAYEE.equals(ruleType);
    }

    @Override
    public RuleEvaluationResultDTO evaluate(Transaction transaction, Rule rule) {
        Map<String, Object> details = new HashMap<>();
        String accountId = transaction.getAccount().getAccountId();
        String payeeId = transaction.getPayee() != null ? transaction.getPayee().getPayeeId() : null;
        java.time.LocalDateTime eventTime = transaction.getTimestamp();

        if (payeeId == null || payeeId.isBlank()) {
            details.put("reason", "No payee account on transaction");
            return RuleEvaluationResultDTO.builder()
                    .ruleId(rule.getId())
                    .ruleName(rule.getName())
                    .ruleType(rule.getRuleType())
                    .matched(false)
                    .matchReason("No payee account specified on transaction")
                    .severity(Severity.valueOf(rule.getSeverity().name()))
                    .matchDetails(details)
                    .build();
        }

        long priorCount = transactionRepository.countPreviousTransactionsToPayee(accountId, payeeId, eventTime);

        boolean isNewPayee = priorCount == 0;

        details.put("payeeAccountId", payeeId);
        details.put("priorTransactionsToPayee", priorCount);
        details.put("accountId", accountId);

        return RuleEvaluationResultDTO.builder()
                .ruleId(rule.getId())
                .ruleName(rule.getName())
                .ruleType(rule.getRuleType())
                .matched(isNewPayee)
                .matchReason(isNewPayee
                        ? String.format("First-ever transaction from account %s to new payee %s",
                                accountId, payeeId)
                        : String.format("Payee %s is known (%d prior transactions)",
                                payeeId, priorCount))
                .severity(Severity.valueOf(rule.getSeverity().name()))
                .matchDetails(details)
                .build();
    }
}



