package neueda.in.TransactionMonitoring.enums;

/**
 * Lifecycle states for an Alert.
 *
 * Valid transitions:
 *   OPEN → ACKNOWLEDGED → INVESTIGATING → CLOSED
 *                ↓               ↓
 *           DISMISSED       DISMISSED
 *   OPEN → DISMISSED (fast-track false-positive)
 */
public enum AlertStatus {
    OPEN,
    ACKNOWLEDGED,
    INVESTIGATING,
    CLOSED,
    DISMISSED
}

