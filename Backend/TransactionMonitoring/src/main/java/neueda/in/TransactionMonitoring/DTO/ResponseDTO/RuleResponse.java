package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.Builder;
import lombok.Getter;
import neueda.in.TransactionMonitoring.enums.RuleSeverity;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;

import java.time.OffsetDateTime;
import java.util.Map;

@Getter
@Builder
public class RuleResponse {

	private Long id;
	private String name;
	private String description;
	private RuleType ruleType;
	private RuleStatus status;
	private RuleSeverity severity;
	private Map<String, Object> parameters;
	private String createdBy;
	private String updatedBy;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
	private Long version;
}

