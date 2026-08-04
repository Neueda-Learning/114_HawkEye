package neueda.in.TransactionMonitoring.mapper;

import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleActionResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleAuditTrailResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.RuleResponse;
import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.entity.RuleAuditTrail;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;

@Component
public class RuleMapper {

	public RuleResponse toRuleResponse(Rule rule) {
		return RuleResponse.builder()
				.id(rule.getId())
				.name(rule.getName())
				.description(rule.getDescription())
				.ruleType(rule.getRuleType())
				.status(rule.getStatus())
				.severity(rule.getSeverity())
				.parameters(new LinkedHashMap<>(rule.getParameters()))
				.createdBy(rule.getCreatedBy())
				.updatedBy(rule.getUpdatedBy())
				.createdAt(rule.getCreatedAt())
				.updatedAt(rule.getUpdatedAt())
				.version(rule.getVersion())
				.build();
	}

	public RuleActionResponse toRuleActionResponse(Rule rule, String message) {
		return RuleActionResponse.builder()
				.id(rule.getId())
				.name(rule.getName())
				.status(rule.getStatus())
				.updatedBy(rule.getUpdatedBy())
				.updatedAt(rule.getUpdatedAt())
				.message(message)
				.build();
	}

	public RuleAuditTrailResponse toAuditTrailResponse(RuleAuditTrail auditTrail) {
		return RuleAuditTrailResponse.builder()
				.id(auditTrail.getId())
				.ruleId(auditTrail.getRuleId())
				.ruleName(auditTrail.getRuleName())
				.ruleType(auditTrail.getRuleType())
				.action(auditTrail.getAction())
				.statusAfter(auditTrail.getStatusAfter())
				.changedBy(auditTrail.getChangedBy())
				.changeReason(auditTrail.getChangeReason())
				.changeSummary(auditTrail.getChangeSummary())
				.ruleSnapshot(new LinkedHashMap<>(auditTrail.getRuleSnapshot()))
				.createdAt(auditTrail.getCreatedAt())
				.build();
	}
}

