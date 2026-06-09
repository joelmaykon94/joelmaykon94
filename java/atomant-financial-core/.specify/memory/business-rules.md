# Business Rules: Enterprise-Financial-Core Module

**System**: Investment & Payment Processing Platform
**Module**: enterprise-financial-core (Financial Core & Ledger Engine)
**Purpose**: Double-entry ledger accounting, settlement clearing, anti-fraud detection, dynamic fee configuration, legacy system integration
**Regulatory Context**: CVM (accounting records), BACEN (clearing rules), Tax authority (general ledger), COAF (transaction monitoring)

---

## 1. Module Overview & Responsibilities

The **Enterprise-Financial-Core Module** is the authoritative financial backbone handling enterprise accounting and clearing operations:

1. **Double-Entry Ledger**: Record all financial transactions using double-entry bookkeeping rules
2. **Settlement Clearing**: Manage interbank clearing, instant payment routing, settlement confirmation
3. **Anti-Fraud Transaction Monitoring**: Real-time analysis of transaction patterns, rule-based fraud detection
4. **Dynamic Fee Configuration**: Define and compute operational fees, tax exemptions, dynamic pricing
5. **Legacy System Integration**: Anti-corruption layer for mainframe/COBOL systems (Strangler Fig pattern)
6. **Account Master Data**: Master accounts (Chart of Accounts), account hierarchies, reconciliation rules
7. **Transaction Monitoring & Reporting**: Real-time transaction monitoring, regulatory reporting (BACEN, CVM, tax authority)

---

## 2. Double-Entry Ledger (Razão)

### Ledger Entry Entity

**Ledger Record**:
- `entryId` (UUID): Unique ledger entry identifier
- `entryNumber` (Long): Sequential entry number per journal (for audit trail)
- `journalId` (String): Reference to journal (e.g., "DAILY-2026-06-08")
- `postingDate` (Date): Date when transaction posted
- `valueDate` (Date): Date for which transaction is effective (may differ from posting date)
- `description` (String): Transaction narrative (e.g., "Investment fee - Fund ABC")
- `amount` (BigDecimal, scale 2): Transaction amount in reais
- `debitAccountId` (String): Account being debited
- `creditAccountId` (String): Account being credited
- `debitAccountName` (String): Debit account name (denormalized for reporting)
- `creditAccountName` (String): Credit account name (denormalized for reporting)
- `sourceTransactionId` (UUID, nullable): Reference to source payment or investment
- `costCenter` (String, nullable): Cost center allocation (for fund management fees)
- `documentType` (String, nullable): Source document (e.g., "INVOICE-001", "REDEMPTION-456")
- `status` (Enum): DRAFT, POSTED, REVERSED, RECONCILED
- `createdTimestamp` (Timestamp): Record creation time
- `createdBy` (String): User/system that created entry
- `reversalEntryId` (UUID, nullable): Reference to reversal if reversed

### Chart of Accounts (Plano de Contas)

**Account Master Record**:
- `accountId` (String): 6-12 character code (e.g., "1.1.1.001" hierarchical)
- `accountName` (String): Full account description
- `accountType` (Enum): ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
- `accountClass` (String): Detailed classification (e.g., "Current Asset", "Operating Expense")
- `parentAccountId` (String, nullable): For hierarchical structure
- `debitOrCredit` (Enum): DEBIT (normal balance is debit) or CREDIT (normal balance is credit)
- `isActive` (Boolean): Can accept new transactions
- `reconciliationRequired` (Boolean): Account must reconcile with external GL
- `taxableBasis` (Boolean): Subject to tax reporting
- `currency` (String): "BRL" (all internal in BRL)
- `createdDate` (Date): Account creation date
- `retirementDate` (Date, nullable): Account deactivation date

**Sample Chart of Accounts**:

| Account ID | Account Name | Type | Normal Balance |
|-----------|-------------|------|----------------|
| 1.1.1.001 | Cash - Bank ABC | Asset | Debit |
| 1.1.2.001 | Fees Receivable | Asset | Debit |
| 1.2.1.001 | Investor Deposits (Liability) | Liability | Credit |
| 2.1.1.001 | Retained Earnings | Equity | Credit |
| 4.1.1.001 | Management Fees - Revenue | Revenue | Credit |
| 4.1.1.002 | Custody Fees - Revenue | Revenue | Credit |
| 5.1.1.001 | Administrative Expenses | Expense | Debit |
| 5.1.2.001 | Tech Infrastructure Costs | Expense | Debit |

### Ledger Posting Rules

**Double-Entry Rule**:
```
For every transaction:
  Debit Amount = Credit Amount (always)
  
Example (Investment Deposit):
  Debit:  1.1.1.001 (Cash) = R$ 10,000.00
  Credit: 1.2.1.001 (Investor Deposits) = R$ 10,000.00
```

**Validation Rules**:
- Total debits must equal total credits for each entry
- Debit account must support debit postings (based on account type)
- Credit account must support credit postings
- Amount must be > 0
- Both accounts must be ACTIVE (not retired)
- Posting date cannot be > 90 days in future (controls)

### Ledger Transaction Types

| Transaction | Source | Debit Account | Credit Account | Trigger |
|-----------|--------|---------------|----------------|---------|
| Investment Deposit | Investment order | Cash | Investor Deposits | Investment settled |
| Redemption Payout | Redemption order | Investor Deposits | Cash | Redemption settled |
| Management Fee | Daily fee calc | Fees Receivable | Management Fees (Revenue) | Fee calculation |
| Fee Collection | Fee payment | Cash | Fees Receivable | Fee payment received |
| Dividend Distribution | Distribution | Retained Earnings | Investor Dividends | Distribution approved |

---

## 3. Settlement & Clearing (Liquidação)

### Settlement Instruction Entity

**Settlement Record**:
- `settlementId` (UUID): Unique settlement identifier
- `fundId` (UUID): Fund being settled
- `settlementDate` (Date): Clearing/settlement date (business day per BACEN calendar)
- `settlementType` (Enum): INVESTMENT_SETTLEMENT, REDEMPTION_SETTLEMENT, FEE_SETTLEMENT, DIVIDEND_SETTLEMENT
- `totalAmount` (BigDecimal, scale 2): Total amount being settled
- `transactionCount` (Integer): Count of transactions in batch
- `status` (Enum): PENDING, PROCESSING, PARTIAL_COMPLETE, COMPLETE, FAILED, REVERSED
- `clearingSystemId` (String, nullable): External clearing system reference (BACEN, CIP)
- `startTime` (Timestamp): Settlement start time
- `completeTime` (Timestamp, nullable): Settlement completion time
- `failureReason` (String, nullable): If FAILED, reason code

### Settlement Workflow (Investment Deposits)

**Schedule**: T+0 (same day, end of day) or T+1 (next business day)

1. **Batch Accumulation** (9:00 AM - 4:30 PM):
   - Collect all investment orders settled that day
   - Group by fund sweep account
   - Calculate total amount per fund

2. **Pre-Settlement Validation** (4:30 PM):
   - Verify all payment orders CONFIRMED (funds actually received)
   - Verify no investor holds (AML freezes, etc.)
   - Verify fund has capacity to accept investments
   - Validate total amount <= daily investment cap

3. **Settlement Processing** (4:45 PM):
   - Create settlement instruction record
   - For each investor's investment:
     - Post double-entry ledger entry (Cash → Investor Deposits)
     - Create quota allocation record in investment-core
     - Publish INVESTMENT_SETTLED event
   - Update settlement status: PROCESSING

4. **Clearing Confirmation** (5:00 PM):
   - All entries posted; settlement COMPLETE
   - Publish SETTLEMENT_COMPLETE event
   - Generate settlement report
   - Notify compliance/operations

5. **Reconciliation** (Next morning 8:00 AM):
   - Verify all investors received quota allocations
   - Verify fund balance matches ledger
   - Flag any discrepancies for manual investigation

### Settlement Clearing Rules (BACEN)

| Clearing Type | Instant | Time Window | Settlement Date |
|---|---|---|---|
| **PIX (Instant)** | Yes | 24/7 | T+0 (within 10s) |
| **TED** | No | 9:00 AM - 4:30 PM | T+1 |
| **CEST (ACH)** | No | 9:00 AM - 5:00 PM | T+2 |
| **Book Entry** | Yes | Anytime | T+0 (internal) |

---

## 4. Anti-Fraud Detection (Prevenção de Fraude)

### Transaction Telemetry Entity

**Transaction Analysis Record**:
- `telemetryId` (UUID): Unique analysis record
- `transactionId` (UUID): Reference to payment or investment
- `accountId` (String): Account being analyzed
- `transactionType` (String): INVESTMENT, REDEMPTION, TRANSFER
- `amount` (BigDecimal, scale 2): Transaction amount
- `targetAccount` (String): Destination account/merchant
- `timestamp` (Timestamp): Transaction time
- `ipAddress` (String): Client IP (if available)
- `deviceId` (String, nullable): Client device identifier
- `geolocation` (String, nullable): Geographic location (country)
- `riskScore` (Integer, 0-100): Calculated risk (0 = safe, 100 = blocked)
- `blockedRules` (String[]): Which fraud rules triggered
- `status` (Enum): APPROVED, CHALLENGED, BLOCKED
- `analysisDetails` (JSON): Detailed rule breakdown
- `createdTimestamp` (Timestamp): Analysis time

### Fraud Detection Rules

**Rule 1: Velocity Check**
```
Rule: TransactionCount > 10 in 1 hour
Action: Increment risk score by +30
Trigger: Block if riskScore > 80
```

**Rule 2: Amount Spike**
```
Rule: Transaction > (Average Daily * 3)
Example: If avg daily = R$ 10k, transaction > R$ 30k triggers
Action: Increment risk score by +25
```

**Rule 3: Unusual Time**
```
Rule: Transaction between 2 AM - 5 AM
Action: Increment risk score by +15
```

**Rule 4: New Destination**
```
Rule: Target account never seen before
Action: Increment risk score by +20
```

**Rule 5: Geographic Anomaly**
```
Rule: IP geolocation changes > 1000km in 1 hour
Action: Increment risk score by +40
Block immediately if change > 5000km (physically impossible)
```

**Rule 6: Account Holder Name Mismatch**
```
Rule: Investor name ≠ target account holder name
Action: Increment risk score by +50
Block if no match (prevent fraud)
```

### Risk-Based Authentication

**Risk Score Tiers**:

| Score | Action | Authentication Required |
|-------|--------|------------------------|
| 0-30 | APPROVED | None |
| 31-60 | CHALLENGED | OTP (one-time password via SMS) |
| 61-80 | CHALLENGED | MFA (SMS + security question) |
| 81-100 | BLOCKED | Manual compliance review |

### Rule Engine Workflow

**Real-Time Processing** (< 100ms):
1. Transaction submitted → Create telemetry record
2. Run all fraud rules in parallel
3. Calculate cumulative risk score
4. Route to appropriate action:
   - Score 0-30: Auto-approve
   - Score 31-80: Challenge with MFA
   - Score 81-100: Block + escalate

**Example Decision Tree**:
```
If riskScore > 80:
  Block transaction
  Set status = BLOCKED
  Notify compliance (create case)
  Notify investor (send email explaining block)
  Require manual approval to proceed
Else if riskScore > 60:
  Challenge with MFA
  Request OTP + security question
  If OTP valid + answer correct:
    Approve transaction
  Else:
    Block + escalate
Else:
  Auto-approve
  Post to ledger
  Publish confirmation event
```

---

## 5. Dynamic Fee Configuration (Tarifário)

### Fee Policy Entity

**Fee Configuration Record**:
- `feeId` (String): Unique fee identifier (e.g., "FEE-MGT-001")
- `feeType` (Enum): MANAGEMENT_FEE, CUSTODY_FEE, PERFORMANCE_FEE, REDEMPTION_FEE, ADMINISTRATION_FEE
- `fundId` (UUID, nullable): Fund-specific fee; null = default for all funds
- `baseFeeRate` (BigDecimal, scale 6): Base annual rate (e.g., 0.005000 for 0.5%)
- `minimumFee` (BigDecimal, scale 2): Minimum annual fee in reais
- `maximumFee` (BigDecimal, scale 2): Maximum annual fee cap in reais
- `feeBreakdown` (JSON): Tiered structure (e.g., 0% on first R$ 1M, 0.3% on next R$ 5M)
- `effectiveDate` (Date): When fee takes effect
- `expirationDate` (Date, nullable): When fee expires (null = perpetual)
- `exemptionCriteria` (String, nullable): Conditions for exemption (e.g., "fundSize > R$ 100M")
- `taxTreatment` (String): "TAXABLE" or "TAX_EXEMPT" (e.g., educational institutions)
- `status` (Enum): ACTIVE, PENDING_APPROVAL, EXPIRED, SUSPENDED

### Fee Calculation Examples

**Example 1: Fixed Management Fee**
```
Fund ABC:
  Base Fee Rate: 0.50% annually
  Calculation: Fund NAV × 0.005 / 252 = daily fee
  
Day 1:
  Fund NAV: R$ 100,000,000
  Daily Fee: 100,000,000 × 0.005 / 252 = R$ 19,841.27
```

**Example 2: Tiered Fee Based on Fund Size**
```
Fund XYZ (tiered structure):
  0-50M: 0.80% annually
  50-100M: 0.60% annually
  100M+: 0.40% annually
  
Day 1:
  Fund NAV: R$ 75,000,000
  Applied Rate: 0.60%
  Daily Fee: 75,000,000 × 0.006 / 252 = R$ 17,857.14
```

**Example 3: Performance Fee (1/20th Rule)**
```
Fund ABC with performance fee:
  Base Rate: 0.50%
  Performance Fee: 20% of outperformance over benchmark (Selic)
  
Month result:
  Selic return: 0.40%
  Fund return: 0.65%
  Outperformance: 0.25%
  Performance fee: NAV × 0.25% × 20% = NAV × 0.0005
```

### Fee Exemption Rules

**Common Exemptions** (Brazil-specific):
- Educational institutions: TAX_EXEMPT on management fees
- Pension funds (FAPI): TAX_EXEMPT on custody fees (first R$ 5M)
- Government/public funds: Reduced rates (negotiated)
- Large institutional investors (> R$ 100M): Discounted rates

**Exemption Implementation**:
```
If investor qualifies for exemption:
  Apply exemption rate (typically 0% or 50% of base)
  Document exemption reason (for tax authority)
  Require annual exemption certification renewal
```

### Fee Ledger Posting

**Daily Fee Entry**:
```
Debit:  1.1.2.001 (Fees Receivable) = R$ 19,841.27
Credit: 4.1.1.001 (Management Fees Revenue) = R$ 19,841.27
```

**Fee Collection** (when investor pays):
```
Debit:  1.1.1.001 (Cash) = R$ 19,841.27
Credit: 1.1.2.001 (Fees Receivable) = R$ 19,841.27
```

---

## 6. Account Master Data

### Account Hierarchy

**Organizational Structure**:
```
Bank (Parent)
├── Branch 001
│   ├── Sweep Account (CNPJ)
│   │   ├── Fund A Investment Account
│   │   └── Fund B Investment Account
│   └── Operational Account
├── Branch 002
└── Custody Account (Central)
```

### Account Reconciliation

**Daily Reconciliation**:
1. **General Ledger Balance** = Sum of all account entries
2. **Sub-ledger Balance** = Fund-specific quota balances + fee allocations
3. **Bank Statement Balance** = External bank account balance
4. Compare: GL = Sub-ledger = Bank (±tolerance for timing differences)

**Timing Differences**:
- Outstanding checks: In GL, not yet in bank statement
- Bank fees: In bank statement, not yet in GL
- Deposits in transit: In GL (if posting date today), not yet in bank

**Reconciliation Tolerance**: ±R$ 0.01

---

## 7. Legacy System Integration (Anti-Corruption Layer)

### ACL Adapter Pattern

**Scenario**: Integration with mainframe COBOL accounting system (legacy)

**Domain Model** (enterprise-financial-core):
```java
record LedgerEntry(
  UUID entryId,
  LocalDate postingDate,
  BigDecimal debitAmount,
  BigDecimal creditAmount,
  String debitAccountId,
  String creditAccountId
) {}
```

**Legacy System Format** (COBOL Copybook):
```cobol
01 GL-POSTING-RECORD.
   05 REC-NUMBER        PIC 9(8).
   05 POSTING-DATE      PIC 9(8).    (YYYYMMDD)
   05 DEBIT-ACCT        PIC X(12).
   05 DEBIT-AMOUNT      PIC S9(13)V99 COMP-3.
   05 CREDIT-ACCT       PIC X(12).
   05 CREDIT-AMOUNT     PIC S9(13)V99 COMP-3.
```

**ACL Adapter** (infrastructure layer):
```java
public class MainframeGLAdapter {
  public String convertToCobol(LedgerEntry entry) {
    // Transform domain model → COBOL format
    // Handle date format conversion (LocalDate → YYYYMMDD)
    // Handle BigDecimal → COMP-3 (packed decimal)
    // Handle string padding and field alignment
    return cobixOutput;
  }
  
  public LedgerEntry convertFromCobol(String cobixInput) {
    // Parse COBOL record
    // Transform → domain model
    // Validate all fields
    return ledgerEntry;
  }
}
```

### Error Handling in ACL

- **Mainframe timeout**: Circuit breaker; queue for retry; continue processing locally
- **Data format error**: Log detailed error; flag for manual review; don't corrupt core domain
- **Partial success**: Partial commits allowed; track which records synced vs. pending

---

## 8. Transaction Monitoring & Reporting

### Real-Time Monitoring

**Monitored Metrics** (updated every minute):
- Transaction count per hour
- Volume per account
- Volume per transaction type
- Velocity per destination
- High-risk transaction percentage

**Alerts Triggered**:
- Sustained high velocity: > 50 transactions/hour
- Large transaction surge: > 2x normal daily volume in 1 hour
- Consistent fraud score elevation: Avg risk score > 60 for 5+ transactions
- System anomalies: Processing delays > 5 seconds

### Regulatory Reporting

**BACEN Report** (Daily, by 8:00 AM):
- Total transaction volume
- Total transaction value
- Transaction types breakdown
- Failed transaction count
- Average processing time

**CVM Report** (Monthly):
- Investment volumes (deposits + redemptions)
- Fee income by fund
- Investor count changes
- Compliance incidents

**Tax Authority Report** (Quarterly):
- Gross income (fees)
- Expenses (operational)
- Tax withheld
- Estimated quarterly tax payment (DARF)

---

## 9. Data Validation & Constraints

### Ledger Entry Validation

| Rule | Validation |
|------|-----------|
| Amount positive | Both debit and credit > 0 |
| Balance | Debit total = credit total (always) |
| Accounts active | Both accounts ACTIVE status |
| Posting date | Not > 90 days in future |
| Account types | Debit = ASSET/EXPENSE; Credit = LIABILITY/EQUITY/REVENUE |
| Currency | All amounts in BRL |

### Account Validation

| Rule | Validation |
|------|-----------|
| Account code | 6-12 chars, alphanumeric, unique |
| Account type | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| Parent/child hierarchy | No circular references |
| Debit/credit normal | Consistent with account type |

---

## 10. Performance & Scalability

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Ledger posting | <100ms | Single entry insertion |
| Batch posting (10k) | <5s | Bulk insert with constraints |
| Account balance query | <50ms | Indexed; cached |
| Settlement processing | <10s per fund | 1000+ transactions |
| Fraud rule evaluation | <100ms | Parallel rule engine |
| Clearing confirmation | <30s per batch | 100+ settlement groups |

### Concurrency & Scaling

| Resource | Configuration | Notes |
|----------|---|---|
| Virtual Threads | Unlimited (Java 21) | Non-blocking ledger operations |
| Thread pool (settlement) | Core 5, Max 20 | Parallel batch processing |
| Database connections | 100 | PostgreSQL; connection pool |
| Ledger batch insert | 1000 records/batch | Optimized for bulk inserts |

### Database Partitioning

- **Ledger entries**: Partition by posting date (monthly ranges)
- **Settlement instructions**: Partition by settlement date (monthly)
- **Fraud telemetry**: Partition by analysis date (daily; compress after 90d)
- **Fee policies**: No partitioning (small table; reference frequently)

---

## 11. Compliance & Regulatory

### CVM Compliance
- Double-entry ledger mandatory (per accounting standards)
- Audit trail: All entries immutable; reversals tracked separately
- Chart of accounts: Aligned with CVM reporting requirements
- Monthly financial reports: NAV, income, expenses, fund performance

### BACEN Compliance
- Settlement clearing per BACEN calendar (BACEN business days)
- PIX instant processing: Cleared within 10 seconds
- TED settlement: By 9:00 AM next business day
- Transaction reporting: Daily summary

### Tax Authority Compliance
- General ledger: Maintained per tax code (Lei 9.430)
- Income reporting: Monthly/quarterly estimated payments (DARF)
- Deductible expenses: Documented and auditable
- Withholding tax: Tracked per investor

### COAF/AML Compliance
- Transaction monitoring: Real-time risk scoring
- Suspicious activity reporting (SAR): Escalation to COAF
- Sanctions screening: OFAC checks on all high-value transactions

### LGPD Data Protection
- Ledger entries: PII minimized (use account codes, not names in postings)
- Sensitive data: Encrypted at rest, masked in logs
- Data retention: 10 years per CVM; then archived to cold storage
- Data deletion: Support upon account closure (90-day SLA)

---

## 12. Testing Requirements

### Unit Tests (100% coverage)
- Ledger entry validation (balance, accounts, amounts)
- Double-entry rules enforcement
- Fee calculations (all tiers and scenarios)
- Fraud rule evaluation
- Account hierarchy validation

### Integration Tests
- End-to-end ledger posting workflow
- Settlement clearing with multiple funds
- Fraud detection with mock rules
- Account reconciliation
- Legacy system ACL integration

### Performance Tests
- 10k concurrent ledger entries
- Batch settlement (1000+ transactions) <10s
- Fraud rule evaluation <100ms P99
- Account balance query <50ms P95

### Compliance Tests
- Ledger audit trail integrity
- Double-entry validation (all accounts, all months)
- Settlement reconciliation
- Regulatory report generation

---

## 13. API Endpoint Specifications

### Post Ledger Entry
```
POST /api/v1/ledger/entries
Authorization: Bearer {jwt_token}
X-Role: ACCOUNTING_OFFICER

Request:
{
  "postingDate": "2026-06-08",
  "debitAccountId": "1.1.1.001",
  "creditAccountId": "4.1.1.001",
  "amount": 19841.27,
  "description": "Daily management fee - Fund ABC",
  "sourceTransactionId": "uuid",
  "costCenter": "FUND-ABC"
}

Response (201 Created):
{
  "entryId": "uuid",
  "status": "POSTED",
  "entryNumber": 500001,
  "createdAt": "2026-06-08T17:30:25Z"
}
```

### Query Account Balance
```
GET /api/v1/accounts/{accountId}/balance
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "accountId": "1.1.1.001",
  "accountName": "Cash - Bank ABC",
  "debitTotal": 100000000.00,
  "creditTotal": 95000000.00,
  "currentBalance": 5000000.00,
  "asOfDate": "2026-06-08"
}
```

### Get Chart of Accounts
```
GET /api/v1/accounts?active=true
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "accounts": [
    {
      "accountId": "1.1.1.001",
      "accountName": "Cash - Bank ABC",
      "accountType": "ASSET",
      "debitOrCredit": "DEBIT",
      "isActive": true
    },
    ...
  ]
}
```

### Create Settlement
```
POST /api/v1/settlements
Authorization: Bearer {jwt_token}
X-Role: SETTLEMENT_OPERATOR

Request:
{
  "settlementDate": "2026-06-08",
  "settlementType": "INVESTMENT_SETTLEMENT",
  "fundIds": ["uuid1", "uuid2"],
  "transactionIds": ["uuid-tx1", "uuid-tx2", ...]
}

Response (202 Accepted):
{
  "settlementId": "uuid",
  "status": "PROCESSING",
  "totalAmount": 500000.00,
  "transactionCount": 250,
  "estimatedCompletionTime": "10s"
}
```

### Get Settlement Status
```
GET /api/v1/settlements/{settlementId}
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "settlementId": "uuid",
  "status": "COMPLETE",
  "settlementDate": "2026-06-08",
  "totalAmount": 500000.00,
  "transactionCount": 250,
  "processedCount": 250,
  "failureCount": 0,
  "completedAt": "2026-06-08T17:35:12Z"
}
```

### Get Fraud Risk Assessment
```
POST /api/v1/fraud/assess
Authorization: Bearer {jwt_token}

Request:
{
  "accountId": "12345678901",
  "transactionType": "INVESTMENT",
  "amount": 100000.00,
  "targetAccount": "98765432101"
}

Response (200 OK):
{
  "riskScore": 45,
  "status": "CHALLENGED",
  "requiredAuthentication": "MFA",
  "triggeredRules": [
    "NEW_DESTINATION",
    "AMOUNT_SPIKE"
  ]
}
```

---

## 14. Integration Points

### Inbound Events (Consumed)
- INVESTMENT_ORDER_CREATED → Post investment revenue entry
- REDEMPTION_ORDER_CREATED → Prepare redemption entry
- PAYMENT_CONFIRMED → Post cash entry
- FEE_CALCULATED → Post fee revenue entry

### Outbound Events (Published)
- SETTLEMENT_COMPLETE → Notify investment & payment modules
- FRAUD_ALERT → Alert compliance module
- ACCOUNT_RECONCILIATION_VARIANCE → Flag for manual review

### External Systems
- BACEN clearing system (settlement confirmation)
- Mainframe accounting system (legacy GL sync)
- Bank statements (daily reconciliation)
- Sanctions list (OFAC, EU, COAF)

---

## 15. Summary

The **Enterprise-Financial-Core Module** is the authoritative financial backbone ensuring:

1. **Accounting Integrity**: Double-entry ledger; immutable audit trail; regulatory compliance
2. **Settlement Accuracy**: Clearing operations; interbank reconciliation; dispute resolution
3. **Fraud Prevention**: Real-time risk scoring; rule-based detection; automated blocking
4. **Fee Transparency**: Dynamic pricing; exemptions; accurate calculations; regulatory reporting
5. **Legacy Integration**: Anti-corruption layer; Strangler Fig pattern; gradual mainframe migration
6. **Performance**: <100ms ledger posting; <10s settlement batch; <100ms fraud evaluation
7. **Scalability**: 10k+ concurrent posts; monthly partitioning; 10-year retention

Integration with atomant-payment (transaction posting), atomant-investment-core (revenue recognition), and atomant-audit (immutable records) ensures end-to-end financial accuracy and compliance.
