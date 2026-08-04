package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long>, JpaSpecificationExecutor<Alert> {

    // Person 3 usage — duplicate prevention for same rule + transaction
    boolean existsByRuleIdAndTransaction_TransactionId(Long ruleId, Long transactionId);

	List<Alert> findByTransaction_TransactionIdOrderByCreatedAtDesc(Long transactionId);

    // Fetch all alerts for an account
    List<Alert> findByAccount_AccountIdOrderByCreatedAtDesc(String accountId);

    // Fetch open alerts count (used by dashboard — Person 2 but shared)
    long countByAlertStatus(AlertStatus alertStatus);
}

