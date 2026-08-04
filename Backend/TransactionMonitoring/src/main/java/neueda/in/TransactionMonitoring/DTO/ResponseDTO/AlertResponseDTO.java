package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Alert response payload handed off to Person 4 (Alert Management).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponseDTO {

    private Long alertId;
    private Long ruleId;
    private String ruleName;
    private String accountId;
    private Long transactionId;
    private AlertStatus alertStatus;
    private Severity severity;
    private String alertMessage;
    private Map<String, Object> alertDetails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

