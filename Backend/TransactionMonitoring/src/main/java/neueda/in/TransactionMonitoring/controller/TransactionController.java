package neueda.in.TransactionMonitoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.TransactionRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Record and query financial transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Operation(summary = "Record a new transaction")
    public ResponseEntity<TransactionResponseDTO> recordTransaction(
            @Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(transactionService.recordTransaction(dto));
    }

    @GetMapping
    @Operation(summary = "List all transactions", description = "Paginated. Filter by accountId, payeeId, date range.")
    public ResponseEntity<PagedResponseDTO<TransactionResponseDTO>> getTransactions(
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String payeeId,
            @RequestParam(required = false) Instant fromTime,
            @RequestParam(required = false) Instant toTime,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
            transactionService.getTransactions(accountId, payeeId, fromTime, toTime, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a transaction by ID")
    public ResponseEntity<TransactionResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction by ID")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}

