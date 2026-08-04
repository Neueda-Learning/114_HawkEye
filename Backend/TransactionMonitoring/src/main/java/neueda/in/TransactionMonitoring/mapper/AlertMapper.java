package neueda.in.TransactionMonitoring.mapper;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.entity.Alert;
import org.springframework.stereotype.Component;
@Component
public class AlertMapper {
    public AlertResponseDTO toResponseDTO(Alert alert) {
        if (alert == null) return null;
        return AlertResponseDTO.builder()
            .alertId(alert.getAlertId())
            .ruleId(alert.getRuleId())
            .accountId(alert.getAccount() != null ? alert.getAccount().getAccountId() : null)
            .transactionId(alert.getTransaction() != null ? alert.getTransaction().getTransactionId() : null)
            .alertStatus(alert.getAlertStatus())
            .severity(alert.getSeverity())
            .alertMessage(alert.getAlertMessage())
            .createdAt(alert.getCreatedAt())
            .updatedAt(alert.getUpdatedAt())
            .build();
    }
}
