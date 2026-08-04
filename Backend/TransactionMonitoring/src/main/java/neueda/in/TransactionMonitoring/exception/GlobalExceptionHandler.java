package neueda.in.TransactionMonitoring.exception;

import jakarta.servlet.http.HttpServletRequest;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(InvalidRuleConfigurationException.class)
	public ResponseEntity<ApiErrorResponse> handleInvalidRuleConfig(InvalidRuleConfigurationException ex,
	                                                                HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(DuplicateRuleNameException.class)
	public ResponseEntity<ApiErrorResponse> handleDuplicateName(DuplicateRuleNameException ex,
	                                                            HttpServletRequest request) {
		return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
	                                                              HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), null);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex,
	                                                         HttpServletRequest request) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
			fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
		}
		return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", request.getRequestURI(), fieldErrors);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleGeneral(Exception ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", request.getRequestURI(), null);
	}

	private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status,
	                                                       String message,
	                                                       String path,
	                                                       Map<String, String> validationErrors) {
		ApiErrorResponse error = ApiErrorResponse.builder()
				.timestamp(OffsetDateTime.now())
				.status(status.value())
				.error(status.getReasonPhrase())
				.message(message)
				.path(path)
				.validationErrors(validationErrors)
				.build();

		return ResponseEntity.status(status).body(error);
	}
}

