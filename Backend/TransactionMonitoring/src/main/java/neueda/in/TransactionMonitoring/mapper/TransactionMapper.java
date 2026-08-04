package neueda.in.TransactionMonitoring.mapper;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.entity.Transaction;
import org.springframework.stereotype.Component;
@Component
public class TransactionMapper {
    public TransactionResponseDTO toResponseDTO(Transaction t) {
        if (t == null) return null;
        return TransactionResponseDTO.builder()
            .id(t.getId())
            .accountId(t.getAccountId())
            .payeeId(t.getPayeeId())
            .amount(t.getAmount())
            .currency(t.getCurrency())
            .type(t.getType())
            .status(t.getStatus())
            .timestamp(t.getTimestamp())
            .description(t.getDescription())
            .createdAt(t.getCreatedAt())
            .build();
    }
}
