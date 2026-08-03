package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.dto.request.TransactionRequestDTO;
import neueda.in.TransactionMonitoring.dto.response.AlertSummaryDTO;
import neueda.in.TransactionMonitoring.dto.response.PagedResponse;
import neueda.in.TransactionMonitoring.dto.response.TransactionDetailResponseDTO;
import neueda.in.TransactionMonitoring.dto.response.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {

    /**
     * POST /api/v1/transactions
     * Validates, saves, and returns the created transaction.
     */
    TransactionResponseDTO createTransaction(TransactionRequestDTO request);

    /**
     * GET /api/v1/transactions
     * Returns a paginated, filterable list of transactions.
     */
    PagedResponse<TransactionResponseDTO> getAllTransactions(
            String accountId,
            TransactionStatus status,
            TransactionType transactionType,
            String payeeId,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size,
            String sort
    );

    /**
     * GET /api/v1/transactions/{id}
     * Returns full transaction detail including linked alert summaries.
     */
    TransactionDetailResponseDTO getTransactionById(Long id);

    /**
     * GET /api/v1/transactions/{id}/alerts
     * Returns all alerts linked to a transaction (read-only).
     */
    List<AlertSummaryDTO> getAlertsByTransactionId(Long id);
}

