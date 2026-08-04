package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class DailyLimitRuleConfigValidator implements RuleConfigValidator {

	@Override
	public RuleType supportedType() {
		return RuleType.DAILY_LIMIT;
	}

	@Override
	public void validate(Map<String, Object> parameters) {
		Object dailyLimitAmount = parameters.get("dailyLimitAmount");
		if (!(dailyLimitAmount instanceof Number numberValue) || numberValue.doubleValue() <= 0) {
			throw new IllegalArgumentException("dailyLimitAmount must be a number greater than 0");
		}
	}
}

