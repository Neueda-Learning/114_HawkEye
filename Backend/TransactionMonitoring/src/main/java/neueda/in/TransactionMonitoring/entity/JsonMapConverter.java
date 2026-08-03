package neueda.in.TransactionMonitoring.entity;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.Map;

@Converter
public class JsonMapConverter implements AttributeConverter<Map<String, Object>, String> {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
	private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
	};

	@Override
	public String convertToDatabaseColumn(Map<String, Object> attribute) {
		if (attribute == null || attribute.isEmpty()) {
			return "{}";
		}

		try {
			return OBJECT_MAPPER.writeValueAsString(attribute);
		} catch (Exception exception) {
			throw new IllegalArgumentException("Unable to serialize JSON parameters", exception);
		}
	}

	@Override
	public Map<String, Object> convertToEntityAttribute(String dbData) {
		if (dbData == null || dbData.isBlank()) {
			return Collections.emptyMap();
		}

		try {
			return OBJECT_MAPPER.readValue(dbData, MAP_TYPE);
		} catch (Exception exception) {
			throw new IllegalArgumentException("Unable to deserialize JSON parameters", exception);
		}
	}
}

