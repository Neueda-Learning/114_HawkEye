package neueda.in.TransactionMonitoring.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "notification.email")
@Getter
@Setter
public class EmailNotificationProperties {

    private boolean enabled = false;
    private String from = "hawkeyee2026@gmail.com";
    private List<String> transactionRecipients = new ArrayList<>();
    private List<String> alertRecipients = new ArrayList<>();
    private List<String> ruleRecipients = new ArrayList<>();
}

