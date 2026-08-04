package neueda.in.TransactionMonitoring.DTO.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserDTO {

    private String id;
    private String email;
    private String name;
    private String role;
    private String accountId;
}

