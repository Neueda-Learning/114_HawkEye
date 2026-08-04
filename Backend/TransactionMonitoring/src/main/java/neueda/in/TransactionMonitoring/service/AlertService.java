package neueda.in.TransactionMonitoring.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import neueda.in.TransactionMonitoring.DTO.RequestDTO.AlertStatusUpdateDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.AlertStatsResponseDTO;
import neueda.in.TransactionMonitoring.DTO.ResponseDTO.PagedResponseDTO;
import neueda.in.TransactionMonitoring.entity.Alert;
import neueda.in.TransactionMonitoring.enums.AlertSeverity;
import neueda.in.TransactionMonitoring.enums.AlertStatus;
import neueda.in.TransactionMonitoring.exception.InvalidStateTransitionException;
import neueda.in.TransactionMonitoring.exception.ResourceNotFoundException;
import neueda.in.TransactionMonitoring.mapper.AlertMapper;
import neueda.in.TransactionMonitoring.repository.AlertRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumSet;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlertService {

    private final AlertRepository alertRepository;
    private final AlertMapper     alertMapper;

    // ── Queries ──────────────────────────────────────────────────────────────

    public PagedResponseDTO<AlertResponseDTO> getAlerts(
            AlertStatus status, AlertSeverity severity, int page, int size) {

        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Alert> result;
        if (status != null && severity != null) {
            result = alertRepository.findByStatusAndSeverity(status, severity, pageable);
        } else if (status != null) {
            result = alertRepository.findByStatus(status, pageable);
        } else if (severity != null) {
            result = alertRepository.findBySeverity(severity, pageable);
        } else {
            result = alertRepository.findAll(pageable);
        }

        return PagedResponseDTO.<AlertResponseDTO>builder()
            .content(result.getContent().stream().map(alertMapper::toResponseDTO).toList())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .last(result.isLast())
            .build();
    }

    public AlertResponseDTO getAlertById(String id) {
        Alert alert = findAlertOrThrow(id);
        return alertMapper.toResponseDTO(alert);
    }

    public AlertStatsResponseDTO getStats() {
        return AlertStatsResponseDTO.builder()
            .open(alertRepository.countByStatus(AlertStatus.OPEN))
            .acknowledged(alertRepository.countByStatus(AlertStatus.ACKNOWLEDGED))
            .investigating(alertRepository.countByStatus(AlertStatus.INVESTIGATING))
            .closed(alertRepository.countByStatus(AlertStatus.CLOSED))
            .dismissed(alertRepository.countByStatus(AlertStatus.DISMISSED))
            .total(alertRepository.count())
            .build();
    }

    /** Alert history — all CLOSED and DISMISSED alerts, filterable by severity and rule name. */
    public PagedResponseDTO<AlertResponseDTO> getAlertHistory(
            AlertSeverity severity, String ruleName, int page, int size) {

        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size);
        Page<Alert> result = alertRepository.findHistory(severity, ruleName, pageable);

        return PagedResponseDTO.<AlertResponseDTO>builder()
            .content(result.getContent().stream().map(alertMapper::toResponseDTO).toList())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .last(result.isLast())
            .build();
    }

    /** Closed alerts only. */
    public PagedResponseDTO<AlertResponseDTO> getClosedAlerts(AlertSeverity severity, int page, int size) {
        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size);
        Page<Alert> result = alertRepository.findHistoryByStatus(AlertStatus.CLOSED, severity, pageable);

        return PagedResponseDTO.<AlertResponseDTO>builder()
            .content(result.getContent().stream().map(alertMapper::toResponseDTO).toList())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .last(result.isLast())
            .build();
    }

    /** Dismissed alerts only. */
    public PagedResponseDTO<AlertResponseDTO> getDismissedAlerts(AlertSeverity severity, int page, int size) {
        size = Math.min(size, 100);
        PageRequest pageable = PageRequest.of(page, size);
        Page<Alert> result = alertRepository.findHistoryByStatus(AlertStatus.DISMISSED, severity, pageable);

        return PagedResponseDTO.<AlertResponseDTO>builder()
            .content(result.getContent().stream().map(alertMapper::toResponseDTO).toList())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .last(result.isLast())
            .build();
    }

    // ── Lifecycle transitions ─────────────────────────────────────────────────

    /** OPEN → ACKNOWLEDGED */
    @Transactional
    public AlertResponseDTO acknowledgeAlert(String id) {
        Alert alert = findAlertOrThrow(id);
        validateTransition(alert.getStatus(), AlertStatus.ACKNOWLEDGED,
            EnumSet.of(AlertStatus.OPEN));
        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(Instant.now());
        log.info("Alert {} acknowledged", id);
        return alertMapper.toResponseDTO(alertRepository.save(alert));
    }

    /** ACKNOWLEDGED → INVESTIGATING */
    @Transactional
    public AlertResponseDTO startInvestigation(String id) {
        Alert alert = findAlertOrThrow(id);
        validateTransition(alert.getStatus(), AlertStatus.INVESTIGATING,
            EnumSet.of(AlertStatus.ACKNOWLEDGED));
        alert.setStatus(AlertStatus.INVESTIGATING);
        alert.setInvestigatingAt(Instant.now());
        log.info("Alert {} moved to INVESTIGATING", id);
        return alertMapper.toResponseDTO(alertRepository.save(alert));
    }

    /** INVESTIGATING → CLOSED */
    @Transactional
    public AlertResponseDTO closeAlert(String id, AlertStatusUpdateDTO dto) {
        Alert alert = findAlertOrThrow(id);
        validateTransition(alert.getStatus(), AlertStatus.CLOSED,
            EnumSet.of(AlertStatus.INVESTIGATING));
        alert.setStatus(AlertStatus.CLOSED);
        alert.setClosedAt(Instant.now());
        if (dto != null && dto.getResolutionNotes() != null) {
            alert.setResolutionNotes(dto.getResolutionNotes());
        }
        log.info("Alert {} closed", id);
        return alertMapper.toResponseDTO(alertRepository.save(alert));
    }

    /** OPEN / ACKNOWLEDGED / INVESTIGATING → DISMISSED */
    @Transactional
    public AlertResponseDTO dismissAlert(String id, AlertStatusUpdateDTO dto) {
        Alert alert = findAlertOrThrow(id);
        validateTransition(alert.getStatus(), AlertStatus.DISMISSED,
            EnumSet.of(AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED, AlertStatus.INVESTIGATING));
        alert.setStatus(AlertStatus.DISMISSED);
        alert.setDismissedAt(Instant.now());
        if (dto != null && dto.getResolutionNotes() != null) {
            alert.setResolutionNotes(dto.getResolutionNotes());
        }
        log.info("Alert {} dismissed", id);
        return alertMapper.toResponseDTO(alertRepository.save(alert));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Alert findAlertOrThrow(String id) {
        return alertRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Alert", id));
    }

    private void validateTransition(AlertStatus current, AlertStatus target,
                                    EnumSet<AlertStatus> allowed) {
        if (!allowed.contains(current)) {
            throw new InvalidStateTransitionException(current, target);
        }
    }
}

