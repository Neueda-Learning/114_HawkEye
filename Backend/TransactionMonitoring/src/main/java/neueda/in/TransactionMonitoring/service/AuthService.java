package neueda.in.TransactionMonitoring.service;

import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.LoginRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AuthUserDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.LoginResponseDTO;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final class UserRecord {
        private final String password;
        private final AuthUserDTO user;

        private UserRecord(String password, AuthUserDTO user) {
            this.password = password;
            this.user = user;
        }
    }

    private static final Map<String, UserRecord> USERS = new HashMap<>();

    static {
        USERS.put("customer@hawkeye.com", new UserRecord(
                "password123",
                AuthUserDTO.builder()
                        .id("U001")
                        .email("customer@hawkeye.com")
                        .name("John Smith")
                        .role("CUSTOMER")
                        .accountId("ACC-001")
                        .build()
        ));

        USERS.put("analyst@hawkeye.com", new UserRecord(
                "password123",
                AuthUserDTO.builder()
                        .id("U002")
                        .email("analyst@hawkeye.com")
                        .name("Sarah Chen")
                        .role("ANALYST")
                        .build()
        ));

        USERS.put("admin@hawkeye.com", new UserRecord(
                "password123",
                AuthUserDTO.builder()
                        .id("U003")
                        .email("admin@hawkeye.com")
                        .name("Admin User")
                        .role("ADMIN")
                        .build()
        ));
    }

    public LoginResponseDTO login(LoginRequestDTO request) {
        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();
        UserRecord userRecord = USERS.get(email);

        if (userRecord == null || !userRecord.password.equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String raw = userRecord.user.getEmail() + ":" + System.currentTimeMillis();
        String token = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));

        return LoginResponseDTO.builder()
                .user(userRecord.user)
                .accessToken(token)
                .build();
    }
}

