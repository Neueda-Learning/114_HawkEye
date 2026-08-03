package neueda.in.TransactionMonitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "payees",
    indexes = {
        @Index(name = "idx_payee_name", columnList = "payee_name")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payee {

    @Id
    @Column(name = "payee_id", length = 100)
    private String payeeId;

    @Column(name = "payee_name", nullable = false, length = 100)
    private String payeeName;

    @Column(name = "payee_type", length = 50)
    private String payeeType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

