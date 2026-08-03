package neueda.in.TransactionMonitoring.service;

import neueda.in.TransactionMonitoring.enums.RuleType;

import java.util.Map;

public interface RuleConfigValidator {

	RuleType supportedType();

	void validate(Map<String, Object> parameters);
}

