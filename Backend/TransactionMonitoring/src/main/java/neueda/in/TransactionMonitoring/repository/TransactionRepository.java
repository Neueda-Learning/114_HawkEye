package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /** Used by VelocityEvaluator & DailyLimitEvaluator */
    List<Transaction> findByAccountIdAndTransactionDateBetween(
            String accountId, LocalDateTime from, LocalDateTime to);

    /** Used by VelocityEvaluator — count query for performance */
    long countByAccountIdAndTransactionDateBetween(
            String accountId, LocalDateTime from, LocalDateTime to);

    /** Used by NewPayeeEvaluator — prior transactions to same payee */
    List<Transaction> findByAccountIdAndPayeeAccountId(String accountId, String payeeAccountId);
}

