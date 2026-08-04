package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.Builder;
import lombok.Getter;
import neueda.in.TransactionMonitoring.enums.AuditAction;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;

import java.time.OffsetDateTime;
import java.util.Map;

@Getter
@Builder
public class RuleAuditTrailResponse {

	private Long id;
	private Long ruleId;
	private String ruleName;
	private RuleType ruleType;
	private AuditAction action;
	private RuleStatus statusAfter;
	private String changedBy;
	private String changeReason;
	private String changeSummary;
	private Map<String, Object> ruleSnapshot;
	private OffsetDateTime createdAt;
}

