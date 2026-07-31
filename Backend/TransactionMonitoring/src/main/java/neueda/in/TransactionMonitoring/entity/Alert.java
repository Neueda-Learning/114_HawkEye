package neueda.in.TransactionMonitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import neueda.in.TransactionMonitoring.converter.JsonConverter;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Alert entity — created and owned by Person 3.
 * Maps 1:1 to the alerts table.
 */
@Entity
@Table(
    name = "alerts",
    indexes = {
        @Index(name = "idx_status",         columnList = "alert_status"),
        @Index(name = "idx_account_id",     columnList = "account_id"),
        @Index(name = "idx_created_at",     columnList = "created_at"),
        @Index(name = "idx_rule_id",        columnList = "rule_id"),
        @Index(name = "idx_status_created", columnList = "alert_status, created_at")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private Rule rule;

    @Column(name = "account_id", length = 50, nullable = false)
    private String accountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_status", length = 20, nullable = false)
    private AlertStatus alertStatus = AlertStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20, nullable = false)
    private Severity severity;

    @Column(name = "alert_message", columnDefinition = "TEXT", nullable = false)
    private String alertMessage;

    @Convert(converter = JsonConverter.class)
    @Column(name = "alert_details", columnDefinition = "JSON")
    private Map<String, Object> alertDetails;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "investigating_at")
    private LocalDateTime investigatingAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "closed_reason", columnDefinition = "TEXT")
    private String closedReason;

    @Column(name = "closed_by", length = 50)
    private String closedBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (alertStatus == null) {
            alertStatus = AlertStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

