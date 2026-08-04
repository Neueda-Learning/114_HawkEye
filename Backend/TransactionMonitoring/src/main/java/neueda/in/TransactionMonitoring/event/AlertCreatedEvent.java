package neueda.in.TransactionMonitoring.event;

import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import org.springframework.context.ApplicationEvent;

/**
 * Published by AlertService after a new alert is successfully persisted.
 * Person 4 (Alert Management) can listen to this to trigger notifications or dashboards.
 */
public class AlertCreatedEvent extends ApplicationEvent {

    private final AlertResponseDTO alertResponseDTO;

    public AlertCreatedEvent(Object source, AlertResponseDTO alertResponseDTO) {
        super(source);
        this.alertResponseDTO = alertResponseDTO;
    }

    public AlertResponseDTO getAlertResponseDTO() {
        return alertResponseDTO;
    }
}

