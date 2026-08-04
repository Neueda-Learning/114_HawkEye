# Person 2 Build Plan - Step by Step

## PROJECT STRUCTURE
```
Backend/TransactionMonitoring/src/main/java/neueda/in/TransactionMonitoring/
├── entity/              ← STEP 1 (6 files)
├── repository/          ← STEP 2 (2 files)
├── service/             ← STEP 3 (6 files)
├── DTO/rule/            ← STEP 4 (6 files)
├── mapper/              ← STEP 5 (1 file)
├── controller/          ← STEP 6 (1 file)
└── exception/           ← STEP 7 (3 files)
```

---

## STEP 1: ENTITY LAYER (6 files)
### Folder: `entity/`

| # | File | Purpose |
|---|------|---------|
| 1 | `RuleType.java` | Enum: AMOUNT_THRESHOLD, VELOCITY, NEW_PAYEE, DAILY_LIMIT |
| 2 | `RuleStatus.java` | Enum: ACTIVE, INACTIVE, DELETED |
| 3 | `RuleSeverity.java` | Enum: LOW, MEDIUM, HIGH, CRITICAL |
| 4 | `AuditAction.java` | Enum: CREATED, UPDATED, STATUS_CHANGED, DELETED |
| 5 | `JsonMapConverter.java` | JPA converter for Map<String,Object> ↔ JSON |
| 6 | `Rule.java` | Main rule entity (JPA) |
| 7 | `RuleAuditTrail.java` | Audit history entity (JPA) |

---

## STEP 2: REPOSITORY LAYER (2 files)
### Folder: `repository/`

| # | File | Purpose |
|---|------|---------|
| 8 | `RuleRepository.java` | JPA interface for Rule queries |
| 9 | `RuleAuditTrailRepository.java` | JPA interface for audit queries |

---

## STEP 3: SERVICE LAYER (6 files)
### Folder: `service/`

| # | File | Purpose |
|---|------|---------|
| 10 | `RuleConfigValidator.java` | Interface for parameter validation |
| 11 | `AmountThresholdRuleConfigValidator.java` | Validator for AMOUNT_THRESHOLD |
| 12 | `VelocityRuleConfigValidator.java` | Validator for VELOCITY |
| 13 | `NewPayeeRuleConfigValidator.java` | Validator for NEW_PAYEE |
| 14 | `DailyLimitRuleConfigValidator.java` | Validator for DAILY_LIMIT |
| 15 | `RuleAuditTrailService.java` | Records every audit entry |
| 16 | `RuleService.java` | Main business logic (create, update, toggle, etc.) |

---

## STEP 4: DTO LAYER (6 files)
### Folder: `DTO/rule/`

| # | File | Purpose |
|---|------|---------|
| 17 | `CreateRuleRequest.java` | Request body for POST /api/v1/rules |
| 18 | `UpdateRuleRequest.java` | Request body for PUT /api/v1/rules/{id} |
| 19 | `ToggleRuleStatusRequest.java` | Request body for PUT /api/v1/rules/{id}/toggle |
| 20 | `RuleResponse.java` | Response for single rule |
| 21 | `RuleActionResponse.java` | Response for create/update/toggle |
| 22 | `RuleAuditTrailResponse.java` | Response for audit entry |
| 23 | `RuleListResponse.java` | Paginated response |
| 24 | `RuleAuditTrailListResponse.java` | Paginated audit response |

---

## STEP 5: MAPPER (1 file)
### Folder: `mapper/`

| # | File | Purpose |
|---|------|---------|
| 25 | `RuleMapper.java` | Convert entity ↔ DTO |

---

## STEP 6: CONTROLLER (1 file)
### Folder: `controller/`

| # | File | Purpose |
|---|------|---------|
| 26 | `RuleController.java` | REST endpoints (all 7 endpoints) |

---

## STEP 7: EXCEPTION HANDLING (3 files)
### Folder: `exception/`

| # | File | Purpose |
|---|------|---------|
| 27 | `ResourceNotFoundException.java` | Custom exception for 404 |
| 28 | `InvalidRuleConfigurationException.java` | Custom exception for bad params |
| 29 | `GlobalExceptionHandler.java` | @RestControllerAdvice for all errors |

---

## TOTAL FILES: 29

### BUILD APPROACH:
- Start with STEP 1 (entity layer) — 7 files
- All enums first (simple)
- Then converters and entities
- Only then move to repositories
- Build order is intentional: bottom-up dependency

### Each file:
1. I show you the code
2. Explain what it does
3. You approve or request changes
4. We move to next file

---

## Start now?
Ready to create **FILE #1: RuleType.java** ?

