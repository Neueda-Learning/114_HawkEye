package neueda.in.TransactionMonitoring.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import neueda.in.TransactionMonitoring.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request body for POST /api/v1/transactions
 */
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

    // Optional: if provided, auto-create payee with this name
    private String payeeName;

    // Optional: payee category e.g. VENDOR, MERCHANT
    private String payeeType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 integer digits and 2 decimal places")
    private BigDecimal amount;

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code (e.g. USD)")
    @Builder.Default
    private String currency = "USD";

    @NotNull(message = "Transaction type is required (DEBIT or CREDIT)")
    private TransactionType transactionType;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    // Optional — defaults to current time if not provided
    private LocalDateTime timestamp;
}

