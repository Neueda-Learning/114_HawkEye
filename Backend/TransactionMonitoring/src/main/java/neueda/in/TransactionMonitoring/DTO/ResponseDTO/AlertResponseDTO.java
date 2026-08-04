package neueda.in.TransactionMonitoring.DTO.ResponseDTO;
import lombok.Builder;
import lombok.Data;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import java.time.Instant;
import java.util.List;
@Data
@Builder
public class AlertResponseDTO {
    private String id;
    private String ruleId;
    private String ruleName;
    private AlertStatus status;
    private AlertSeverity severity;
    private String description;
    private String resolutionNotes;
    private List<TransactionResponseDTO> transactions;
    private Instant createdAt;
    private Instant acknowledgedAt;
    private Instant investigatingAt;
    private Instant closedAt;
    private Instant dismissedAt;
}
