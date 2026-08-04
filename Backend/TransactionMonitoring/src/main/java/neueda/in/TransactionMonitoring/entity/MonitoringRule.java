package neueda.in.TransactionMonitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;

/**
 * Temporary placeholder from the merged alert module.
 * Kept only to avoid breaking teammate code until rule/alert model is fully unified.
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
