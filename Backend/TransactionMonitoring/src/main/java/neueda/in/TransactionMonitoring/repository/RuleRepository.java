package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {

    /** Fetch all active rules for evaluation */
    List<Rule> findByStatus(RuleStatus status);

    /** Fetch active rules by type */
    List<Rule> findByRuleTypeAndStatus(RuleType ruleType, RuleStatus status);
}


