package neueda.in.TransactionMonitoring.event;

import org.springframework.context.ApplicationEvent;

import java.time.OffsetDateTime;

/**
 * Published when a rule is created/updated/toggled/deleted.
 * Used by notification listeners (email, audit fan-out, etc.).
 */
public class RuleChangedEvent extends ApplicationEvent {

    private final String eventType;
    private final Long ruleId;
    private final String ruleName;
    private final String performedBy;
    private final String reason;
    private final OffsetDateTime changedAt;

    public RuleChangedEvent(Object source,
                            String eventType,
                            Long ruleId,
                            String ruleName,
                            String performedBy,
                            String reason,
                            OffsetDateTime changedAt) {
        super(source);
        this.eventType = eventType;
        this.ruleId = ruleId;
        this.ruleName = ruleName;
        this.performedBy = performedBy;
        this.reason = reason;
        this.changedAt = changedAt;
    }

    public String getEventType() {
        return eventType;
    }

    public Long getRuleId() {
        return ruleId;
    }

    public String getRuleName() {
        return ruleName;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public String getReason() {
        return reason;
    }

    public OffsetDateTime getChangedAt() {
        return changedAt;
    }
}

