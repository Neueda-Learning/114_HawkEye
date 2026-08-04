package neueda.in.TransactionMonitoring.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import java.time.Instant;
import java.util.List;
/**
 * STUB — Full implementation (entity + table) to be provided by the Alert Entity team.
 * This class exists only so AlertService / AlertController / AlertRepository can compile.
 */
@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
public class Alert {
    @Id
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private MonitoringRule rule;
    @Column(name = "rule_name", length = 100)
    private String ruleName;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AlertStatus status;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AlertSeverity severity;
    @Column(length = 1000)
    private String description;
    @Column(name = "resolution_notes", length = 2000)
    private String resolutionNotes;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "alert_transactions",
        joinColumns = @JoinColumn(name = "alert_id"),
        inverseJoinColumns = @JoinColumn(name = "transaction_id")
    )
    private List<Transaction> transactions;
    @Column(name = "created_at")
    private Instant createdAt;
    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;
    @Column(name = "investigating_at")
    private Instant investigatingAt;
    @Column(name = "closed_at")
    private Instant closedAt;
    @Column(name = "dismissed_at")
    private Instant dismissedAt;
}
