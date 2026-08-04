package neueda.in.TransactionMonitoring.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;
/**
 * STUB — Full implementation to be provided by the Rule Engine team.
 * This class exists only so the Alert entity can compile.
 */
@Entity
@Table(name = "monitoring_rules")
@Getter
@Setter
@NoArgsConstructor
public class MonitoringRule {
    @Id
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;
    @Column(nullable = false, length = 100)
    private String name;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity;
}
