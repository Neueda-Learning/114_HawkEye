package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PagedResponseDTO<T> {
	private List<T> content;
	private int page;
	private int size;
	private long totalElements;
	private int totalPages;
	private boolean first;
	private boolean last;
}
