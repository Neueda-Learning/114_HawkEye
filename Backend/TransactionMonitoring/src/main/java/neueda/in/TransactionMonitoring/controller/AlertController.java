package neueda.in.TransactionMonitoring.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertAuditTrailResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.dto.response.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;
import neueda.in.TransactionMonitoring.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Validated
public class AlertController {

	private final AlertService alertService;

	@GetMapping
	public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getAlerts(
			@RequestParam(required = false) AlertStatus status,
			@RequestParam(required = false) Severity severity,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return ResponseEntity.ok(alertService.getAlerts(status, severity, page, size));
	}

	@GetMapping("/stats")
	public ResponseEntity<AlertStatsResponseDTO> getStats() {
		return ResponseEntity.ok(alertService.getStats());
	}

	@GetMapping("/history")
	public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getHistory(
			@RequestParam(required = false) Severity severity,
			@RequestParam(required = false) String ruleName,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return ResponseEntity.ok(alertService.getAlertHistory(severity, ruleName, page, size));
	}

	@GetMapping("/history/closed")
	public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getClosedAlerts(
			@RequestParam(required = false) Severity severity,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return ResponseEntity.ok(alertService.getClosedAlerts(severity, page, size));
	}

	@GetMapping("/history/dismissed")
	public ResponseEntity<PagedResponseDTO<AlertResponseDTO>> getDismissedAlerts(
			@RequestParam(required = false) Severity severity,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return ResponseEntity.ok(alertService.getDismissedAlerts(severity, page, size));
	}

	@GetMapping("/{id}")
	public ResponseEntity<AlertResponseDTO> getById(@PathVariable Long id) {
		return ResponseEntity.ok(alertService.getAlertById(id));
	}

	@GetMapping("/{id}/audit-trail")
	public ResponseEntity<PagedResponseDTO<AlertAuditTrailResponseDTO>> getAuditTrail(
			@PathVariable Long id,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		return ResponseEntity.ok(alertService.getAlertAuditTrail(id, page, size));
	}

	@GetMapping("/{id}/transactions")
	public ResponseEntity<List<TransactionResponseDTO>> getAlertTransactions(@PathVariable Long id) {
		return ResponseEntity.ok(alertService.getAlertTransactions(id));
	}

	@PutMapping("/{id}/acknowledge")
	public ResponseEntity<AlertResponseDTO> acknowledge(@PathVariable Long id) {
		return ResponseEntity.ok(alertService.acknowledgeAlert(id));
	}

	@PutMapping("/{id}/investigate")
	public ResponseEntity<AlertResponseDTO> investigate(@PathVariable Long id) {
		return ResponseEntity.ok(alertService.startInvestigation(id));
	}

	@PutMapping("/{id}/close")
	public ResponseEntity<AlertResponseDTO> close(
			@PathVariable Long id,
			@Valid @RequestBody(required = false) AlertStatusUpdateDTO dto) {
		return ResponseEntity.ok(alertService.closeAlert(id, dto));
	}

	@PutMapping("/{id}/dismiss")
	public ResponseEntity<AlertResponseDTO> dismiss(
			@PathVariable Long id,
			@Valid @RequestBody(required = false) AlertStatusUpdateDTO dto) {
		return ResponseEntity.ok(alertService.dismissAlert(id, dto));
	}
}
