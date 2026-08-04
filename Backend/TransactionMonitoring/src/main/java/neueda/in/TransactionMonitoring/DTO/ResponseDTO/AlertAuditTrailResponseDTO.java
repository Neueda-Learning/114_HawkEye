package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import neueda.in.TransactionMonitoring.enums.AlertStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertAuditTrailResponseDTO {

    private Long id;
    private Long alertId;
    private AlertStatus previousStatus;
    private AlertStatus newStatus;
    private String changedBy;
    private String changeReason;
    private String notes;
    private LocalDateTime createdAt;
}

