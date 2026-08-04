package neueda.in.TransactionMonitoring.repository;

import neueda.in.TransactionMonitoring.entity.AlertAuditTrail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertAuditTrailRepository extends JpaRepository<AlertAuditTrail, Long> {

    Page<AlertAuditTrail> findByAlertIdOrderByCreatedAtDesc(Long alertId, Pageable pageable);
}

