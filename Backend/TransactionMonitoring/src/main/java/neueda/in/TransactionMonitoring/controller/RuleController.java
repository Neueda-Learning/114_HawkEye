package neueda.in.TransactionMonitoring.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.CreateRuleRequest;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.ToggleRuleStatusRequest;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.UpdateRuleRequest;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleActionResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleAuditTrailResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleResponse;
import neueda.in.TransactionMonitoring.enums.RuleSeverity;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.service.RuleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rules")
@Validated
public class RuleController {

	private final RuleService ruleService;

	public RuleController(RuleService ruleService) {
		this.ruleService = ruleService;
	}

	@PostMapping
	public ResponseEntity<RuleActionResponse> createRule(@Valid @RequestBody CreateRuleRequest request) {
		RuleActionResponse response = ruleService.createRule(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<Page<RuleResponse>> getAllRules(
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
			@RequestParam(defaultValue = "updatedAt") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir,
			@RequestParam(required = false) RuleStatus status,
			@RequestParam(required = false) RuleType ruleType,
			@RequestParam(required = false) RuleSeverity severity,
			@RequestParam(required = false) String search) {

		Sort sort = "asc".equalsIgnoreCase(sortDir) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
		Pageable pageable = PageRequest.of(page, size, sort);
		return ResponseEntity.ok(ruleService.getAllRules(pageable, status, ruleType, severity, search));
	}

	@GetMapping("/{id}")
	public ResponseEntity<RuleResponse> getRuleById(@PathVariable Long id) {
		return ResponseEntity.ok(ruleService.getRuleById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<RuleActionResponse> updateRule(@PathVariable Long id,
	                                                     @Valid @RequestBody UpdateRuleRequest request) {
		return ResponseEntity.ok(ruleService.updateRule(id, request));
	}

	@PutMapping("/{id}/toggle")
	public ResponseEntity<RuleActionResponse> toggleRuleStatus(@PathVariable Long id,
	                                                           @Valid @RequestBody ToggleRuleStatusRequest request) {
		return ResponseEntity.ok(ruleService.toggleRuleStatus(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<RuleActionResponse> deleteRule(
			@PathVariable Long id,
			@RequestParam String performedBy,
			@RequestParam(required = false) String reason) {
		return ResponseEntity.ok(ruleService.deleteRule(id, performedBy, reason));
	}

	@GetMapping("/{id}/audit-trail")
	public ResponseEntity<Page<RuleAuditTrailResponse>> getAuditTrail(
			@PathVariable Long id,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return ResponseEntity.ok(ruleService.getAuditTrail(id, pageable));
	}

	@GetMapping("/active")
	public ResponseEntity<List<RuleResponse>> getActiveRulesForEngine() {
		return ResponseEntity.ok(ruleService.getActiveRulesForEngine());
	}
}

