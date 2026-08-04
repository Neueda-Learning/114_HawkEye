package neueda.in.TransactionMonitoring.specification;

import neueda.in.TransactionMonitoring.entity.Transaction;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Dynamic filter builder for GET /api/v1/transactions query params.
 * Each method returns null (ignored) when the filter value is not provided.
 */
public class TransactionSpecification {

    private TransactionSpecification() {}

    public static Specification<Transaction> hasAccountId(String accountId) {
        return (root, query, cb) ->
                accountId == null || accountId.isBlank()
                        ? null
                        : cb.equal(root.get("account").get("accountId"), accountId);
    }

    public static Specification<Transaction> hasStatus(TransactionStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Transaction> hasTransactionType(TransactionType type) {
        return (root, query, cb) ->
                type == null ? null : cb.equal(root.get("transactionType"), type);
    }

    public static Specification<Transaction> hasPayeeId(String payeeId) {
        return (root, query, cb) ->
                payeeId == null || payeeId.isBlank()
                        ? null
                        : cb.equal(root.get("payee").get("payeeId"), payeeId);
    }

    public static Specification<Transaction> amountGreaterThanOrEqual(BigDecimal minAmount) {
        return (root, query, cb) ->
                minAmount == null ? null : cb.greaterThanOrEqualTo(root.get("amount"), minAmount);
    }

    public static Specification<Transaction> amountLessThanOrEqual(BigDecimal maxAmount) {
        return (root, query, cb) ->
                maxAmount == null ? null : cb.lessThanOrEqualTo(root.get("amount"), maxAmount);
    }

    public static Specification<Transaction> timestampAfter(LocalDateTime startDate) {
        return (root, query, cb) ->
                startDate == null ? null : cb.greaterThanOrEqualTo(root.get("timestamp"), startDate);
    }

    public static Specification<Transaction> timestampBefore(LocalDateTime endDate) {
        return (root, query, cb) ->
                endDate == null ? null : cb.lessThanOrEqualTo(root.get("timestamp"), endDate);
    }
}

