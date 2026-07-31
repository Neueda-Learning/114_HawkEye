package neueda.in.TransactionMonitoring.rule;

import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Resolves the correct RuleEvaluator for a given RuleType.
 * Spring auto-injects all RuleEvaluator beans via the list.
 */
@Component
@RequiredArgsConstructor
public class RuleEvaluatorFactory {

    private final List<RuleEvaluator> evaluators;

    /**
     * Returns the evaluator that supports the given rule type.
     *
     * @throws IllegalArgumentException if no evaluator is registered for the type
     */
    public RuleEvaluator getEvaluator(RuleType ruleType) {
        return evaluators.stream()
                .filter(e -> e.supports(ruleType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No RuleEvaluator registered for rule type: " + ruleType));
    }
}

