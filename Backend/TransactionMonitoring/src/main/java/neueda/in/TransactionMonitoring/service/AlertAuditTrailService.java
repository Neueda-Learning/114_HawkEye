package neueda.in.TransactionMonitoring.service;

import lombok.RequiredArgsConstructor;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.entity.AlertAuditTrail;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.repository.AlertAuditTrailRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlertAuditTrailService {

    private final AlertAuditTrailRepository alertAuditTrailRepository;

    public void record(Alert alert, AlertStatus previousStatus, String changedBy, String changeReason, String notes) {
        AlertAuditTrail entry = AlertAuditTrail.builder()
                .alertId(alert.getAlertId())
                .previousStatus(previousStatus)
                .newStatus(alert.getAlertStatus())
                .changedBy(changedBy == null || changedBy.isBlank() ? "SYSTEM" : changedBy)
                .changeReason(changeReason)
                .notes(notes)
                .build();
        alertAuditTrailRepository.save(entry);
    }
}

