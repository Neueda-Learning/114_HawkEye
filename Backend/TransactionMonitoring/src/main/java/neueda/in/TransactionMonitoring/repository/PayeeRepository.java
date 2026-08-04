package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.Payee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayeeRepository extends JpaRepository<Payee, String> {

    List<Payee> findByPayeeType(String payeeType);

    boolean existsByPayeeId(String payeeId);
}

