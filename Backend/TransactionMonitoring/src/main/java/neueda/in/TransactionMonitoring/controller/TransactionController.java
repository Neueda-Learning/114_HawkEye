package neueda.in.TransactionMonitoring.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.dto.request.TransactionRequestDTO;
import neueda.in.TransactionMonitoring.dto.response.AlertSummaryDTO;
import neueda.in.TransactionMonitoring.dto.response.ApiResponse;
import neueda.in.TransactionMonitoring.dto.response.PagedResponse;
import neueda.in.TransactionMonitoring.dto.response.TransactionDetailResponseDTO;
import neueda.in.TransactionMonitoring.dto.response.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import neueda.in.TransactionMonitoring.service.TransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
@Validated
public class TransactionController {

    private final TransactionService transactionService;

    // ────────────────────────────────────────────────────────────────────────
    // POST /api/v1/transactions
    // Creates a new transaction
    // Returns 201 CREATED
    // ────────────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> createTransaction(
            @Valid @RequestBody TransactionRequestDTO request) {

        log.info("POST /api/v1/transactions — account: {}, amount: {}",
                request.getAccountId(), request.getAmount());

        TransactionResponseDTO response = transactionService.createTransaction(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Transaction created successfully", 201));
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/v1/transactions
    // Paginated list with optional filters
    // Returns 200 OK
    // ────────────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponseDTO>>> getAllTransactions(
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) String payeeId,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "timestamp,desc") String sort) {

        log.info("GET /api/v1/transactions — page: {}, size: {}, accountId: {}", page, size, accountId);

        PagedResponse<TransactionResponseDTO> response = transactionService.getAllTransactions(
                accountId, status, transactionType, payeeId,
                minAmount, maxAmount, startDate, endDate,
                page, size, sort);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Transactions retrieved successfully", 200));
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/v1/transactions/{id}
    // Full transaction detail including linked alert summaries
    // Returns 200 OK | 404 NOT FOUND
    // ────────────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDetailResponseDTO>> getTransactionById(
            @PathVariable Long id) {

        log.info("GET /api/v1/transactions/{}", id);

        TransactionDetailResponseDTO response = transactionService.getTransactionById(id);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Transaction retrieved successfully", 200));
    }

    // ────────────────────────────────────────────────────────────────────────
    // GET /api/v1/transactions/{id}/alerts
    // All alerts linked to a transaction (read-only)
    // Returns 200 OK | 404 NOT FOUND
    // ────────────────────────────────────────────────────────────────────────
    @GetMapping("/{id}/alerts")
    public ResponseEntity<ApiResponse<List<AlertSummaryDTO>>> getAlertsByTransactionId(
            @PathVariable Long id) {

        log.info("GET /api/v1/transactions/{}/alerts", id);

        List<AlertSummaryDTO> alerts = transactionService.getAlertsByTransactionId(id);

        return ResponseEntity.ok(
                ApiResponse.success(alerts,
                        alerts.isEmpty()
                                ? "No alerts linked to this transaction"
                                : alerts.size() + " alert(s) found",
                        200));
    }
}

