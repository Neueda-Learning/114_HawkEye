package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Account;
import neueda.in.TransactionMonitoring.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    List<Account> findByStatus(AccountStatus status);

    boolean existsByAccountId(String accountId);
}

