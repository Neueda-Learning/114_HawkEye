package neueda.in.TransactionMonitoring.DTO.RequestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import neueda.in.TransactionMonitoring.enums.RuleSeverity;
import neueda.in.TransactionMonitoring.enums.RuleType;

import java.util.Map;

@Getter
@Setter
public class CreateRuleRequest {

	@NotBlank(message = "Rule name is required")
	@Size(max = 120, message = "Rule name must be at most 120 characters")
	private String name;

	@Size(max = 500, message = "Description must be at most 500 characters")
	private String description;

	@NotNull(message = "Rule type is required")
	private RuleType ruleType;

	@NotNull(message = "Severity is required")
	private RuleSeverity severity;

	@NotEmpty(message = "Rule parameters are required")
	private Map<String, Object> parameters;

	@NotBlank(message = "performedBy is required")
	@Size(max = 100, message = "performedBy must be at most 100 characters")
	private String performedBy;

	@Size(max = 500, message = "changeReason must be at most 500 characters")
	private String changeReason;
}

