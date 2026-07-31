package neueda.in.TransactionMonitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Account entity — owned by Person 1.
 * Person 3 reads this as a reference for alert account linkage.
 */
@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @Column(name = "account_id", length = 50, nullable = false)
    private String accountId;

    @Column(name = "account_holder_name", length = 100)
    private String accountHolderName;

    @Column(name = "account_type", length = 50)
    private String accountType;

    @Column(name = "is_active")
    private Boolean isActive = true;
}

