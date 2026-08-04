package neueda.in.TransactionMonitoring.entity;
import jakarta.persistence.*;
import lombok.*;
import neueda.in.TransactionMonitoring.enums.TransactionStatus;
import neueda.in.TransactionMonitoring.enums.TransactionType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.math.BigDecimal;
import java.time.Instant;
@Entity
@Table(name = "transactions",
    indexes = {
        @Index(name = "idx_txn_account_id", columnList = "account_id"),
        @Index(name = "idx_txn_payee_id",   columnList = "payee_id"),
        @Index(name = "idx_txn_timestamp",  columnList = "timestamp")
    })
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Transaction {
    @Id @GeneratedValue @UuidGenerator
    @EqualsAndHashCode.Include
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    private String id;
    @Column(name = "account_id", nullable = false, length = 50)
    private String accountId;
    @Column(name = "payee_id", nullable = false, length = 50)
    private String payeeId;
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.COMPLETED;
    @Column(nullable = false)
    private Instant timestamp;
    @Column(length = 500)
    private String description;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
