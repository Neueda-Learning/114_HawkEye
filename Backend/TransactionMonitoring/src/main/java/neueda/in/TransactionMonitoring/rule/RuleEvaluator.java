package neueda.in.TransactionMonitoring.rule;

import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleEvaluationResultDTO;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.RuleType;

/**
 * Strategy interface for rule evaluation.
 * Each implementation handles one RuleType.
 */
public interface RuleEvaluator {

    /** Returns true if this evaluator handles the given rule type */
    boolean supports(RuleType ruleType);

    /**
     * Evaluates the transaction against the rule.
     *
     * @param transaction the transaction being checked
     * @param rule        the rule definition with thresholds/parameters
     * @return evaluation result with match flag, reason text, and context details
     */
    RuleEvaluationResultDTO evaluate(Transaction transaction, Rule rule);
}

