package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    /** Duplicate-prevention check: same rule + same transaction already has an alert */
    boolean existsByRule_IdAndTransaction_TransactionId(Long ruleId, Long transactionId);

    List<Alert> findByAccountIdOrderByCreatedAtDesc(String accountId);

    List<Alert> findByAlertStatus(AlertStatus alertStatus);

    List<Alert> findByRule_Id(Long ruleId);
}


