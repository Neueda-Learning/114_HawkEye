package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AlertStatsResponseDTO {
	private long open;
	private long acknowledged;
	private long investigating;
	private long closed;
	private long dismissed;
	private long total;
	// severity breakdown for frontend charts
	private Map<String, Long> bySeverity;
}
