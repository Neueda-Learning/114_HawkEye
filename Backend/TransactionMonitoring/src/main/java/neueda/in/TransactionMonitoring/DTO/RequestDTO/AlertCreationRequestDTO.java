package neueda.in.TransactionMonitoring.DTO.RequestDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import neueda.in.TransactionMonitoring.enums.Severity;

import java.util.Map;

/**
 * Internal DTO used by RuleEngineService to request alert creation from AlertService.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertCreationRequestDTO {

    private Long ruleId;
    private String accountId;
    private Long transactionId;
    private Severity severity;
    private String alertMessage;
    private Map<String, Object> alertDetails;
}

