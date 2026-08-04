package neueda.in.TransactionMonitoring.enums;

/**
 * Shared enum — owned by Alerts domain (Person 2).
 * Placed here so Person 1 can read alert status on the transaction detail endpoint.
 */
public enum AlertStatus {
    OPEN,
    ACKNOWLEDGED,
    INVESTIGATING,
    CLOSED,
    DISMISSED
}

