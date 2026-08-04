package neueda.in.TransactionMonitoring.DTO.ResponseDTO;
import lombok.Builder;
import lombok.Data;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
@Data
@Builder
public class TransactionResponseDTO {
    private String id;
    private String accountId;
    private String payeeId;
    private BigDecimal amount;
    private String currency;
    private TransactionType type;
    private TransactionStatus status;
    private Instant timestamp;
    private String description;
    private Instant createdAt;
}
