<!-- SPECKIT START -->

# Atomant-Investment-Core Specification Kit

This project contains the **Investment-Core Module** serving as the central hub for fund operations, quota holder ledger management, investment order lifecycle, fee calculation, and settlement coordination.

## Specification Files

For complete context about this module, project structure, engineering principles, and business requirements, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Domain-Driven Design (DDD) bounded contexts: Fund Registry, Quota Holder Ledger, Fee Calculation Engine, Open Data Ingestion
   - Ubiquitous language: Fund, Quota, Quota Holder, NAV, Patrimonial Fee, Daily Fee Split
   - Structural layers: API (JAX-RS, DTOs), Domain (pure business logic, Java Records), Infrastructure (Panache repositories, REST clients)
   - Package naming conventions (Resources, DTOs, Services, Repositories, Entities)
   - Error handling strategy (domain exceptions, global ExceptionMappers)
   - Testing & performance requirements (JUnit 5, Quarkus Dev Services, Virtual Threads, <500ms targets)
   - Java 21 Virtual Threads for non-blocking order processing

2. **[spec.md](./.specify/memory/spec.md)** (if exists)
   - OpenAPI 3.0 contract for fund management and order endpoints
   - Domain model records (Fund, QuotaHolder, DailyQuotaBalance, Investment/Redemption Orders)
   - Repository interfaces and implementations
   - Service layer designs
   - Example request/response payloads

3. **[business-rules.md](./.specify/memory/business-rules.md)**
   - Fund master data: CNPJ, name, class (EQUITY, FIXED_INCOME, etc.), manager/admin/custodian, fee rate, status lifecycle (REGISTERED → ACTIVE → SUSPENDED → LIQUIDATED)
   - Fund validation: CNPJ format, fee rate 0-5%, status transitions only via state machine
   - Daily NAV ingestion: navDate, navValue (scale 8), totalPatrimony, totalQuotas, dataQualityFlag (LIVE, CACHED, 1_DAY_LAG, FALLBACK)
   - NAV revision workflow: Receive correction, store with revisedDate, trigger fee recalculation, publish FUND_NAV_CORRECTED event
   - NAV validation: > 0, change < 10% from prior day, not > 5 days stale, correction window 24 hours
   - Quota holder entity: investorId (CPF 11 or CNPJ 14), holderType, status, kycStatus (PENDING/APPROVED/BLOCKED_AML)
   - Daily quota balance: openingQuotas, investmentQuotas, redemptionQuotas, closingQuotas, feeQuotasDeducted, reconciliationStatus
   - Balance formula: opening + investments - redemptions - fees = closing
   - Investment order lifecycle: SUBMITTED → VALIDATED → SETTLEMENT_PENDING → SETTLED; quota calculation = amount / NAV
   - Investment validation: KYC approved, fund active, daily limit R$ 1M, monthly limit R$ 5M, minimum R$ 100
   - Investment settlement: T+2 business days per B3; calculate quotas = amount / navAtSettlement; settle quotas in balance
   - Redemption order lifecycle: SUBMITTED → VALIDATED → SETTLEMENT_PENDING → SETTLED; calculate proceeds = quotas × NAV
   - Tax withholding: 22.5% short-term (≤30 days holding), 15% long-term (>30 days); netProceeds = proceeds - withholding
   - Redemption restrictions: Fund SUSPENDED (queue), LIQUIDATED (pro-rata distribution), gate (max 2%/day)
   - Daily fee calculation: Fee = NAV × rate / 252; scale 4, HALF_EVEN rounding; allocate per holder = fee × (quota% / total%)
   - Fee split records: holderId, quotasOwned, feeAllocationPercentage, allocatedFeeAmount, allocatedFeeQuotas
   - Fee reversal: Receive correction, reverse original, allocate corrected amount, link in audit
   - Daily reconciliation: opening + investments - redemptions - fees = closing; tolerance < 0.00000001 quotas
   - Variance handling: Detect mismatches; flag for review if variance > tolerance or > R$ 100
   - Performance targets: Order validation <500ms, settlement <2s, fee calc (1000+ holders) <5s, reconciliation <10s
   - Concurrency: Virtual Threads unlimited, thread pool core 10/max 50, DB pool 50, message consumers 3
   - Database partitioning: Daily balances/fees by date (monthly), orders by status+date (monthly)
   - Compliance: CVM (registration, NAV by 5PM, fee disclosure, 20-year audit, monthly reports), BACEN (working calendar, T+2 settlement), Tax (withholding, quarterly reporting), LGPD (encryption, deletion rights)
   - Event subscriptions: atomant-ingestion (FUND_NAV_UPDATED, NAV_CORRECTED), atomant-calculator (DAILY_FEE_CALCULATED), atomant-payment (PAYMENT_CONFIRMED, PAYMENT_FAILED), atomant-auth (KYC validation)
   - Event publishing: INVESTMENT_ORDER_CREATED, INVESTMENT_SETTLED, REDEMPTION_ORDER_CREATED, REDEMPTION_SETTLED, DAILY_FEE_CALCULATED, QUOTA_BALANCE_VARIANCE
   - NAV dependency: Current day if available; fallback to prior day with FALLBACK flag; reject if > 5 days stale
   - API endpoints: Fund registration, NAV query, investment order (submit/status), redemption order (submit/status), quota balance query, fee calculation
   - Error codes: INVESTOR_NOT_APPROVED, FUND_NOT_ACTIVE, DAILY_LIMIT_EXCEEDED, NAV_UNAVAILABLE, INSUFFICIENT_QUOTAS, PAYMENT_NOT_RESERVED
   - Data validation: Fund CNPJ, investor CPF/CNPJ, order amounts, quota precision (scale 8), NAV staleness
   - Reconciliation errors: Quota variance (double-fee, lag), missing investment (message queue), settlement mismatch (payment lag)
   - Testing: Unit (100% fee calc, quota ops, validation), integration (order workflows, event handling), performance (1000 orders/min, 1000+ holders), resilience (NAV unavailable, fund status change)

## Technology Stack

- **Language**: Java 21
- **Framework**: Quarkus with CDI
- **Build**: Maven
- **REST**: JAX-RS with Virtual Threads (@RunOnVirtualThread)
- **Domain Model**: Java Records for immutable Value Objects
- **Persistence**: Panache (JPA/Hibernate) with PostgreSQL
- **Messaging**: Kafka or RabbitMQ for event subscription
- **Testing**: JUnit 5, Quarkus Test Framework, AssertJ
- **Data Access**: Domain repositories (interfaces); Panache implementations
- **External Data**: MicroProfile REST Client for atomant-ingestion (NAV)
- **Database**: PostgreSQL with monthly partitioning (by date for balances/fees, by status+date for orders)

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build Docker image
docker build -t atomant-investment-core:latest .

# Push to Docker Hub
docker push joelmaykon/atomant-investment-core:latest
```

## Architecture Overview

The Investment-Core Module serves four primary functions:

### 1. Fund Master Data Management
- Register and track investment funds (CNPJ, name, class, fee rate)
- Manage fund status lifecycle (REGISTERED → ACTIVE → SUSPENDED → LIQUIDATED)
- Ingest and cache daily NAV from atomant-ingestion
- Handle NAV corrections with automatic fee recalculation

### 2. Quota Holder Position Tracking
- Register quota holders (investors: retail, institutional)
- Track daily quota balances (opening, buys, sells, fees, closing)
- Daily position reconciliation against atomant-audit
- Detect and flag balance variances

### 3. Investment Order Processing
- Submit, validate, and settle investment orders
- Calculate quotas based on NAV at settlement
- Enforce investment limits (daily R$ 1M, monthly R$ 5M, minimum R$ 100)
- Coordinate with atomant-payment for cash settlement

### 4. Redemption & Fee Management
- Submit, validate, and settle redemption orders
- Calculate capital gains tax withholding (22.5% short-term, 15% long-term)
- Compute daily management fees (taxa de administração)
- Allocate fees pro-rata to quota holders

## Fund Lifecycle & Status Management

| Status | Allowed Transitions | Operations |
|--------|-------------------|-----------|
| REGISTERED | → ACTIVE | Master data edits only; no investments |
| ACTIVE | → SUSPENDED, → LIQUIDATED | All operations (invest, redeem, fees) |
| SUSPENDED | → ACTIVE, → LIQUIDATED | No invest/redeem; fees continue; daily operations |
| LIQUIDATED | None (terminal) | No operations; liquidation proceeds only |

**Status Change Rules**:
- REGISTERED → ACTIVE: Requires inceptionDate ≤ today AND manager approval
- ACTIVE → SUSPENDED: Compliance trigger OR CVM directive (audit logged)
- ACTIVE/SUSPENDED → LIQUIDATED: CVM authorization; distribute proceeds pro-rata

## Daily NAV Management

### NAV Entity Structure

| Field | Type | Description |
|-------|------|-------------|
| fundId | UUID | Fund reference |
| navDate | Date | Calculation date (business day) |
| navValue | BigDecimal (scale 8) | NAV per quota (e.g., 10.50000000) |
| totalPatrimony | BigDecimal (scale 2) | Total fund value in reais |
| totalQuotas | BigDecimal (scale 8) | Total quotas outstanding |
| dataQualityFlag | Enum | LIVE, CACHED, 1_DAY_LAG, DELAYED, ESTIMATED, FALLBACK |
| sourceSystem | String | CVM, INGESTION_MODULE, MANUAL_OVERRIDE |
| ingestionTimestamp | Timestamp | When NAV ingested |
| revisedDate | Date (nullable) | Original date if corrected NAV |

### NAV Calculation & Validation

```
NAV per quota = Total Fund Patrimony / Total Quotas Outstanding

Example:
- Patrimony: R$ 100,000,000
- Quotas: 9,523,809.52380952
- NAV = 100,000,000 / 9,523,809.52380952 = 10.50000000
```

**Validation Rules**:
- NAV > 0
- Change < 10% from prior day (sanity check)
- Not > 5 days stale (reject order if exceeds)
- Correction window: 24 hours (retroactive updates allowed)
- Fallback: Use prior day NAV if current unavailable

### NAV Correction Workflow

1. Receive correction from atomant-ingestion (original NAV wrong)
2. Store new NAV with `revisedDate` = original incorrect date
3. Trigger automatic fee recalculation for corrected date
4. Publish FUND_NAV_CORRECTED event to message queue
5. Atomant-integration notifies investors if change > 1%

## Quota Holder & Position Management

### Quota Holder Registration

| Field | Type | Validation |
|-------|------|-----------|
| investorId | CPF/CNPJ | 11 or 14 digits; valid checksum |
| holderType | Enum | INVESTOR_RETAIL, INVESTOR_INSTITUTIONAL, CUSTODIAN |
| status | Enum | ACTIVE, SUSPENDED, REDEEMED_ALL |
| kycStatus | Enum | PENDING, APPROVED, REJECTED, BLOCKED_AML |

**KYC Requirements**:
- Must be APPROVED before investments allowed
- AML sanctions screening required (COAF integration)
- Institutional accreditation required for > R$ 1M in fund

### Daily Quota Balance

**Balance Formula**:
```
Opening Quotas (from prior day)
+ Investment Quotas (from settled buy orders)
- Redemption Quotas (from settled sell orders)
- Fee Quotas Deducted (daily fee allocation)
= Closing Quotas
```

**Reconciliation Validation**:
- Tolerance: < 0.00000001 quotas (scale 8 precision)
- Variance > tolerance: Flag for manual review
- Amount variance > R$ 100: Alert operations team

## Investment Order Processing

### Investment Order Workflow

**Step 1: Submission**
- Investor submits buy order (amount in reais)
- Calculate quotas: `quotasRequested = amount / navAtOrder`
- Validate: KYC approved, fund active, limits met
- Store: status = SUBMITTED

**Step 2: Validation**
- Investor limits: Daily < R$ 1M, Monthly < R$ 5M, Min R$ 100
- Fund checks: ACTIVE status, NAV available, balance acceptable
- If passed: status = VALIDATED
- If failed: status = REJECTED

**Step 3: Settlement Pending**
- Publish INVESTMENT_ORDER_CREATED event
- Atomant-payment confirms fund availability
- Atomant-payment publishes PAYMENT_CONFIRMED

**Step 4: Settlement (T+2)**
- Calculate final quotas: `quotas = amount / navAtSettlementDate`
- Use settlement date NAV (or most recent available)
- Add quotas to investor balance
- Update status: SETTLED
- Publish INVESTMENT_SETTLED event

### Investment Validation Rules

| Rule | Condition | Action |
|------|-----------|--------|
| KYC Status | kycStatus ≠ APPROVED | Reject: INVESTOR_NOT_APPROVED |
| Fund Status | fundStatus ≠ ACTIVE | Reject: FUND_NOT_ACTIVE |
| Daily Limit | dailyInvestment > R$ 1M | Reject: DAILY_LIMIT_EXCEEDED |
| Monthly Limit | monthlyInvestment > R$ 5M | Reject: MONTHLY_LIMIT_EXCEEDED |
| Minimum | amount < R$ 100 | Reject: MINIMUM_NOT_MET |
| NAV Staleness | NAV > 5 days old | Reject: STALE_NAV |

## Redemption Order Processing

### Redemption Order Workflow

**Step 1: Submission**
- Investor submits sell order (quotas to redeem)
- Validate: Investor active, fund not liquidated, quotas available
- Calculate proceeds: `proceeds = quotas × navAtOrder`
- Reserve quotas (mark as pending)
- Store: status = SUBMITTED

**Step 2: Validation**
- Quotas available > requested (after reservations)
- NAV not stale
- No fund restrictions (gates/suspensions)
- If passed: status = VALIDATED
- If failed: status = REJECTED; unreserve quotas

**Step 3: Tax Calculation**
- Holding period = Settlement date - Purchase date
- If ≤ 30 days: Withholding 22.5% (short-term)
- If > 30 days: Withholding 15% (long-term)
- Calculate: `taxWithheld = proceeds × withholdingRate` (if gain)
- Calculate: `netProceeds = proceeds - taxWithheld`

**Step 4: Settlement (T+2)**
- Verify settlement date reached
- Recalculate proceeds using settlement NAV
- Recalculate withholding if NAV changed >1%
- Remove quotas from balance
- Publish REDEMPTION_SETTLED event
- Trigger atomant-payment for bank transfer

### Tax Holding Period Rules

- Calculate days from investment date to settlement date
- Investor rights issue (new quotas): Separate holding period per tranche
- Investor reinvested fee: Holding starts from reinvestment date
- Minimum holding: No minimum (can redeem immediately; applies short-term 22.5%)

## Daily Fee Calculation & Distribution

### Fee Calculation Formula

```
Daily Fee = Fund NAV × Annual Fee Rate / 252 (business days)

Example:
- NAV: R$ 100,000,000
- Rate: 0.50% (0.005000)
- Daily fee = 100,000,000 × 0.005000 / 252 = R$ 19,841.27
```

**Rounding**: Scale 4, HALF_EVEN (Banker's rounding)

### Fee Allocation Per Holder

```
Holder Fee = Daily Fee × (Holder Quotas / Total Quotas)

Example:
- Total fee: R$ 19,841.27
- Holder quotas: 952.38
- Total quotas: 9,523,809.52
- Holder %: 952.38 / 9,523,809.52 = 0.00010000
- Holder fee: 19,841.27 × 0.00010000 = R$ 1.98
```

### Fee Quota Deduction

- Convert fee to quotas: `feeQuotas = dailyFee / navValue`
- Deduct directly from holder balance
- Record in atomant-audit with holder details

### Daily Fee Schedule

**Timing**: 5:30 PM (after NAV published by atomant-ingestion)

**Process**:
1. Query latest NAV (from cache or atomant-ingestion)
2. If NAV unavailable: Use fallback (prior day with FALLBACK flag)
3. Query total quotas and all holders
4. Calculate daily fee; allocate per holder
5. Record fee in atomant-audit
6. Publish DAILY_FEE_CALCULATED event

### Fee Reversal & Correction

**Scenario**: CVM reports NAV error; must recalculate fees retroactively

1. Receive DATA_CORRECTION event from atomant-ingestion
2. Query original fee calculation
3. Calculate new fee with corrected NAV
4. Calculate difference per holder
5. Reverse original allocation (subtract quotas)
6. Allocate corrected fee (add quotas)
7. Record reversal in atomant-audit with linkage
8. Publish FEE_RECALCULATED event

## Daily Position Reconciliation

### Reconciliation Schedule

**Timing**: 7:00 PM (after fees calculated)

**Process**:
1. Query all quota holder balances
2. Query atomant-audit fee allocations for the day
3. For each holder, calculate expected balance:
   - Opening + settled investments - settled redemptions - fees
4. Compare expected vs. actual
5. If match: PASSED
6. If variance > tolerance: Flag for review

**Tolerance**:
- Quota: < 0.00000001 (1 unit at scale 8)
- Amount: < R$ 0.01

### Variance Scenarios

| Scenario | Root Cause | Recovery |
|----------|-----------|----------|
| Fee double-deducted | System lag, duplicate message | Reverse fee; recalculate |
| Missing investment | Message queue lag | Retry message; manual match if > 1h |
| Settlement mismatch | Payment processor lag | Check atomant-payment; escalate |
| Quota variance | Data integrity issue | Manual audit; restore from backup |

## Event Integration

### Inbound Events (Subscribed)

| Source | Topics | Consumption |
|--------|--------|-----------|
| atomant-ingestion | FUND_NAV_UPDATED, FUND_NAV_CORRECTED | Cache update, trigger fee recalc |
| atomant-calculator | DAILY_FEE_CALCULATED | Record fee splits per holder |
| atomant-payment | PAYMENT_CONFIRMED, PAYMENT_FAILED | Settle orders; handle failures |
| atomant-auth | KYC validation events | Validate investor before orders |
| atomant-audit | AUDIT_RECORD_CREATED | Reconciliation verification |

### Outbound Events (Published)

| Destination | Topics | Trigger |
|-----------|--------|---------|
| atomant-calculator | DAILY_FEE_CALCULATED | Fee calculation complete |
| atomant-payment | INVESTMENT_CREATED, REDEMPTION_CREATED | Order submitted |
| atomant-audit | FEE_ALLOCATED, INVESTMENT_SETTLED, REDEMPTION_SETTLED | Orders settled |
| atomant-integration | INVESTMENT_CONFIRMATION, REDEMPTION_CONFIRMATION | Order completion |

## Error Classification

### Order Validation Errors (4xx)

| Error | Scenario | Recovery |
|-------|----------|----------|
| INVESTOR_NOT_APPROVED | KYC status ≠ APPROVED | Submit KYC; retry later |
| FUND_NOT_ACTIVE | Fund status ≠ ACTIVE | Wait for activation |
| DAILY_LIMIT_EXCEEDED | > R$ 1M/day | Retry next day |
| MONTHLY_LIMIT_EXCEEDED | > R$ 5M/month | Retry next month |
| INSUFFICIENT_QUOTAS | Redeem more than owned | Reduce amount |
| STALE_NAV | NAV > 5 days old | Retry after fresh NAV |

### System Errors (5xx)

| Error | Cause | Action |
|-------|-------|--------|
| NAV_UNAVAILABLE | No NAV from atomant-ingestion | Retry with exponential backoff |
| PAYMENT_FAILED | Payment processor error | Check atomant-payment; escalate |
| DATABASE_ERROR | Connection failure | Circuit breaker; fallback mode |

## API Endpoints Summary

| Method | Path | Purpose | Role | Response |
|--------|------|---------|------|----------|
| POST | `/api/v1/funds` | Register fund | FUND_MANAGER | 201 Created |
| GET | `/api/v1/funds/{fundId}/nav/{date}` | Query NAV | Public | 200 OK |
| POST | `/api/v1/orders/investment` | Submit buy order | INVESTOR | 202 Accepted |
| GET | `/api/v1/orders/investment/{orderId}` | Check order status | INVESTOR | 200 OK |
| POST | `/api/v1/orders/redemption` | Submit sell order | INVESTOR | 202 Accepted |
| GET | `/api/v1/orders/redemption/{orderId}` | Check order status | INVESTOR | 200 OK |
| GET | `/api/v1/holders/{investorId}/funds/{fundId}/balance/{date}` | Query balance | INVESTOR | 200 OK |
| GET | `/api/v1/funds/{fundId}/fees/{date}` | Query daily fees | COMPLIANCE | 200 OK |

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Order validation | <500ms | KYC, limits, NAV checks |
| Order settlement | <2s | Quota allocation, audit log |
| Fee calculation (1000+ holders) | <5s | Parallel per holder |
| Reconciliation | <10s | Query + compare + flag |
| NAV lookup & cache | <100ms | In-memory; fallback to DB |

## Concurrency & Resource Allocation

| Resource | Configuration | Notes |
|----------|---------------|-------|
| Virtual Threads | Unlimited | Java 21; all order operations |
| Thread pool (fee) | Core 10, Max 50 | Parallel fee allocation |
| DB connections | 50 | Connection pool PostgreSQL |
| Message consumers | 3 | Kafka/RabbitMQ auto-scaling |

## Database Partitioning

- **Daily balances**: Monthly date ranges (2026-06, 2026-07, etc.)
- **Fee calculations**: By fund + monthly date
- **Orders**: By status + monthly date
- **Retention**: Hot data (current year); archive to S3 after 2 years

## Compliance & Regulatory

### CVM
- Fund registration mandatory before investments
- NAV published daily by 5:00 PM
- Fee disclosure in prospectus
- 20-year audit trail
- Monthly NAV reports

### BACEN
- Working calendar enforcement (B3 business days)
- Settlement T+2 per market rules
- Foreign investor tracking
- Monthly position reporting

### Tax Authority
- Capital gains withholding (22.5% short-term, 15% long-term)
- Monthly tax reporting (DARF)
- Quarterly estimated payments
- Annual investor statements

### LGPD
- Investor PII encrypted at rest/transit
- Data deletion support (90-day SLA)
- Privacy notice on communications
- Audit trail of data access

## Testing Coverage

### Unit Tests (100%)
- Fee calculation (formula, rounding, allocation)
- Quota operations (order processing, reconciliation)
- Data validation (CNPJ, CPF, amounts, limits)
- Status transitions (fund, order, balance)

### Integration Tests
- Investment order workflow (submit → validate → settle)
- Redemption order workflow (submit → validate → settle)
- Fee calculation (NAV → allocation → audit)
- Event handling (consume NAV, payment, fee events)

### Performance Tests
- 1000 orders/min throughput
- 1000+ holders fee calculation <5s
- 10k balances reconciliation <10s
- P95/P99 latency profiling

### Resilience Tests
- NAV unavailable (fallback)
- Fund status change during pending orders
- Payment failure handling
- Database connection failure

## Key Design Patterns

- **Domain-Driven Design (DDD)**: Bounded contexts (Fund, Quota, Fee, Ingestion)
- **Aggregate Pattern**: Fund as root; QuotaHolder as root
- **Value Objects**: FeeSplit (immutable, Java Record)
- **Repository Pattern**: Domain interfaces; Panache implementations
- **Event-Driven**: Consume NAV/payment; publish order/fee events
- **Virtual Threads**: Non-blocking order processing (Java 21)

## Implementation Roadmap

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Weeks 1-2 | Fund master data; status lifecycle |
| Phase 2 | Weeks 3-4 | Quota ledger; position tracking |
| Phase 3 | Weeks 5-6 | Order processing (investment/redemption) |
| Phase 4 | Weeks 7-8 | Fee integration; settlement |
| Phase 5 | Weeks 9-10 | Tax calculations; compliance |
| Phase 6 | Weeks 11-12 | Testing; optimization; production |

## Summary

The **Investment-Core Module** is the central hub for fund and quota holder management in atomant. It ensures:

1. **Fund Integrity**: Registration, status management, NAV tracking, daily updates
2. **Quota Accuracy**: Position tracking, daily reconciliation, variance detection
3. **Order Processing**: Investment/redemption workflows with full audit trail
4. **Fee Management**: Daily calculation, pro-rata allocation, accurate splits
5. **Regulatory Compliance**: CVM, BACEN, tax authority, LGPD requirements
6. **Performance**: <500ms validation, <2s settlement, <5s fee calc for 1000+ holders
7. **Scalability**: 10k+ holders, 1000 orders/min, 252 business days/year

Integration with atomant-ingestion (NAV), atomant-calculator (fees), atomant-payment (settlement), and atomant-audit (records) ensures end-to-end accuracy and compliance.

<!-- SPECKIT END -->
