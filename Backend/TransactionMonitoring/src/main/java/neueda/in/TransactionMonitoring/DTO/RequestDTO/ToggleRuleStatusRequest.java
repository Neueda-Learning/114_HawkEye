package neueda.in.TransactionMonitoring.DTO.RequestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ToggleRuleStatusRequest {

	@NotNull(message = "active flag is required")
	private Boolean active;

	@NotBlank(message = "performedBy is required")
	@Size(max = 100, message = "performedBy must be at most 100 characters")
	private String performedBy;

	@Size(max = 500, message = "reason must be at most 500 characters")
	private String reason;
}

