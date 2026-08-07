package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.Builder;
import lombok.Getter;
import neueda.in.TransactionMonitoring.enums.RuleStatus;

import java.time.OffsetDateTime;

@Getter
@Builder
public class RuleActionResponse {

	private Long id;
	private String name;
	private RuleStatus status;
	private String updatedBy;
	private OffsetDateTime updatedAt;
	private String message;
}

