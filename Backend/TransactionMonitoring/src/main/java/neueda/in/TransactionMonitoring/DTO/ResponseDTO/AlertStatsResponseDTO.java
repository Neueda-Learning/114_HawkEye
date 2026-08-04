package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AlertStatsResponseDTO {
	private long open;
	private long acknowledged;
	private long investigating;
	private long closed;
	private long dismissed;
	private long total;
}
