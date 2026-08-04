package neueda.in.TransactionMonitoring.DTO.RequestDTO;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AlertStatusUpdateDTO {
	@Size(max = 2000, message = "Resolution notes must not exceed 2000 characters")
	private String resolutionNotes;
}
