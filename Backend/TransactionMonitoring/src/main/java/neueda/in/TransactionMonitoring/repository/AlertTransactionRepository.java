package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.AlertTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertTransactionRepository extends JpaRepository<AlertTransaction, Long> {

    boolean existsByAlert_AlertIdAndTransaction_TransactionId(Long alertId, Long transactionId);

    List<AlertTransaction> findByAlert_AlertIdOrderByLinkedAtAsc(Long alertId);
}

