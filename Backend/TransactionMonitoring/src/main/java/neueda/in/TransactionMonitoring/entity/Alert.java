package neueda.in.TransactionMonitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Minimal Alert entity — read-only for Person 1 (Transactions Domain).
 * Person 2 (Alerts Domain) will add full lifecycle fields and service logic.
 */
@Entity
@Table(
    name = "alerts",
    indexes = {
        @Index(name = "idx_alert_status",         columnList = "alert_status"),
        @Index(name = "idx_alert_account_id",     columnList = "account_id"),
        @Index(name = "idx_alert_created_at",     columnList = "created_at"),
        @Index(name = "idx_alert_rule_id",        columnList = "rule_id"),
        @Index(name = "idx_alert_status_created", columnList = "alert_status, created_at")
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

    // Stored as plain Long — Rule entity belongs to Person 2's domain
    @Column(name = "rule_id", nullable = false)
    private Long ruleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // Primary triggering transaction (direct FK)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_status", length = 20, nullable = false)
    @Builder.Default
    private AlertStatus alertStatus = AlertStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 10)
    private Severity severity;

    @Column(name = "alert_message", nullable = false, columnDefinition = "TEXT")
    private String alertMessage;

    @Column(name = "alert_details", columnDefinition = "JSON")
    private String alertDetails;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Full lifecycle fields — managed by Person 2 (Alerts Domain)
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "investigating_at")
    private LocalDateTime investigatingAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "dismissed_at")
    private LocalDateTime dismissedAt;

    @Column(name = "closed_reason", columnDefinition = "TEXT")
    private String closedReason;

    @Column(name = "closed_by", length = 50)
    private String closedBy;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
