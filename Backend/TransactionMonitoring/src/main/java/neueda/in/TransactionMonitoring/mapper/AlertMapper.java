package neueda.in.TransactionMonitoring.mapper;
import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.entity.Alert;
import org.springframework.stereotype.Component;
import java.util.List;
@Component
@RequiredArgsConstructor
public class AlertMapper {
    private final TransactionMapper transactionMapper;
    public AlertResponseDTO toResponseDTO(Alert alert) {
        if (alert == null) return null;
        return AlertResponseDTO.builder()
            .id(alert.getId())
            .ruleId(alert.getRule() != null ? alert.getRule().getId() : null)
            .ruleName(alert.getRuleName())
            .status(alert.getStatus())
            .severity(alert.getSeverity())
            .description(alert.getDescription())
            .resolutionNotes(alert.getResolutionNotes())
            .transactions(
                alert.getTransactions() == null ? List.of() :
                alert.getTransactions().stream()
                    .map(transactionMapper::toResponseDTO)
                    .toList()
            )
            .createdAt(alert.getCreatedAt())
            .acknowledgedAt(alert.getAcknowledgedAt())
            .investigatingAt(alert.getInvestigatingAt())
            .closedAt(alert.getClosedAt())
            .dismissedAt(alert.getDismissedAt())
            .build();
    }
}
