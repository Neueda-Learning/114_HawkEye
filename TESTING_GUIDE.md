# HawkEye - Testing Quick Start Guide

**Date:** August 4, 2026  
**Purpose:** Get started with testing the HawkEye API using Postman

---

## 📋 QUICK START (5 Minutes)

### Step 1: Start the Server
```bash
# Navigate to Backend directory
cd Backend/TransactionMonitoring

# Start Spring Boot application
mvn spring-boot:run

# Server runs at: http://localhost:8080
```

### Step 2: Import Postman Collection
1. Open Postman
2. Click **File** → **Import**
3. Select `HawkEye_Postman_Collection.json` from project root
4. Collection imported with 28+ endpoints

### Step 3: First API Call
1. Expand **RULE MANAGEMENT** → **1. Create Rule**
2. Click **Send**
3. Verify response: `201 Created`

✅ You're ready to test!

---

## 🧪 TESTING WORKFLOW

### Phase 1: Rule Management (2 minutes)

#### 1️⃣ **Create a Rule**
```
Endpoint: POST /api/v1/rules
Status: Should return 201 CREATED
```

**Example Response:**
```json
{
  "success": true,
  "message": "Rule created successfully",
  "data": {
    "id": 1,
    "ruleName": "Daily Transfer Limit",
    "status": "ACTIVE",
    "createdAt": "2026-08-04T10:30:00Z"
  }
}
```

#### 2️⃣ **List All Rules**
```
Endpoint: GET /api/v1/rules?page=0&size=10
Status: Should return 200 OK
```

**Verify:**
- Check rule `id` (should be 1)
- Check pagination fields

#### 3️⃣ **Get Single Rule Details**
```
Endpoint: GET /api/v1/rules/1
Status: Should return 200 OK
```

**Verify:**
- Complete rule configuration
- Parameters visible
- Status = ACTIVE

#### 4️⃣ **Update Rule**
```
Endpoint: PUT /api/v1/rules/1
Status: Should return 200 OK
```

**Change:**
- Update severity to CRITICAL
- Update parameters

#### 5️⃣ **Get Audit Trail**
```
Endpoint: GET /api/v1/rules/1/audit-trail
Status: Should return 200 OK
```

**Verify:**
- See CREATED action
- See UPDATED action
- Before/after values recorded

#### 6️⃣ **Toggle Rule Status**
```
Endpoint: PUT /api/v1/rules/1/toggle
Status: Should return 200 OK
```

**Verify:**
- Status changed from ACTIVE to INACTIVE
- Audit trail shows STATUS_CHANGED action

#### 7️⃣ **Get Active Rules**
```
Endpoint: GET /api/v1/rules/active
Status: Should return 200 OK
```

**Verify:**
- Rule no longer in list (because status is INACTIVE)

---

### Phase 2: Transaction Management (3 minutes)

#### 1️⃣ **Create Transactions**
```
Endpoint: POST /api/v1/transactions
Status: Should return 201 CREATED
```

**Create 3 transactions:**
- ACC-001, Amount: $25,000
- ACC-001, Amount: $35,000
- ACC-002, Amount: $5,000

**Verify:**
- Each gets unique transaction ID
- Status: PENDING initially
- Timestamp recorded

#### 2️⃣ **List Transactions**
```
Endpoint: GET /api/v1/transactions?page=0&size=20
Status: Should return 200 OK
```

**Verify:**
- 3 transactions displayed
- Pagination info shows totalElements: 3

#### 3️⃣ **Filter Transactions**
```
Endpoint: GET /api/v1/transactions?accountId=ACC-001&status=PENDING
Status: Should return 200 OK
```

**Verify:**
- Only 2 transactions shown (from ACC-001)

#### 4️⃣ **Get Transaction Details**
```
Endpoint: GET /api/v1/transactions/1
Status: Should return 200 OK
```

**Verify:**
- Full transaction details
- Linked alerts array (empty at this point)

---

### Phase 3: Rule Engine & Alerts (3 minutes)

#### 1️⃣ **Re-enable the Rule**
```
Endpoint: PUT /api/v1/rules/1/toggle
Body: {"newStatus": "ACTIVE"}
Status: Should return 200 OK
```

#### 2️⃣ **Manual Rule Evaluation** ⚠️ _Dev Only_
```
Endpoint: POST /api/v1/rules/evaluate/1
Status: Should return 200 OK (dev profile only)
```

**Response includes:**
- transactionId
- rulesEvaluated: 1
- rulesTriggered: 1 (if rules matched)
- alertsCreated: 1

#### 3️⃣ **Get All Alerts**
```
Endpoint: GET /api/v1/alerts?page=0&size=20
Status: Should return 200 OK
```

**Verify:**
- Alert(s) created from rule evaluation
- Severity, status, rule name visible

#### 4️⃣ **Get Alert Statistics**
```
Endpoint: GET /api/v1/alerts/stats
Status: Should return 200 OK
```

**Verify:**
- Dashboard metrics
- total Alerts: 1+
- Breakdown by status/severity

#### 5️⃣ **Get Single Alert**
```
Endpoint: GET /api/v1/alerts/1
Status: Should return 200 OK
```

**Verify:**
- Alert details
- Transaction count
- Total amount from linked transactions

#### 6️⃣ **Acknowledge Alert**
```
Endpoint: PUT /api/v1/alerts/1/acknowledge
Status: Should return 200 OK
```

**Verify:**
- Status changed to ACKNOWLEDGED
- acknowledgedBy recorded

#### 7️⃣ **Start Investigation**
```
Endpoint: PUT /api/v1/alerts/1/investigate
Status: Should return 200 OK
```

**Verify:**
- Status changed to INVESTIGATING

#### 8️⃣ **Close Alert**
```
Endpoint: PUT /api/v1/alerts/1/close
Body: {"comment": "Legitimate transaction", "resolutionType": "BENIGN"}
Status: Should return 200 OK
```

**Verify:**
- Status changed to CLOSED
- Comment recorded

#### 9️⃣ **Get Alert Audit Trail**
```
Endpoint: GET /api/v1/alerts/1/audit-trail
Status: Should return 200 OK
```

**Verify:**
- CREATED action
- ACKNOWLEDGED action
- INVESTIGATED action
- CLOSED action
- Complete timestamp + user history

#### 🔟 **Get Alert Transactions**
```
Endpoint: GET /api/v1/alerts/1/transactions
Status: Should return 200 OK
```

**Verify:**
- Linked transactions displayed
- Same transactions that triggered alert

---

## 🔧 TESTING SCENARIOS

### ✅ Scenario 1: Complete Rule Lifecycle
```
1. Create rule (AMOUNT_THRESHOLD)
2. List rules (verify in list)
3. Update rule parameters
4. Get audit trail (2 actions: CREATED, UPDATED)
5. Toggle to INACTIVE
6. Get audit trail (3 actions: STATUS_CHANGED)
7. Delete rule
8. Get audit trail (4 actions: DELETED)
```

### ✅ Scenario 2: Filtering & Pagination
```
1. Create 15 rules
2. Get rules with page=0, size=10 (first 10)
3. Get rules with page=1, size=10 (next 5)
4. Filter by status=ACTIVE (should be subset)
5. Filter by severity=HIGH (should be subset)
6. Filter by search="Digital" (should match rule names)
```

### ✅ Scenario 3: Transaction with Alerts
```
1. Create DAILY_LIMIT rule (limit: $50,000)
2. Create 3 transactions (each $20,000)
3. Manual rule evaluation for each (dev only)
4. Get alerts (should have 1+ alerts)
5. List alerts with filtering
6. Get statistics (should show metrics)
```

### ✅ Scenario 4: Alert Lifecycle
```
1. Get alert in OPEN status
2. Acknowledge it
3. Get audit trail (should show ACKNOWLEDGED)
4. Start investigation
5. Close with comment
6. Verify status = CLOSED
7. Verify audit trail complete
```

### ✅ Scenario 5: Error Handling
```
1. Try to create rule with invalid type: "INVALID"
   Expected: 400 Bad Request with validation error
   
2. Try to get rule with ID 999:
   Expected: 404 Not Found with helpful message
   
3. Try to create AMOUNT_THRESHOLD rule with negative amount:
   Expected: 400 Bad Request from validator
   
4. Try to update non-existent rule/alert:
   Expected: 404 Not Found
```

---

## 📊 DATA VALIDATION CHECKLIST

### After Creating Rules
- [ ] Rule ID assigned
- [ ] Status = ACTIVE
- [ ] Severity level correct
- [ ] Parameters stored correctly
- [ ] createdAt timestamp set
- [ ] Audit trail entry created

### After Creating Transactions
- [ ] Transaction ID assigned
- [ ] Amount and currency correct
- [ ] Account/Payee IDs stored
- [ ] Timestamp recorded
- [ ] Status = PENDING

### After Rule Evaluation
- [ ] Alert created (if rule triggered)
- [ ] Alert linked to transaction
- [ ] Severity matches rule
- [ ] Status = OPEN

### After Alert Status Changes
- [ ] Status transition valid
- [ ] Audit entry recorded
- [ ] Timestamp updated
- [ ] User info captured

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Server Won't Start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process using port 8080
taskkill /PID <PID> /F

# Or use different port
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Issue: 404 Not Found
- ✅ Verify base URL: http://localhost:8080/api/v1
- ✅ Check resource ID exists in database
- ✅ Verify endpoint path is correct

### Issue: Validation Errors (400)
- ✅ Check required fields are present
- ✅ Verify field types (number, string, enum)
- ✅ Check parameter values are valid
- ✅ Read error message for specific issue

### Issue: Rule Evaluation Endpoint Returns 404
- ✅ Endpoint only available in `dev` profile
- ✅ Check if dev profile is active
- ✅ Fallback: alerts created automatically on transaction creation (in production mode)

---

## 📝 TESTING CHECKLIST

### API Endpoint Coverage
- [ ] Rule Management (8 endpoints)
  - [ ] POST /api/v1/rules
  - [ ] GET /api/v1/rules
  - [ ] GET /api/v1/rules/{id}
  - [ ] PUT /api/v1/rules/{id}
  - [ ] PUT /api/v1/rules/{id}/toggle
  - [ ] DELETE /api/v1/rules/{id}
  - [ ] GET /api/v1/rules/{id}/audit-trail
  - [ ] GET /api/v1/rules/active

- [ ] Transaction Management (4 endpoints)
  - [ ] POST /api/v1/transactions
  - [ ] GET /api/v1/transactions
  - [ ] GET /api/v1/transactions/{id}
  - [ ] GET /api/v1/transactions/{id}/alerts

- [ ] Alert Management (12 endpoints)
  - [ ] GET /api/v1/alerts
  - [ ] GET /api/v1/alerts/stats
  - [ ] GET /api/v1/alerts/history
  - [ ] GET /api/v1/alerts/history/closed
  - [ ] GET /api/v1/alerts/history/dismissed
  - [ ] GET /api/v1/alerts/{id}
  - [ ] GET /api/v1/alerts/{id}/audit-trail
  - [ ] GET /api/v1/alerts/{id}/transactions
  - [ ] PUT /api/v1/alerts/{id}/acknowledge
  - [ ] PUT /api/v1/alerts/{id}/investigate
  - [ ] PUT /api/v1/alerts/{id}/close
  - [ ] PUT /api/v1/alerts/{id}/dismiss

- [ ] Rule Engine (1 endpoint - dev only)
  - [ ] POST /api/v1/rules/evaluate/{transactionId}

### Validation Testing
- [ ] Invalid input rejected (400)
- [ ] Missing fields rejected (400)
- [ ] Non-existent resources return 404
- [ ] Invalid state transitions caught
- [ ] Audit trail captures all changes
- [ ] Pagination works correctly
- [ ] Filtering returns correct results

### Business Logic Testing
- [ ] Rule lifecycle: Create → Update → Toggle → Delete
- [ ] Transaction recorded and searchable
- [ ] Alert created when transaction matches rule
- [ ] Alert lifecycle: Open → Acknowledge → Investigate → Close
- [ ] Audit trail complete and accurate

---

## 📚 REFERENCE DOCUMENTS

1. **API_DOCUMENTATION.md** - Complete API specification with examples
2. **REQUIREMENTS_CHECKLIST.md** - All requirements status and assessment
3. **HawkEye_Postman_Collection.json** - Ready-to-use Postman collection

---

## ✅ SUCCESS CRITERIA

### After Testing, You Should Verify:

✅ All 24+ endpoints respond correctly  
✅ Data persisted in database  
✅ Audit trails recorded for all actions  
✅ Filtering and pagination work properly  
✅ Error messages are clear and helpful  
✅ Status transitions are valid  
✅ Timestamps and user tracking working  
✅ Rule evaluation triggers alerts correctly  

---

**Ready to Test?** Start with Phase 1 above! 🚀


