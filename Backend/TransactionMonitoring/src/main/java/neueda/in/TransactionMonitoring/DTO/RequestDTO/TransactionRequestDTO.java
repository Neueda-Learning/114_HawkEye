package neueda.in.TransactionMonitoring.DTO.RequestDTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import neueda.in.TransactionMonitoring.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequestDTO {
	@NotBlank(message = "Account ID is required")
	@Size(max = 50, message = "Account ID must not exceed 50 characters")
	private String accountId;

	@NotBlank(message = "Payee ID is required")
	@Size(max = 100, message = "Payee ID must not exceed 100 characters")
	private String payeeId;

	private String payeeName;
	private String payeeType;

	@NotNull(message = "Amount is required")
	@DecimalMin(value = "0.01", message = "Amount must be greater than 0")
	@Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 integer digits and 2 decimal places")
	private BigDecimal amount;

	@Builder.Default
	@Size(min = 3, max = 3, message = "Currency must be a 3-letter code (e.g. USD)")
	private String currency = "USD";

	@NotNull(message = "Transaction type is required (DEBIT or CREDIT)")
	private TransactionType transactionType;

	@Size(max = 500, message = "Description must not exceed 500 characters")
	private String description;

	private LocalDateTime timestamp;
}
