package neueda.in.TransactionMonitoring.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.LoginRequestDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.ApiResponse;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.LoginResponseDTO;
import neueda.in.TransactionMonitoring.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful", HttpStatus.OK.value()));
    }
}

