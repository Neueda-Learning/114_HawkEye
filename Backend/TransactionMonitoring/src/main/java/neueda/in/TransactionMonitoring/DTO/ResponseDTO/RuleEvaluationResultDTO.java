package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.enums.Severity;

import java.util.Map;

/**
 * Result of evaluating a single rule against a transaction.
 * Produced by each RuleEvaluator implementation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleEvaluationResultDTO {

    private Long ruleId;
    private String ruleName;
    private RuleType ruleType;

    /** Whether the rule was triggered */
    private boolean matched;

    /** Human-readable reason explaining the match (used as alert_message) */
    private String matchReason;

    private Severity severity;

    /** Contextual data that becomes alert_details JSON */
    private Map<String, Object> matchDetails;
}

