package neueda.in.TransactionMonitoring.enums;

/**
 * Shared enum — used by both Rules and Alerts domains.
 * Placed here so Person 1 can read alert severity on the transaction detail endpoint.
 */

public enum Severity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

