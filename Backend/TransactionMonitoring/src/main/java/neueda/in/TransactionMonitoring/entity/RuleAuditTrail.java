package neueda.in.TransactionMonitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import neueda.in.TransactionMonitoring.enums.AuditAction;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@Table(name = "rule_audit_trail", indexes = {
		@Index(name = "idx_rule_audit_rule_id", columnList = "rule_id"),
		@Index(name = "idx_rule_audit_created_at", columnList = "created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleAuditTrail {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "rule_id", nullable = false)
	private Long ruleId;

	@Column(name = "rule_name", nullable = false, length = 120)
	private String ruleName;

	@Enumerated(EnumType.STRING)
	@Column(name = "rule_type", nullable = false, length = 50)
	private RuleType ruleType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AuditAction action;

	@Enumerated(EnumType.STRING)
	@Column(name = "status_after", nullable = false, length = 20)
	private RuleStatus statusAfter;

	@Column(name = "changed_by", nullable = false, length = 100)
	private String changedBy;

	@Column(name = "change_reason", length = 500)
	private String changeReason;

	@Column(name = "change_summary", nullable = false, length = 500)
	private String changeSummary;

	@Convert(converter = JsonMapConverter.class)
	@Column(name = "rule_snapshot_json", nullable = false, columnDefinition = "TEXT")
	@Builder.Default
	private Map<String, Object> ruleSnapshot = new LinkedHashMap<>();

	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;

	@PrePersist
	void onCreate() {
		createdAt = OffsetDateTime.now();
	}
}

