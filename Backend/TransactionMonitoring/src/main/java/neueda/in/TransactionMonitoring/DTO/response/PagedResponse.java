package neueda.in.TransactionMonitoring.dto.response;

import lombok.*;

import java.util.List;

/**
 * Pagination wrapper — used as the data field inside ApiResponse
 * for list endpoints that support paging.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
}

