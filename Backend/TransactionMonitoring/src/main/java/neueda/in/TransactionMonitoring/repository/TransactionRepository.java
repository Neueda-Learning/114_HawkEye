package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Account;
import neueda.in.TransactionMonitoring.entity.Payee;
import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    // List all transactions for a specific account (paginated)
    Page<Transaction> findByAccount_AccountId(String accountId, Pageable pageable);

    // List by status
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);

    // Duplicate check — same account, payee, amount, and timestamp
    boolean existsByAccountAndPayeeAndAmountAndTimestamp(
            Account account,
            Payee payee,
            BigDecimal amount,
            LocalDateTime timestamp
    );

    // Velocity rule support — count transactions for an account within a time window
    @Query("SELECT COUNT(t) FROM Transaction t " +
           "WHERE t.account.accountId = :accountId " +
           "AND t.timestamp >= :from AND t.timestamp <= :to")
    long countByAccountIdAndTimestampBetween(
            @Param("accountId") String accountId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // Daily limit rule support — sum of debits for an account on a given day
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.account.accountId = :accountId " +
           "AND DATE(t.timestamp) = DATE(:date) " +
           "AND t.transactionType = 'DEBIT'")
    BigDecimal sumDebitAmountByAccountIdAndDate(
            @Param("accountId") String accountId,
            @Param("date") LocalDateTime date
    );

    // New payee check — count previous transactions from account to payee
    @Query("SELECT COUNT(t) FROM Transaction t " +
           "WHERE t.account.accountId = :accountId " +
           "AND t.payee.payeeId = :payeeId " +
           "AND t.timestamp < :before")
    long countPreviousTransactionsToPayee(
            @Param("accountId") String accountId,
            @Param("payeeId") String payeeId,
            @Param("before") LocalDateTime before
    );

    // Fetch full transaction history for an account (for investigation screen)
    List<Transaction> findByAccount_AccountIdOrderByTimestampDesc(String accountId);
}

