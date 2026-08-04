package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Person 3 usage — duplicate prevention for same rule + transaction
    boolean existsByRuleIdAndTransaction_TransactionId(Long ruleId, Long transactionId);

    /**
     * Person 1 usage — fetch all alerts linked to a transaction.
     * Checks both:
     *   1. Direct FK: alerts.transaction_id = transactionId
     *   2. Junction table: alert_transactions.transaction_id = transactionId
     * NOTE: alert_transactions table is created by Person 2 (Alerts Domain).
     *       Until then, only direct FK results are returned.
     */
    @Query(value = """
            SELECT DISTINCT a.* FROM alerts a
            LEFT JOIN alert_transactions at ON a.alert_id = at.alert_id
            WHERE a.transaction_id = :transactionId
               OR at.transaction_id = :transactionId
            ORDER BY a.created_at DESC
            """, nativeQuery = true)
    List<Alert> findAllByTransactionId(@Param("transactionId") Long transactionId);

    // Fetch all alerts for an account
    List<Alert> findByAccount_AccountIdOrderByCreatedAtDesc(String accountId);

    // Fetch open alerts count (used by dashboard — Person 2 but shared)
    long countByAlertStatus(AlertStatus alertStatus);
}


