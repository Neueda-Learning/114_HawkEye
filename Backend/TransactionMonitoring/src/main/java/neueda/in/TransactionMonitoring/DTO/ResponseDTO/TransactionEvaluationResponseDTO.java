package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Full evaluation response returned by POST /api/v1/rules/evaluate/{transactionId}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvaluationResponseDTO {

    private Long transactionId;
    private int rulesEvaluated;
    private int rulesMatched;
    private int alertsCreated;
    private List<RuleEvaluationResultDTO> evaluationResults;
    private List<AlertResponseDTO> createdAlerts;
}

