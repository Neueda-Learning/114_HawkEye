package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class DailyLimitRuleConfigValidator implements RuleConfigValidator {

	@Override
	public RuleType supportedType() {
		return RuleType.DAILY_LIMIT;
	}

	@Override
	public void validate(Map<String, Object> parameters) {
		BigDecimal dailyLimitAmount = extractPositiveAmount(parameters, "dailyLimitAmount", "dailyLimit", "daily_limit_amount");
		if (dailyLimitAmount == null) {
			throw new IllegalArgumentException("dailyLimitAmount must be a number greater than 0");
		}
	}

	private BigDecimal extractPositiveAmount(Map<String, Object> parameters, String... keys) {
		if (parameters == null) {
			return null;
		}

		for (String key : keys) {
			Object value = parameters.get(key);
			if (value == null) {
				continue;
			}
			try {
				BigDecimal parsed = new BigDecimal(String.valueOf(value));
				if (parsed.compareTo(BigDecimal.ZERO) > 0) {
					return parsed;
				}
			} catch (NumberFormatException ignored) {
				return null;
			}
		}

		return null;
	}
}

