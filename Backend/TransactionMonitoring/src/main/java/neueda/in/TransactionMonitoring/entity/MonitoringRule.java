package neueda.in.TransactionMonitoring.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
/**
 * STUB - Full implementation provided by Rule Engine team via Rule.java
 * Kept for any legacy references only.
 */
@Entity
@Table(name = "monitoring_rules")
@Getter
@Setter
@NoArgsConstructor
public class MonitoringRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "name", length = 100)
    private String name;
}