package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.RuleAuditTrail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RuleAuditTrailRepository extends JpaRepository<RuleAuditTrail, Long> {

	Page<RuleAuditTrail> findByRuleIdOrderByCreatedAtDesc(Long ruleId, Pageable pageable);
}

