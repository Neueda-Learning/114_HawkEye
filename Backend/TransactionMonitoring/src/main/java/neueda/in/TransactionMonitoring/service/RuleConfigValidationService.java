package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class RuleConfigValidationService {

	private final Map<RuleType, RuleConfigValidator> validators = new EnumMap<>(RuleType.class);

	public RuleConfigValidationService(List<RuleConfigValidator> validatorList) {
		for (RuleConfigValidator validator : validatorList) {
			validators.put(validator.supportedType(), validator);
		}
	}

	public void validate(RuleType ruleType, Map<String, Object> parameters) {
		RuleConfigValidator validator = validators.get(ruleType);
		if (validator == null) {
			throw new IllegalArgumentException("No validator registered for rule type: " + ruleType);
		}
		validator.validate(parameters);
	}
}

