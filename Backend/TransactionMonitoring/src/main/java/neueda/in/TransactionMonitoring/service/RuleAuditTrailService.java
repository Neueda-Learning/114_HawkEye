package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.RuleAuditTrail;
import neueda.in.TransactionMonitoring.enums.AuditAction;
import neueda.in.TransactionMonitoring.repository.RuleAuditTrailRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class RuleAuditTrailService {

	private final RuleAuditTrailRepository ruleAuditTrailRepository;

	public RuleAuditTrailService(RuleAuditTrailRepository ruleAuditTrailRepository) {
		this.ruleAuditTrailRepository = ruleAuditTrailRepository;
	}

	public void record(Rule rule, AuditAction action, String changedBy, String changeReason, String changeSummary) {
		RuleAuditTrail auditTrail = RuleAuditTrail.builder()
				.ruleId(rule.getId())
				.ruleName(rule.getName())
				.ruleType(rule.getRuleType())
				.action(action)
				.statusAfter(rule.getStatus())
				.changedBy(changedBy)
				.changeReason(changeReason)
				.changeSummary(changeSummary)
				.ruleSnapshot(buildSnapshot(rule))
				.build();

		ruleAuditTrailRepository.save(auditTrail);
	}

	private Map<String, Object> buildSnapshot(Rule rule) {
		Map<String, Object> snapshot = new LinkedHashMap<>();
		snapshot.put("id", rule.getId());
		snapshot.put("name", rule.getName());
		snapshot.put("description", rule.getDescription());
		snapshot.put("ruleType", rule.getRuleType());
		snapshot.put("status", rule.getStatus());
		snapshot.put("severity", rule.getSeverity());
		snapshot.put("parameters", new LinkedHashMap<>(rule.getParameters()));
		snapshot.put("createdBy", rule.getCreatedBy());
		snapshot.put("updatedBy", rule.getUpdatedBy());
		snapshot.put("createdAt", rule.getCreatedAt());
		snapshot.put("updatedAt", rule.getUpdatedAt());
		snapshot.put("version", rule.getVersion());
		return snapshot;
	}
}

