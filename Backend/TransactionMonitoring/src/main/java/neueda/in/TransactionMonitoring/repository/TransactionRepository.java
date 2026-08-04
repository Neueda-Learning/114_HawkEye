package neueda.in.TransactionMonitoring.repository;
import neueda.in.TransactionMonitoring.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    @Query("""
        SELECT t FROM Transaction t
        WHERE (:accountId IS NULL OR t.accountId = :accountId)
          AND (:payeeId   IS NULL OR t.payeeId   = :payeeId)
          AND (:fromTime  IS NULL OR t.timestamp >= :fromTime)
          AND (:toTime    IS NULL OR t.timestamp <= :toTime)
        ORDER BY t.timestamp DESC
        """)
    Page<Transaction> findWithFilters(
        @Param("accountId") String accountId,
        @Param("payeeId")   String payeeId,
        @Param("fromTime")  Instant fromTime,
        @Param("toTime")    Instant toTime,
        Pageable pageable
    );
}
