package neueda.in.TransactionMonitoring.repository;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.enums.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    // ── Person 3 usage — duplicate prevention ────────────────────────────────
    boolean existsByRuleIdAndTransaction_TransactionId(Long ruleId, Long transactionId);
    // ── Person 1 usage — fetch alerts for a transaction ──────────────────────
    @Query(value = """
            SELECT DISTINCT a.* FROM alerts a
            LEFT JOIN alert_transactions at ON a.alert_id = at.alert_id
            WHERE a.transaction_id = :transactionId
               OR at.transaction_id = :transactionId
            ORDER BY a.created_at DESC
            """, nativeQuery = true)
    List<Alert> findAllByTransactionId(@Param("transactionId") Long transactionId);
    List<Alert> findByAccount_AccountIdOrderByCreatedAtDesc(String accountId);
    // ── My usage (Alert Lifecycle) ─────────────────────────────────────────
    Page<Alert> findByAlertStatus(AlertStatus alertStatus, Pageable pageable);
    Page<Alert> findBySeverity(Severity severity, Pageable pageable);
    Page<Alert> findByAlertStatusAndSeverity(AlertStatus alertStatus, Severity severity, Pageable pageable);
    long countByAlertStatus(AlertStatus alertStatus);
    // History: CLOSED + DISMISSED alerts
    @Query("SELECT a FROM Alert a WHERE a.alertStatus IN ('CLOSED', 'DISMISSED') ORDER BY a.updatedAt DESC")
    Page<Alert> findHistory(Pageable pageable);
    @Query("SELECT a FROM Alert a WHERE a.alertStatus IN ('CLOSED', 'DISMISSED') AND (:severity IS NULL OR a.severity = :severity) ORDER BY a.updatedAt DESC")
    Page<Alert> findHistoryBySeverity(@Param("severity") Severity severity, Pageable pageable);
}
