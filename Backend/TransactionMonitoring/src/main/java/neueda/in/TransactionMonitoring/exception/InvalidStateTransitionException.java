package neueda.in.TransactionMonitoring.exception;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
@ResponseStatus(HttpStatus.CONFLICT)
public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(AlertStatus from, AlertStatus to) {
        super("Invalid alert state transition: " + from + " -> " + to);
    }
}
