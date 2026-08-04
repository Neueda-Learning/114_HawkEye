package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class VelocityRuleConfigValidator implements RuleConfigValidator {

	@Override
	public RuleType supportedType() {
		return RuleType.VELOCITY;
	}

	@Override
	public void validate(Map<String, Object> parameters) {
		Object windowMinutes = parameters.get("windowMinutes");
		Object maxTransactions = parameters.get("maxTransactions");

		if (!(windowMinutes instanceof Number windowValue) || windowValue.intValue() <= 0) {
			throw new IllegalArgumentException("windowMinutes must be a number greater than 0");
		}

		if (!(maxTransactions instanceof Number maxValue) || maxValue.intValue() <= 0) {
			throw new IllegalArgumentException("maxTransactions must be a number greater than 0");
		}
	}
}

