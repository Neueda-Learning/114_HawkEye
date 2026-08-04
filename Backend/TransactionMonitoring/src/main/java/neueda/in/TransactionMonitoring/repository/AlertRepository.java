package neueda.in.TransactionMonitoring.repository;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {
    Page<Alert> findByStatus(AlertStatus status, Pageable pageable);
    Page<Alert> findBySeverity(AlertSeverity severity, Pageable pageable);
    Page<Alert> findByStatusAndSeverity(AlertStatus status, AlertSeverity severity, Pageable pageable);
    /** Check for any existing open alert for the same rule + account to avoid duplicates. */
    @Query("""
        SELECT COUNT(a) > 0 FROM Alert a
        JOIN a.transactions t
        WHERE a.rule.id = :ruleId
          AND t.accountId = :accountId
          AND a.status NOT IN ('CLOSED', 'DISMISSED')
        """)
    boolean existsOpenAlertForRuleAndAccount(@Param("ruleId") String ruleId, @Param("accountId") String accountId);
    /** Count of alerts grouped by status (for dashboard stats). */
    @Query("SELECT a.status AS status, COUNT(a) AS count FROM Alert a GROUP BY a.status")
    List<Map<String, Object>> countGroupedByStatus();
    long countByStatus(AlertStatus status);

    /** Fetch history: alerts that are CLOSED or DISMISSED, with optional severity filter. */
    @Query("""
        SELECT a FROM Alert a
        WHERE a.status IN ('CLOSED', 'DISMISSED')
          AND (:severity IS NULL OR a.severity = :severity)
          AND (:ruleName IS NULL OR LOWER(a.ruleName) LIKE LOWER(CONCAT('%', :ruleName, '%')))
        ORDER BY a.closedAt DESC, a.dismissedAt DESC
        """)
    Page<Alert> findHistory(
        @Param("severity") AlertSeverity severity,
        @Param("ruleName") String ruleName,
        Pageable pageable
    );

    /** Fetch history by specific status (CLOSED only or DISMISSED only). */
    @Query("""
        SELECT a FROM Alert a
        WHERE a.status = :status
          AND (:severity IS NULL OR a.severity = :severity)
        ORDER BY a.createdAt DESC
        """)
    Page<Alert> findHistoryByStatus(
        @Param("status") AlertStatus status,
        @Param("severity") AlertSeverity severity,
        Pageable pageable
    );
}
