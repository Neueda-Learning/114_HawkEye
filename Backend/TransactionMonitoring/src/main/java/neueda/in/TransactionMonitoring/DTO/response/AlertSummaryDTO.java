package neueda.in.TransactionMonitoring.dto.response;

import lombok.*;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;

import java.time.LocalDateTime;

/**
 * Read-only alert summary returned inside transaction detail response.
 * Full alert lifecycle data is managed by Person 2 (Alerts Domain).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertSummaryDTO {

    private Long alertId;
    private Long ruleId;
    private AlertStatus alertStatus;
    private Severity severity;
    private String alertMessage;
    private LocalDateTime createdAt;
}

