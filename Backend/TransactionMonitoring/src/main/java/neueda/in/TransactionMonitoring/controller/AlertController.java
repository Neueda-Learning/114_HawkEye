package neueda.in.TransactionMonitoring.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Alert lifecycle: OPEN → ACKNOWLEDGED → INVESTIGATING → CLOSED / DISMISSED")
public class AlertController {
    private final AlertService alertService;
    @GetMapping
    @Operation(summary = "List all alerts", description = "Paginated. Filter by status and/or severity.")
    public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) Severity severity,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getAlerts(status, severity, page, size));
    }
    @GetMapping("/stats")
    @Operation(summary = "Get alert statistics — count by status")
    public ResponseEntity<AlertStatsResponseDTO> getStats() {
        return ResponseEntity.ok(alertService.getStats());
    }
    @GetMapping("/history")
    @Operation(summary = "Get alert history — all CLOSED and DISMISSED alerts")
    public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getHistory(
            @RequestParam(required = false) Severity severity,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getAlertHistory(severity, page, size));
    }
    @GetMapping("/{id}")
    @Operation(summary = "Get a single alert by ID")
    public ResponseEntity<AlertResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }
    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an alert (OPEN → ACKNOWLEDGED)")
    public ResponseEntity<AlertResponseDTO> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id));
    }
    @PatchMapping("/{id}/investigate")
    @Operation(summary = "Start investigating (ACKNOWLEDGED → INVESTIGATING)")
    public ResponseEntity<AlertResponseDTO> investigate(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.startInvestigation(id));
    }
    @PatchMapping("/{id}/close")
    @Operation(summary = "Close an alert (INVESTIGATING → CLOSED)")
    public ResponseEntity<AlertResponseDTO> close(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) AlertStatusUpdateDTO dto) {
        return ResponseEntity.ok(alertService.closeAlert(id, dto));
    }
    @PatchMapping("/{id}/dismiss")
    @Operation(summary = "Dismiss an alert as false positive")
    public ResponseEntity<AlertResponseDTO> dismiss(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) AlertStatusUpdateDTO dto) {
        return ResponseEntity.ok(alertService.dismissAlert(id, dto));
    }
}
