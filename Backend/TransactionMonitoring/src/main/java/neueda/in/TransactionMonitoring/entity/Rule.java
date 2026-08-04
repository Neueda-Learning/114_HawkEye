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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import neueda.in.TransactionMonitoring.enums.RuleSeverity;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@Table(name = "rules", indexes = {
		@Index(name = "idx_rules_status", columnList = "status"),
		@Index(name = "idx_rules_type", columnList = "rule_type"),
		@Index(name = "idx_rules_name", columnList = "name")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120, unique = true)
	private String name;

	@Column(length = 500)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(name = "rule_type", nullable = false, length = 50)
	private RuleType ruleType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private RuleStatus status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private RuleSeverity severity;

	@Convert(converter = JsonMapConverter.class)
	@Column(name = "parameters_json", nullable = false, columnDefinition = "TEXT")
	@Builder.Default
	private Map<String, Object> parameters = new LinkedHashMap<>();

	@Column(name = "created_by", nullable = false, length = 100)
	private String createdBy;

	@Column(name = "updated_by", nullable = false, length = 100)
	private String updatedBy;

	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;

	@Version
	private Long version;

	@PrePersist
	void onCreate() {
		OffsetDateTime now = OffsetDateTime.now();
		createdAt = now;
		updatedAt = now;
		if (status == null) {
			status = RuleStatus.INACTIVE;
		}
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = OffsetDateTime.now();
	}
}

