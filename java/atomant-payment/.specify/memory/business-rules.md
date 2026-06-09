# Business Rules: Atomant-Payment Module

**System**: Investment & Payment Processing Platform
**Module**: atomant-payment (Payment Processing & Settlement)
**Purpose**: Payment transaction processing, idempotent payment handling, PIX/TED transfers, account fund management, real-time settlement
**Regulatory Context**: BACEN (instant payments, PIX), CVM (investment transfers), COAF (AML/OFAC), tax authority (withholding)

---

## 1. Module Overview & Responsibilities

The **Payment Module** is the real-time payment processing engine handling fund transfers, investment payment settlement, and PIX/TED operations:

1. **Payment Transaction Processing**: Handle payment requests with idempotent key validation, concurrent retry protection
2. **Investment Payment Flows**: Reserve funds for investment orders; confirm payment on settlement; handle redemption payouts
3. **PIX Instant Payments**: Initiate and receive PIX transfers (P2P, P2B, B2B) via BACEN integration
4. **TED/CEST Scheduled Payments**: Schedule inter-bank transfers with settlement dates (T+0 or T+1)
5. **Account Fund Management**: Query account balances, hold funds for pending orders, release held amounts
6. **Payment Reconciliation**: Match external bank confirmations with internal payment records
7. **AML/OFAC Screening**: Real-time sanctions checks before allowing transfers; freeze accounts if match detected

---

## 2. Payment Transaction Processing

### Payment Entity

**Payment Record**:
- `paymentId` (UUID): Unique payment identifier
- `idempotencyKey` (UUID): Client-supplied idempotency key (unique constraint)
- `sourceAccountId` (String): Payer account/investor CPF
- `targetAccountId` (String): Payee account/bank account
- `amountInCents` (Long): Payment amount in centavos (no decimals)
- `currency` (String): "BRL" (Brazilian Real)
- `transactionType` (Enum): INVESTMENT_DEPOSIT, INVESTMENT_REDEMPTION, PIX_P2P, PIX_P2B, TED_TRANSFER, CEST_TRANSFER
- `status` (Enum): SUBMITTED, PENDING_AML, AML_APPROVED, PROCESSING, CONFIRMED, FAILED, REJECTED, REVERSED
- `paymentMethod` (Enum): PIX, TED, CEST, BANK_TRANSFER, CARD_PAYMENT
- `externalTransactionId` (String, nullable): Bank/PIX system reference ID
- `settlementDate` (Date): Expected settlement (T+0 for PIX, T+1 for TED, T+2 for CEST)
- `settledDate` (Date, nullable): Actual settlement date
- `failureReason` (String, nullable): If FAILED, reason code
- `amlCheckResult` (String, nullable): APPROVED, BLOCKED_OFAC, BLOCKED_PEP, BLOCKED_SANCTION
- `createdTimestamp` (Timestamp): Record creation time
- `updatedTimestamp` (Timestamp): Last update time

### Idempotency Key Caching

**Idempotency Record**:
- `idempotencyKey` (UUID): Primary key
- `paymentId` (UUID): Associated payment
- `responseStatus` (Integer): HTTP status (200, 201, 400, 500)
- `responseBody` (JSON): Cached response payload
- `expirationTime` (Timestamp): TTL (default 24 hours)

**Idempotency Rules**:
- Every payment request MUST include `Idempotency-Key` header
- Check if key exists in cache; if yes: return cached response (same HTTP status + body)
- If not in cache: Process payment; store response; add to idempotency cache
- Idempotency TTL: 24 hours (configurable)
- Conflict handling: If same key with different request body → return 409 Conflict

### Payment Processing Workflow

**Step 1: Request Validation**
- Validate idempotency key (UUID format, non-empty)
- Check idempotency cache: If exists, return cached response
- Validate payment amount: > 0, ≤ account balance, ≤ daily limit
- Validate source/target accounts: Valid CPF/CNPJ, exist in system
- Store incoming request (audit trail)

**Step 2: AML/OFAC Screening**
- Query COAF sanctions list (OFAC integration)
- Query PEP (Politically Exposed Person) database
- Check transaction velocity (max 10 transactions per hour per account)
- If match found: status = AML_BLOCKED; reject with reason; alert compliance
- If approved: status = AML_APPROVED; proceed

**Step 3: Fund Reservation**
- Atomically lock account balance (pessimistic lock: SELECT FOR UPDATE)
- Verify available balance >= payment amount
- Reserve amount: `reservedBalance += paymentAmount`
- Record reservation in fund hold table (for visibility)
- status = PROCESSING

**Step 4: Payment Method Dispatch**
- If PIX: Route to BACEN PIX gateway (DICT lookup, InstantPay API)
- If TED: Route to BACEN TED system (bank routing, settlement scheduling)
- If CEST: Route to CEST system (scheduled settlement, T+2)
- Store external transaction ID when received

**Step 5: Confirmation & Settlement**
- Poll external system for confirmation (callback or scheduled job)
- When confirmed: status = CONFIRMED, settledDate = today
- Release fund reservation: `reservedBalance -= paymentAmount`
- Publish PAYMENT_CONFIRMED event to message queue

**Step 6: Failure Handling**
- If external system rejects: status = FAILED, failureReason = code
- Retry logic: Exponential backoff (1s, 2s, 4s, 8s) up to 5 times
- After final failure: Unreserve funds; status = FAILED; notify user
- Store full error details for troubleshooting

### Payment Error Classification

| Error Code | Scenario | HTTP Status | Recovery |
|-----------|----------|-----------|----------|
| INSUFFICIENT_FUNDS | Balance < amount | 402 | User funds account; retry |
| DAILY_LIMIT_EXCEEDED | > R$ daily limit | 422 | Wait for next day; try smaller amount |
| AML_BLOCKED_OFAC | OFAC sanctions match | 451 (unavailable for legal reasons) | Manual compliance review; escalate |
| AML_BLOCKED_PEP | PEP designation | 451 | Manual review; escalate |
| VELOCITY_EXCEEDED | > 10 transactions/hour | 429 (too many requests) | Wait 1 hour; retry |
| INVALID_TARGET_ACCOUNT | Account not found | 400 | Verify account number; correct & retry |
| DUPLICATE_TRANSACTION | Idempotency key exists | 409 | Return cached response |
| EXTERNAL_GATEWAY_TIMEOUT | PIX/TED system timeout | 503 | Exponential backoff; retry |
| MALFORMED_REQUEST | Missing required fields | 400 | Fix request; retry |

---

## 3. Investment-Related Payment Flows

### Investment Deposit Flow

**Trigger**: Investment order submitted in atomant-investment-core

**Workflow**:
1. Investment module publishes INVESTMENT_ORDER_CREATED event
2. Payment module receives event; creates payment record
   - Source: Investor account (CPF)
   - Target: Fund sweep account (CNPJ)
   - Amount: Investment amount in reais
   - Type: INVESTMENT_DEPOSIT
   - Status: SUBMITTED
3. Run AML/OFAC check
4. Reserve funds: `accountBalance -= investmentAmount`
5. Initiate PIX transfer to fund account
6. Wait for confirmation (callback within 10 seconds for PIX)
7. Publish PAYMENT_CONFIRMED event
8. Investment module receives event; settles order with quotas
9. If payment fails: Publish PAYMENT_FAILED event; investment order remains in PENDING state; retry after 1 hour

**Reconciliation**:
- Payment must confirm within 10 seconds for PIX
- If not confirmed in 30 seconds: Check DICT for destination; verify account exists
- If account not found: Reject payment; unreserve funds

### Investment Redemption Payout Flow

**Trigger**: Redemption order settlement in atomant-investment-core

**Workflow**:
1. Redemption module publishes REDEMPTION_ORDER_CREATED event with net proceeds (after tax withholding)
2. Payment module receives event; creates payment record
   - Source: Fund sweep account (CNPJ)
   - Target: Investor account (CPF)
   - Amount: Net proceeds (redemption - withholding)
   - Type: INVESTMENT_REDEMPTION
   - Status: SUBMITTED
3. Fund account has sufficient balance (guaranteed by redemption module)
4. Initiate PIX transfer to investor account
5. Wait for confirmation within 10 seconds
6. Publish PAYMENT_CONFIRMED event
7. Investor receives funds in their bank account
8. If PIX fails: Try TED as fallback (T+1 settlement); notify investor of delay

### Fund Balance Hold Lifecycle

**Fund Hold Entity**:
- `holdId` (UUID): Unique identifier
- `accountId` (String): Account with held funds
- `holdAmount` (BigDecimal, scale 2): Held amount in reais
- `holdReason` (Enum): PENDING_INVESTMENT, PENDING_PAYMENT, PENDING_REFUND
- `relatedOrderId` (UUID): Reference to investment order or payment
- `createdDate` (Date): Hold creation date
- `expirationDate` (Date, nullable): When hold auto-releases (if not settled)
- `status` (Enum): ACTIVE, RELEASED, EXPIRED

**Hold Rules**:
- When investment order submitted: Create hold (lock funds)
- When payment confirmed: Release hold (funds actually transferred)
- When payment failed: Release hold (funds available for retry)
- Hold expiration: Auto-release after 2 days if not settled (funds available again)

---

## 4. PIX Instant Payment Processing

### PIX Transfer Types

| Type | Instant | Confirmation | Settlement | Use Case |
|------|---------|-------------|-----------|----------|
| **P2P** | Yes | <10s | T+0 | Person-to-person transfers |
| **P2B** | Yes | <10s | T+0 | Person-to-business |
| **B2B** | Yes | <10s | T+0 | Business-to-business |
| **Agendado** | No | Scheduled | T+0 | Scheduled PIX (future date) |

### PIX Processing Steps

1. **Key Registration (DICT)**:
   - Investor provides PIX key (CPF, CNPJ, email, phone, or random key)
   - Query BACEN DICT API to get target bank and account
   - Cache DICT result for 24 hours

2. **Instant Payment Routing**:
   - Submit transfer to BACEN via InstantPay API
   - Include: Origin bank, target bank, account, amount, description

3. **Real-Time Confirmation**:
   - BACEN confirms receipt within 10 seconds (SLA)
   - Update payment status: CONFIRMED
   - Funds immediately available to recipient

4. **Error Handling**:
   - If DICT key not found: status = FAILED; reason = INVALID_PIX_KEY
   - If recipient account closed: status = FAILED; reason = ACCOUNT_CLOSED
   - If amount exceeds daily limit: status = FAILED; reason = LIMIT_EXCEEDED (or initiate customer challenge)

### PIX Velocity Limits (BACEN Rules)

| Time Window | Limit | Applies To |
|------------|-------|-----------|
| Per transaction | R$ 5,000 (per transfer) | All P2P PIX |
| Per hour | R$ 20,000 | All P2P PIX in 1 hour |
| Per day | R$ 50,000 | All P2P PIX per day |
| Per month | No limit | Unlimited monthly |

**Enforcement**:
- Check velocity before allowing transfer
- If exceeds: Return error VELOCITY_LIMIT_EXCEEDED
- Investor can bypass with additional authentication (MFA) if configured

---

## 5. TED/CEST Scheduled Transfers

### TED Transfer

**TED Characteristics**:
- Scheduled for next business day (T+1)
- Processing: 9:00 AM - 4:30 PM BRT (business hours only)
- Settlement: BACEN settlement system
- Confirmation: End of day
- Cost: Bank fee applies (typically R$ 10-15)

**TED Process**:
1. Investor requests TED transfer (amount, target bank, account number)
2. Validate bank code (001 Banco do Brasil, 104 Caixa, etc.)
3. Validate account number format
4. Reserve funds in account
5. Submit to BACEN TED gateway (includes routing info)
6. Store scheduled settlement date (next business day)
7. Payment status: PENDING (scheduled)
8. Automatic processing: BACEN processes at 9:00 AM next day
9. Confirmation received: status = CONFIRMED; settledDate = next day

**TED Limits** (per BACEN):
- Per transfer: Up to R$ 5,000,000
- No daily limit for institutional accounts
- Retail accounts typically have R$ 50,000/day limit

### CEST Transfer

**CEST Characteristics**:
- Automated Clearing House (ACH)
- Slower than TED (T+2 settlement)
- Lower cost (free or R$ 1-5 per transfer)
- Batch processing (daily settlement at 11:00 AM)
- Used for high-volume low-value transfers

**CEST Process**:
1. Batch accumulation: Collect pending CEST transfers throughout the day
2. End-of-day batch: Generate ACH file with all pending transfers
3. Submit to BACEN (by 5:00 PM)
4. BACEN processes: Next business day 11:00 AM
5. Confirmation received: status = CONFIRMED; settledDate = T+1
6. Funds available to recipient: T+2

---

## 6. Account Fund Management

### Account Balance Tracking

**Account Record**:
- `accountId` (String): Investor CPF or CNPJ
- `accountType` (Enum): INVESTOR_ACCOUNT, FUND_SWEEP_ACCOUNT, CUSTODIAN_ACCOUNT
- `availableBalance` (BigDecimal, scale 2): Funds available for withdrawal
- `reservedBalance` (BigDecimal, scale 2): Funds held for pending orders
- `totalBalance` (BigDecimal, scale 2): Available + reserved
- `lastUpdateTimestamp` (Timestamp): When balance last updated

**Balance Formula**:
```
totalBalance = availableBalance + reservedBalance
```

### Fund Reservation & Release

**Reservation** (when payment initiated):
```
availableBalance -= paymentAmount
reservedBalance += paymentAmount
```

**Confirmation** (when payment settled):
```
reservedBalance -= paymentAmount
(totalBalance unchanged)
```

**Failure/Release** (if payment failed):
```
availableBalance += paymentAmount
reservedBalance -= paymentAmount
```

### Account Limits & Controls

| Limit Type | Daily Limit | Monthly Limit | Controls |
|-----------|-----------|--------------|----------|
| PIX P2P | R$ 50,000 | Unlimited | AML velocity check |
| TED | R$ 50,000 (retail) | Unlimited | Bank policy |
| Investment | R$ 1,000,000 | R$ 5,000,000 | CVM limits |
| Daily Withdrawal | R$ 100,000 | Unlimited | Bank policy |
| ACH/CEST | No specific limit | Configurable | Bank policy |

---

## 7. Payment Reconciliation

### Bank Statement Matching

**Daily Reconciliation Process**:
1. Download bank statement (via BACEN API or bank file)
2. For each statement entry:
   - Parse transaction details (amount, date, bank reference)
   - Query payment table: Find matching payment by amount + date + target account
   - If match: Mark as RECONCILED; update external transaction ID
   - If no match: Flag as UNMATCHED; alert operations
3. Report: # reconciled, # unmatched, # failed

### Reconciliation Tolerance

| Check | Tolerance |
|-------|-----------|
| Amount match | Exact (to centavo) |
| Date match | ±1 day (processing delays) |
| Bank reference | Exact |

### Unmatched Transaction Handling

**Scenarios**:
1. **Payment in bank statement, missing in system**: Received payment without corresponding request; may be reversal/refund
2. **Payment in system, missing in bank**: Payment not yet confirmed (delayed settlement); check BACEN status
3. **Amount mismatch**: Rare; indicates data corruption; escalate to bank

**Resolution**:
- Alert operations team
- Investigate bank + internal logs
- Create correction transaction if needed
- Flag for manual audit

---

## 8. AML/OFAC Integration

### Sanctions Screening

**Data Sources**:
- OFAC SDN (Specially Designated Nationals) list
- EU sanctions list
- COAF (Conselho de Controle de Atividades Financeiras) watchlist
- PEP (Politically Exposed Persons) database

**Screening Rules**:
- Check source account: Investor name against sanctions list
- Check target account: Payee name against sanctions list
- Fuzzy matching: Account for name variations, typos
- Minimum match confidence: 90%

**Actions on Match**:
- Block transaction immediately
- Set status = AML_BLOCKED
- Set amlCheckResult = BLOCKED_OFAC (or PEP, or SANCTION)
- Notify compliance officer (escalate)
- Freeze account if high-risk match (OFAC Primary List)
- Create case for manual review

### Velocity Checks

**Velocity Rules**:
- Max 10 transactions per account per hour
- Max 5 transactions per unique target account per hour
- Max R$ 100,000 per account per hour
- Max 3 transactions to new target accounts per day

**Actions on Velocity Breach**:
- Block transaction (status = VELOCITY_EXCEEDED)
- Return HTTP 429 (too many requests)
- Require customer additional authentication (MFA)
- Log incident for compliance review

---

## 9. Data Validation & Constraints

### Payment Amount Validation

| Rule | Validation |
|------|-----------|
| Positive amount | amountInCents > 0 |
| Account balance | amountInCents ≤ availableBalance |
| Daily limit | Total daily payments ≤ limit for investor type |
| Monthly limit | Total monthly payments ≤ limit for investor type |
| Maximum transfer | amountInCents ≤ R$ 5,000,000 (per transfer) |

### Account Number Validation

| Account Type | Validation |
|---|---|
| Investor CPF | 11 digits, valid checksum, not blacklisted |
| CNPJ | 14 digits, valid checksum, registered |
| Bank Account | Format per bank (varies 8-15 digits), valid account exists |
| PIX Key | Valid CPF, CNPJ, email, phone, or random UUID |

---

## 10. Performance & Scalability

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Payment submission | <200ms | Validation + fund reservation |
| AML check | <500ms | Parallel sanctions + velocity checks |
| PIX processing | <10s | BACEN confirmation SLA |
| TED processing | <1s | Submission to BACEN queue |
| Balance query | <100ms | Cached; refresh on update |
| Reconciliation (10k txns) | <30s | Batch processing |

### Concurrency & Scaling

| Resource | Configuration | Notes |
|----------|---|---|
| Virtual Threads | Unlimited (Java 21) | Non-blocking I/O for BACEN APIs |
| Thread pool (external APIs) | Core 10, Max 50 | HTTP clients to BACEN, DICT, etc. |
| Database connections | 100 | PostgreSQL connection pool |
| Message queue consumers | 5 | Kafka for payment events |
| Idempotency cache | 1M entries, 24h TTL | In-memory or Redis |

---

## 11. Compliance & Regulatory

### BACEN Compliance
- PIX instant processing: Confirmation within 10 seconds
- TED scheduling: T+1 settlement by 9:00 AM
- Transaction reporting: Daily report to BACEN (no threshold)
- AML screening: Real-time OFAC check before payment

### CVM Compliance
- Investment payment settlement: T+2 per market rules
- Investor fund tracking: Audit trail of all transfers
- Fee withholding: Tax deducted at source (investment-core responsibility)

### Tax Compliance
- Withholding tax: 22.5% short-term, 15% long-term (handled by investment-core)
- Payment reporting: Monthly summary to tax authority
- CPMF equivalent: No tax (CPMF abolished 2007)

### LGPD Data Protection
- Payment data encrypted at rest and in transit (TLS 1.3)
- Sensitive data masked in logs (PAN, CVV, account)
- Account holder PII in separate encrypted fields
- Support data deletion (90-day SLA after account closure)

---

## 12. Testing Requirements

### Unit Tests (100% coverage)
- Idempotency key validation
- Fund reservation/release logic
- AML velocity checks
- Amount validation rules
- Account balance calculations

### Integration Tests
- End-to-end investment payment flow
- PIX processing with mock BACEN API
- TED scheduling and processing
- Concurrent payment handling (same idempotency key)
- Payment reconciliation with bank statement

### Performance Tests
- 1000 concurrent payments
- PIX latency P95 < 5s
- AML check latency P95 < 300ms
- Load test BACEN gateway simulation

### Resilience Tests
- BACEN timeout handling
- Database connection failure
- Message queue unavailable
- Partial payment success (payment confirmed but investment not settled)

---

## 13. API Endpoint Specifications

### Initiate Payment
```
POST /api/v1/payments
Idempotency-Key: {uuid}
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "sourceAccountId": "12345678901",  // Investor CPF
  "targetAccountId": "12345678901",  // Target CPF or bank account
  "amountInCents": 1000000,          // R$ 10,000.00
  "transactionType": "INVESTMENT_DEPOSIT",
  "paymentMethod": "PIX",
  "description": "Investment in ABC Fund Plus"
}

Response (201 Created):
{
  "paymentId": "uuid",
  "status": "PROCESSING",
  "amountInCents": 1000000,
  "createdAt": "2026-06-08T10:30:25Z"
}

Response (409 Conflict - Duplicate):
{
  "code": "DUPLICATE_IDEMPOTENCY_KEY",
  "message": "Payment already submitted",
  "paymentId": "uuid",
  "status": "CONFIRMED"
}
```

### Query Payment Status
```
GET /api/v1/payments/{paymentId}
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "paymentId": "uuid",
  "status": "CONFIRMED",
  "amountInCents": 1000000,
  "externalTransactionId": "PIX-2026-06-08-001234",
  "settledDate": "2026-06-08",
  "createdAt": "2026-06-08T10:30:25Z"
}
```

### Query Account Balance
```
GET /api/v1/accounts/{accountId}/balance
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "accountId": "12345678901",
  "availableBalance": 50000.00,
  "reservedBalance": 10000.00,
  "totalBalance": 60000.00
}
```

### Reconciliation Report
```
POST /api/v1/reconciliation/process
Authorization: Bearer {jwt_token}
X-Role: RECONCILIATION_OFFICER

Request:
{
  "reconciliationDate": "2026-06-08",
  "bankStatement": [{...}]
}

Response (200 OK):
{
  "reconciliationId": "uuid",
  "totalTransactions": 5000,
  "reconciledTransactions": 4998,
  "unmatchedTransactions": 2,
  "failureRate": 0.04
}
```

---

## 14. Integration Points

### Inbound Events (Consumed)
- INVESTMENT_ORDER_CREATED → Reserve funds, initiate deposit payment
- REDEMPTION_ORDER_CREATED → Prepare payout payment
- PAYMENT_FAILED → Release reservation, notify investment module

### Outbound Events (Published)
- PAYMENT_CONFIRMED → Investment module settles order
- PAYMENT_FAILED → Investment module rejects order
- AML_BLOCKED → Compliance module notifies investor

### External Services
- BACEN PIX InstantPay API (real-time transfers)
- BACEN DICT API (PIX key lookup)
- BACEN TED system (scheduled transfers)
- OFAC sanctions list (AML screening)
- Bank statements (daily reconciliation)

---

## 15. Summary

The **Payment Module** is the real-time transaction processing engine ensuring:

1. **Idempotent Processing**: Same request = same response; prevent duplicate charges
2. **Fund Integrity**: Atomic reservation/release; accurate balance tracking
3. **Instant Settlement**: PIX transfers confirmed <10s; real-time availability
4. **Compliance**: AML/OFAC screening; regulatory reporting
5. **Reliability**: Exponential backoff retry; fallback payment methods
6. **Performance**: <200ms validation; <500ms AML check; scalable to 10k+ TPS

Integration with atomant-investment-core ensures seamless investment deposits and redemption payouts through event-driven workflows.
