package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Rule;
import neueda.in.TransactionMonitoring.enums.RuleStatus;
import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RuleRepository extends JpaRepository<Rule, Long>, JpaSpecificationExecutor<Rule> {

	boolean existsByNameIgnoreCaseAndStatusNot(String name, RuleStatus status);

	boolean existsByNameIgnoreCaseAndIdNotAndStatusNot(String name, Long id, RuleStatus status);

	boolean existsByRuleTypeAndStatusNot(RuleType ruleType, RuleStatus status);

	boolean existsByRuleTypeAndIdNotAndStatusNot(RuleType ruleType, Long id, RuleStatus status);

	Optional<Rule> findByIdAndStatusNot(Long id, RuleStatus status);

	List<Rule> findAllByStatusOrderByUpdatedAtDesc(RuleStatus status);

	List<Rule> findByStatus(RuleStatus status);
}

