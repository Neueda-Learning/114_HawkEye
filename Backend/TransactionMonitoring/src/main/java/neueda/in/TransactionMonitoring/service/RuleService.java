package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.DTO.RequestDTO.CreateRuleRequest;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.ToggleRuleStatusRequest;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.UpdateRuleRequest;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleActionResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleAuditTrailResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleResponse;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.enums.AuditAction;
import neueda.in.TransactionMonitoring.enums.RuleSeverity;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;
import neueda.in.TransactionMonitoring.event.RuleChangedEvent;
import neueda.in.TransactionMonitoring.exception.DuplicateRuleNameException;
import neueda.in.TransactionMonitoring.exception.ResourceNotFoundException;
import neueda.in.TransactionMonitoring.mapper.RuleMapper;
import neueda.in.TransactionMonitoring.repository.RuleAuditTrailRepository;
import neueda.in.TransactionMonitoring.repository.RuleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;

@Service
@Transactional
public class RuleService {

	private final RuleRepository ruleRepository;
	private final RuleAuditTrailRepository ruleAuditTrailRepository;
	private final RuleConfigValidationService ruleConfigValidationService;
	private final RuleAuditTrailService ruleAuditTrailService;
	private final RuleMapper ruleMapper;
	private final ApplicationEventPublisher eventPublisher;

	public RuleService(RuleRepository ruleRepository,
	                   RuleAuditTrailRepository ruleAuditTrailRepository,
	                   RuleConfigValidationService ruleConfigValidationService,
	                   RuleAuditTrailService ruleAuditTrailService,
	                   RuleMapper ruleMapper,
	                   ApplicationEventPublisher eventPublisher) {
		this.ruleRepository = ruleRepository;
		this.ruleAuditTrailRepository = ruleAuditTrailRepository;
		this.ruleConfigValidationService = ruleConfigValidationService;
		this.ruleAuditTrailService = ruleAuditTrailService;
		this.ruleMapper = ruleMapper;
		this.eventPublisher = eventPublisher;
	}

	// ─── CREATE ──────────────────────────────────────────────────────────────────

	public RuleActionResponse createRule(CreateRuleRequest request) {
		if (ruleRepository.existsByNameIgnoreCaseAndStatusNot(request.getName(), RuleStatus.DELETED)) {
			throw new DuplicateRuleNameException("Rule with name '" + request.getName() + "' already exists");
		}

		ruleConfigValidationService.validate(request.getRuleType(), request.getParameters());

		Rule rule = Rule.builder()
				.name(request.getName().trim())
				.description(request.getDescription())
				.ruleType(request.getRuleType())
				.severity(request.getSeverity())
				.status(RuleStatus.INACTIVE)
				.parameters(request.getParameters())
				.createdBy(request.getPerformedBy())
				.updatedBy(request.getPerformedBy())
				.build();

		Rule saved = ruleRepository.save(rule);

		ruleAuditTrailService.record(saved, AuditAction.CREATED,
				request.getPerformedBy(),
				request.getChangeReason(),
				"Rule '" + saved.getName() + "' created");

		eventPublisher.publishEvent(new RuleChangedEvent(
				this,
				"RULE_CREATED",
				saved.getId(),
				saved.getName(),
				request.getPerformedBy(),
				request.getChangeReason(),
				saved.getUpdatedAt()
		));

		return ruleMapper.toRuleActionResponse(saved, "Rule created successfully");
	}

	// ─── READ ─────────────────────────────────────────────────────────────────────

	@Transactional(readOnly = true)
	public RuleResponse getRuleById(Long id) {
		Rule rule = findActiveRule(id);
		return ruleMapper.toRuleResponse(rule);
	}

	@Transactional(readOnly = true)
	public Page<RuleResponse> getAllRules(Pageable pageable,
	                                     RuleStatus status,
	                                     RuleType ruleType,
	                                     RuleSeverity severity,
	                                     String search) {
		Specification<Rule> specification = buildRuleSpecification(status, ruleType, severity, search);
		return ruleRepository.findAll(specification, pageable)
				.map(ruleMapper::toRuleResponse);
	}

	@Transactional(readOnly = true)
	public List<RuleResponse> getActiveRulesForEngine() {
		return ruleRepository.findAllByStatusOrderByUpdatedAtDesc(RuleStatus.ACTIVE)
				.stream()
				.map(ruleMapper::toRuleResponse)
				.toList();
	}

	// ─── UPDATE ───────────────────────────────────────────────────────────────────

	public RuleActionResponse updateRule(Long id, UpdateRuleRequest request) {
		Rule rule = findActiveRule(id);

		if (ruleRepository.existsByNameIgnoreCaseAndIdNotAndStatusNot(request.getName(), id, RuleStatus.DELETED)) {
			throw new DuplicateRuleNameException("Rule with name '" + request.getName() + "' already exists");
		}

		ruleConfigValidationService.validate(request.getRuleType(), request.getParameters());

		String changeSummary = buildUpdateSummary(rule, request);

		rule.setName(request.getName().trim());
		rule.setDescription(request.getDescription());
		rule.setRuleType(request.getRuleType());
		rule.setSeverity(request.getSeverity());
		rule.setParameters(request.getParameters());
		rule.setUpdatedBy(request.getPerformedBy());

		Rule updated = ruleRepository.save(rule);

		ruleAuditTrailService.record(updated, AuditAction.UPDATED,
				request.getPerformedBy(),
				request.getChangeReason(),
				changeSummary);

		eventPublisher.publishEvent(new RuleChangedEvent(
				this,
				"RULE_UPDATED",
				updated.getId(),
				updated.getName(),
				request.getPerformedBy(),
				request.getChangeReason(),
				updated.getUpdatedAt()
		));

		return ruleMapper.toRuleActionResponse(updated, "Rule updated successfully");
	}

	// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────

	public RuleActionResponse toggleRuleStatus(Long id, ToggleRuleStatusRequest request) {
		Rule rule = findActiveRule(id);

		RuleStatus previousStatus = rule.getStatus();
		RuleStatus newStatus = Boolean.TRUE.equals(request.getActive()) ? RuleStatus.ACTIVE : RuleStatus.INACTIVE;

		rule.setStatus(newStatus);
		rule.setUpdatedBy(request.getPerformedBy());

		Rule updated = ruleRepository.save(rule);

		ruleAuditTrailService.record(updated, AuditAction.STATUS_CHANGED,
				request.getPerformedBy(),
				request.getReason(),
				"Status changed from " + previousStatus + " to " + newStatus);

		String message = newStatus == RuleStatus.ACTIVE ? "Rule activated successfully" : "Rule deactivated successfully";
		return ruleMapper.toRuleActionResponse(updated, message);
	}

	// ─── SOFT DELETE ──────────────────────────────────────────────────────────────

	public RuleActionResponse deleteRule(Long id, String performedBy, String reason) {
		Rule rule = findActiveRule(id);

		rule.setStatus(RuleStatus.DELETED);
		rule.setUpdatedBy(performedBy);

		Rule deleted = ruleRepository.save(rule);

		ruleAuditTrailService.record(deleted, AuditAction.DELETED,
				performedBy,
				reason,
				"Rule '" + deleted.getName() + "' soft deleted");

		return ruleMapper.toRuleActionResponse(deleted, "Rule deleted successfully");
	}

	// ─── AUDIT TRAIL ──────────────────────────────────────────────────────────────

	@Transactional(readOnly = true)
	public Page<RuleAuditTrailResponse> getAuditTrail(Long id, Pageable pageable) {
		findActiveRule(id);
		return ruleAuditTrailRepository.findByRuleIdOrderByCreatedAtDesc(id, pageable)
				.map(ruleMapper::toAuditTrailResponse);
	}

	// ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

	private Rule findActiveRule(Long id) {
		return ruleRepository.findByIdAndStatusNot(id, RuleStatus.DELETED)
				.orElseThrow(() -> new ResourceNotFoundException("Rule not found with id: " + id));
	}

	private String buildUpdateSummary(Rule existing, UpdateRuleRequest request) {
		StringBuilder summary = new StringBuilder();

		if (!existing.getName().equalsIgnoreCase(request.getName())) {
			summary.append("Name changed. ");
		}
		if (existing.getSeverity() != request.getSeverity()) {
			summary.append("Severity changed from ").append(existing.getSeverity())
					.append(" to ").append(request.getSeverity()).append(". ");
		}
		if (existing.getRuleType() != request.getRuleType()) {
			summary.append("RuleType changed from ").append(existing.getRuleType())
					.append(" to ").append(request.getRuleType()).append(". ");
		}
		if (!existing.getParameters().equals(request.getParameters())) {
			summary.append("Parameters updated. ");
		}

		return summary.isEmpty() ? "Rule updated" : summary.toString().trim();
	}

	private Specification<Rule> buildRuleSpecification(RuleStatus status,
	                                                   RuleType ruleType,
	                                                   RuleSeverity severity,
	                                                   String search) {
		Specification<Rule> spec = (root, query, cb) -> cb.notEqual(root.get("status"), RuleStatus.DELETED);

		if (status != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
		}

		if (ruleType != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("ruleType"), ruleType));
		}

		if (severity != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("severity"), severity));
		}

		if (search != null && !search.isBlank()) {
			String pattern = "%" + search.trim().toLowerCase() + "%";
			spec = spec.and((root, query, cb) -> cb.or(
					cb.like(cb.lower(root.get("name")), pattern),
					cb.like(cb.lower(root.get("description")), pattern)
			));
		}

		return spec;
	}
}
