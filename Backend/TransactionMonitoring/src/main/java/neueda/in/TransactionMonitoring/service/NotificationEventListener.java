package neueda.in.TransactionMonitoring.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.event.AlertCreatedEvent;
import neueda.in.TransactionMonitoring.event.RuleChangedEvent;
import neueda.in.TransactionMonitoring.event.TransactionRecordedEvent;
import neueda.in.TransactionMonitoring.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final EmailNotificationService emailNotificationService;
    private final TransactionRepository transactionRepository;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTransactionRecorded(TransactionRecordedEvent event) {
        log.info("TransactionRecordedEvent listener triggered for transactionId={}", event.getTransactionId());
        try {
            if (!emailNotificationService.isEnabled()) {
                log.debug("Email notifications disabled, skipping transaction notification");
                return;
            }
            
            Transaction transaction = transactionRepository.findDetailedById(event.getTransactionId()).orElse(null);
            if (transaction == null) {
                log.warn("Skipping transaction email. Transaction not found for id={}", event.getTransactionId());
                return;
            }

            String subject = "Transaction Completed - " + transaction.getTransactionId();
            String body = String.format(
                    "A transaction has been completed.%n%nTransaction ID: %s%nAccount ID: %s%nFrom Account: %s%nTo Payee: %s%nAmount: %s %s%nType: %s%nTime: %s%n",
                    transaction.getTransactionId(),
                    transaction.getAccount() != null ? transaction.getAccount().getAccountId() : "N/A",
                    transaction.getAccount() != null ? transaction.getAccount().getAccountName() : "N/A",
                    transaction.getPayee() != null ? transaction.getPayee().getPayeeName() : "N/A",
                    transaction.getCurrency(),
                    transaction.getAmount(),
                    transaction.getTransactionType(),
                    transaction.getTimestamp() != null ? transaction.getTimestamp().format(DATE_TIME_FORMATTER) : "N/A"
            );

            emailNotificationService.sendTransactionNotification(subject, body);
        } catch (Exception ex) {
            log.error("Failed to process transaction notification for transactionId={}: {}",
                    event.getTransactionId(), ex.getMessage(), ex);
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAlertCreated(AlertCreatedEvent event) {
        log.info("AlertCreatedEvent listener triggered for alertId={}", event.getAlertResponseDTO() != null ? event.getAlertResponseDTO().getAlertId() : "unknown");
        try {
            if (!emailNotificationService.isEnabled()) {
                log.debug("Email notifications disabled, skipping alert notification");
                return;
            }
            
            AlertResponseDTO alert = event.getAlertResponseDTO();
            if (alert == null) {
                return;
            }

            String subject = "Alert Raised - " + alert.getSeverity() + " - " + alert.getAlertId();
            String body = String.format(
                    "A monitoring alert has been raised.%n%nAlert ID: %s%nSeverity: %s%nStatus: %s%nRule: %s%nReason: %s%nAccount ID: %s%nTransaction ID: %s%nTime: %s%n",
                    alert.getAlertId(),
                    alert.getSeverity(),
                    alert.getAlertStatus(),
                    alert.getRuleName(),
                    alert.getAlertMessage(),
                    alert.getAccountId(),
                    alert.getTransactionId(),
                    alert.getCreatedAt() != null ? alert.getCreatedAt().format(DATE_TIME_FORMATTER) : "N/A"
            );

            emailNotificationService.sendAlertNotification(subject, body);
        } catch (Exception ex) {
            log.error("Failed to process alert notification: {}", ex.getMessage(), ex);
        }
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRuleChanged(RuleChangedEvent event) {
        log.info("RuleChangedEvent listener triggered for ruleId={}, eventType={}", event.getRuleId(), event.getEventType());
        try {
            if (!emailNotificationService.isEnabled()) {
                log.debug("Email notifications disabled, skipping rule notification");
                return;
            }
            
            String subject = "Rule Change - " + event.getEventType() + " - " + event.getRuleName();
            String body = String.format(
                    "A rule configuration has changed.%n%nEvent Type: %s%nRule ID: %s%nRule Name: %s%nChanged By: %s%nReason: %s%nChanged At: %s%n",
                    event.getEventType(),
                    event.getRuleId(),
                    event.getRuleName(),
                    event.getPerformedBy(),
                    event.getReason() != null && !event.getReason().isBlank() ? event.getReason() : "N/A",
                    event.getChangedAt() != null ? event.getChangedAt().format(DATE_TIME_FORMATTER) : "N/A"
            );

            emailNotificationService.sendRuleNotification(subject, body);
        } catch (Exception ex) {
            log.error("Failed to process rule change notification for ruleId={}: {}",
                    event.getRuleId(), ex.getMessage(), ex);
        }
    }
}

