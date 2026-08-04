package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class NewPayeeRuleConfigValidator implements RuleConfigValidator {

	@Override
	public RuleType supportedType() {
		return RuleType.NEW_PAYEE;
	}

	@Override
	public void validate(Map<String, Object> parameters) {
		if (parameters == null || parameters.isEmpty()) {
			return;
		}

		Object lookbackDays = parameters.get("lookbackDays");
		if (lookbackDays != null && (!(lookbackDays instanceof Number numberValue) || numberValue.intValue() <= 0)) {
			throw new IllegalArgumentException("lookbackDays must be a number greater than 0");
		}
	}
}

