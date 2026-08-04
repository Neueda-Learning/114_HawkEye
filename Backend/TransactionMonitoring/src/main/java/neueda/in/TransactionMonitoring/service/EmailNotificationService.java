package neueda.in.TransactionMonitoring.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.config.EmailNotificationProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "notification.email", name = "enabled", havingValue = "true")
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final EmailNotificationProperties properties;

    public void sendTransactionNotification(String subject, String body) {
        send(subject, body, properties.getTransactionRecipients());
    }

    public void sendAlertNotification(String subject, String body) {
        send(subject, body, properties.getAlertRecipients());
    }

    public void sendRuleNotification(String subject, String body) {
        send(subject, body, properties.getRuleRecipients());
    }

    private void send(String subject, String body, List<String> recipients) {
        if (!properties.isEnabled()) {
            return;
        }
        if (recipients == null || recipients.isEmpty()) {
            log.debug("Email notification skipped because recipient list is empty. subject={}", subject);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.getFrom());
        message.setTo(recipients.toArray(new String[0]));
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            log.info("Notification email sent. subject='{}', recipients={}", subject, recipients.size());
        } catch (MailException ex) {
            log.error("Failed to send notification email. subject='{}': {}", subject, ex.getMessage(), ex);
        }
    }
}

