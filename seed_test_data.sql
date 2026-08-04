USE HawkEye;
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM alerts;
DELETE FROM transactions;
DELETE FROM rules;
DELETE FROM accounts;

SET FOREIGN_KEY_CHECKS = 1;

-- account
INSERT INTO accounts(account_id, account_holder_name, account_type, is_active)
VALUES ('ACC1001', 'Test User', 'SAVINGS', 1);

-- rules
INSERT INTO rules(id,name,description,rule_type,status,severity,parameters_json,created_by,updated_by,created_at,updated_at,version)
VALUES
(800001,'Amount > 1000','Threshold rule','AMOUNT_THRESHOLD','ACTIVE','HIGH','{"thresholdAmount":1000}','qa','qa',NOW(),NOW(),0),
(800002,'Velocity 3/60','Velocity rule','VELOCITY','ACTIVE','MEDIUM','{"velocityCount":3,"velocityWindowMinutes":60}','qa','qa',NOW(),NOW(),0),
(800003,'New Payee','New payee rule','NEW_PAYEE','ACTIVE','MEDIUM','{}','qa','qa',NOW(),NOW(),0),
(800004,'Daily Limit 2000','Daily limit rule','DAILY_LIMIT','ACTIVE','CRITICAL','{"dailyLimitAmount":2000}','qa','qa',NOW(),NOW(),0);

-- TC-A: Amount MATCH (1500 > 1000) → expect AMOUNT_THRESHOLD alert
INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description)
VALUES (910001,'ACC1001',1500.00,'PAYEE_A',NOW(),'TRANSFER','TC-A amount match');

-- TC-B: Amount NON-MATCH (500 < 1000) → expect no amount alert
INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description)
VALUES (910002,'ACC1001',500.00,'PAYEE_B',NOW(),'TRANSFER','TC-B amount non-match');

-- TC-C: New payee FIRST TIME → expect NEW_PAYEE alert
INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description)
VALUES (910003,'ACC1001',200.00,'PAYEE_NEW',DATE_SUB(NOW(), INTERVAL 2 MINUTE),'TRANSFER','TC-C new payee first');

-- TC-D: Same payee AGAIN → expect NO new-payee alert
INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description)
VALUES (910004,'ACC1001',220.00,'PAYEE_NEW',NOW(),'TRANSFER','TC-D new payee repeat');

-- TC-E: Velocity - 4 txns in 60 min → alert triggers on 4th
INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description) VALUES
(910005,'ACC1001',100.00,'PAYEE_V1',DATE_SUB(NOW(), INTERVAL 20 MINUTE),'TRANSFER','TC-E velocity 1'),
(910006,'ACC1001',100.00,'PAYEE_V2',DATE_SUB(NOW(), INTERVAL 15 MINUTE),'TRANSFER','TC-E velocity 2'),
(910007,'ACC1001',100.00,'PAYEE_V3',DATE_SUB(NOW(), INTERVAL 10 MINUTE),'TRANSFER','TC-E velocity 3'),
(910008,'ACC1001',100.00,'PAYEE_V4',DATE_SUB(NOW(), INTERVAL 5  MINUTE),'TRANSFER','TC-E velocity 4');

-- TC-F: Daily limit - cumulative exceeds 2000 → alert on 2nd txn
INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description)
VALUES (910009,'ACC1001',900.00,'PAYEE_D1',DATE_SUB(NOW(), INTERVAL 30 MINUTE),'TRANSFER','TC-F daily 1');

INSERT INTO transactions(transaction_id,account_id,amount,payee_account_id,transaction_date,transaction_type,description)
VALUES (910010,'ACC1001',1200.00,'PAYEE_D2',DATE_SUB(NOW(), INTERVAL 10 MINUTE),'TRANSFER','TC-F daily 2');

SET SQL_SAFE_UPDATES = 1;

SELECT 'Seed complete. Transactions inserted:' AS msg;
SELECT transaction_id, account_id, amount, payee_account_id, description FROM transactions ORDER BY transaction_id;
SELECT id, name, rule_type, status FROM rules ORDER BY id;

