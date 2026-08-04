package neueda.in.TransactionMonitoring.DTO.RequestDTO;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
@Data
public class TransactionRequestDTO {
    @NotBlank(message = "Account ID is required")
    @Size(max = 50)
    private String accountId;
    @NotBlank(message = "Payee ID is required")
    @Size(max = 50)
    private String payeeId;
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    private String currency = "USD";
    @NotNull(message = "Transaction type is required (DEBIT or CREDIT)")
    private TransactionType type;
    @Size(max = 500)
    private String description;
    private Instant timestamp;
}
