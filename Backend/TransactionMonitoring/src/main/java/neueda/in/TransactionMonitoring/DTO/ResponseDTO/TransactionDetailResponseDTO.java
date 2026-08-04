package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.*;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Used in:
 *  - GET /api/v1/transactions/{id}
 * Includes all transaction fields + linked alert summaries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailResponseDTO {

    // ── Transaction fields ────────────────────────────────────────────────
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

    // ── Linked alerts (read-only summary) ────────────────────────────────
    private List<AlertSummaryDTO> alerts;
}

