package neueda.in.TransactionMonitoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Manage alert lifecycle: OPEN → ACKNOWLEDGED → INVESTIGATING → CLOSED / DISMISSED")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "List all alerts", description = "Paginated, filterable by status and/or severity.")
    public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getAlerts(status, severity, page, size));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get alert statistics", description = "Count of alerts grouped by status.")
    public ResponseEntity<AlertStatsResponseDTO> getStats() {
        return ResponseEntity.ok(alertService.getStats());
    }

    @GetMapping("/history")
    @Operation(summary = "Get alert history", description = "All CLOSED and DISMISSED alerts. Filterable by severity and rule name.")
    public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getHistory(
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) String ruleName,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getAlertHistory(severity, ruleName, page, size));
    }

    @GetMapping("/history/closed")
    @Operation(summary = "Get closed alerts only", description = "All alerts with status CLOSED.")
    public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getClosedAlerts(
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getClosedAlerts(severity, page, size));
    }

    @GetMapping("/history/dismissed")
    @Operation(summary = "Get dismissed alerts only", description = "All alerts dismissed as false positives.")
    public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getDismissedAlerts(
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getDismissedAlerts(severity, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single alert with its triggering transactions")
    public ResponseEntity<AlertResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an alert (OPEN → ACKNOWLEDGED)")
    public ResponseEntity<AlertResponseDTO> acknowledge(@PathVariable String id) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id));
    }

    @PatchMapping("/{id}/investigate")
    @Operation(summary = "Start investigating an alert (ACKNOWLEDGED → INVESTIGATING)")
    public ResponseEntity<AlertResponseDTO> investigate(@PathVariable String id) {
        return ResponseEntity.ok(alertService.startInvestigation(id));
    }

    @PatchMapping("/{id}/close")
    @Operation(summary = "Close an alert (INVESTIGATING → CLOSED)")
    public ResponseEntity<AlertResponseDTO> close(
            @PathVariable String id,
            @Valid @RequestBody(required = false) AlertStatusUpdateDTO dto) {
        return ResponseEntity.ok(alertService.closeAlert(id, dto));
    }

    @PatchMapping("/{id}/dismiss")
    @Operation(summary = "Dismiss an alert as false positive (OPEN/ACKNOWLEDGED/INVESTIGATING → DISMISSED)")
    public ResponseEntity<AlertResponseDTO> dismiss(
            @PathVariable String id,
            @Valid @RequestBody(required = false) AlertStatusUpdateDTO dto) {
        return ResponseEntity.ok(alertService.dismissAlert(id, dto));
    }
}

 