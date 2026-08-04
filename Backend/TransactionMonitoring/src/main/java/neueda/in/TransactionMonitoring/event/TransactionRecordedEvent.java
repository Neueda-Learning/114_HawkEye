package neueda.in.TransactionMonitoring.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published by Person 1 (TransactionService) when a new transaction is persisted.
 * Person 3 (RuleEngineService) listens to this event to kick off rule evaluation.
 */
public class TransactionRecordedEvent extends ApplicationEvent {

    private final Long transactionId;

    public TransactionRecordedEvent(Object source, Long transactionId) {
        super(source);
        this.transactionId = transactionId;
    }

    public Long getTransactionId() {
        return transactionId;
    }
}

