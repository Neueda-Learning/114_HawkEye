package neueda.in.TransactionMonitoring.mapper;

import neueda.in.TransactionMonitoring.DTO.ResponseDTO.TransactionResponseDTO;
import neueda.in.TransactionMonitoring.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

	public TransactionResponseDTO toResponseDTO(Transaction t) {
		if (t == null) {
			return null;
		}

		return TransactionResponseDTO.builder()
				.transactionId(t.getTransactionId())
				.accountId(t.getAccount() != null ? t.getAccount().getAccountId() : null)
				.accountName(t.getAccount() != null ? t.getAccount().getAccountName() : null)
				.payeeId(t.getPayee() != null ? t.getPayee().getPayeeId() : null)
				.payeeName(t.getPayee() != null ? t.getPayee().getPayeeName() : null)
				.amount(t.getAmount())
				.currency(t.getCurrency())
				.transactionType(t.getTransactionType())
				.status(t.getStatus())
				.description(t.getDescription())
				.timestamp(t.getTimestamp())
				.createdAt(t.getCreatedAt())
				.build();
	}
}
