package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.*;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Used in:
 *  - POST /api/v1/transactions  (creation response)
 *  - GET  /api/v1/transactions  (paginated list items)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDTO {

    private Long transactionId;
    private String accountId;
    private String accountName;
    private String payeeId;
    private String payeeName;
    private BigDecimal amount;
    private String currency;
    private TransactionType transactionType;
    private TransactionStatus status;
    private String description;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}

