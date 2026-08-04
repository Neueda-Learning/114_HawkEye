package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AmountThresholdRuleConfigValidator implements RuleConfigValidator {

	@Override
	public RuleType supportedType() {
		return RuleType.AMOUNT_THRESHOLD;
	}

	@Override
	public void validate(Map<String, Object> parameters) {
		Object thresholdAmount = parameters.get("thresholdAmount");
		if (!(thresholdAmount instanceof Number numberValue) || numberValue.doubleValue() <= 0) {
			throw new IllegalArgumentException("thresholdAmount must be a number greater than 0");
		}
	}
}

