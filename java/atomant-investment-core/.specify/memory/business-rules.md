# Business Rules: Atomant-Investment-Core Module

**System**: Investment & Payment Processing Platform
**Module**: atomant-investment-core (Investment Fee Engine & Quota Ledger)
**Purpose**: Fund master data management, quota holder position tracking, investment order lifecycle, fee calculation and split, settlement workflows
**Regulatory Context**: CVM (investment fund regulations), BACEN (investment limits), B3 (settlement calendar), tax authority (withholding)

---

## 1. Module Overview & Responsibilities

The **Investment-Core Module** is the central hub for managing investment fund operations and quota holder positions in the atomant financial system:

1. **Fund Registry & Master Data**: Manages fund registrations (CNPJ, name, class, fee rate), daily NAV ingestion, fund status lifecycle.
2. **Quota Ledger & Position Tracking**: Tracks quota ownership by investor, daily position reconciliation, quota balance validation.
3. **Investment Order Lifecycle**: Processes investment orders (buy quotas), manages order states, settlement coordination.
4. **Redemption Order Lifecycle**: Processes redemption orders (sell quotas), manages order states, settlement coordination.
5. **Fee Calculation & Split**: Computes daily management fees (taxa de administração), distributes fees pro-rata to quota holders.
6. **Settlement Workflows**: Coordinates with payment module for cash settlement, validates settlement completion.
7. **Daily Position Reconciliation**: Reconciles quota balances with atomant-audit module, detects discrepancies.

---

## 2. Fund Master Data Management

### Fund Registration & Classification

**Fund Entity**:
- `fundId` (UUID): System-generated unique identifier
- `cnpj` (String, 14 digits): Fund CNPJ (unique, validated)
- `name` (String, 200 chars): Official fund name per CVM registration
- `fundClass` (Enum): EQUITY, FIXED_INCOME, BALANCED, STRUCTURED, REAL_ESTATE, MULTIMARKET
- `manager` (String, 14 digits): CNPJ of fund manager entity
- `administrator` (String, 14 digits): CNPJ of fund administrator
- `custodian` (String, 14 digits): CNPJ of custodian bank
- `annualFeeRate` (BigDecimal, scale 6): Annual fee percentage (e.g., 0.500000 for 0.5%)
- `status` (Enum): REGISTERED, ACTIVE, SUSPENDED, LIQUIDATED
- `createdDate` (Date): Fund creation date
- `inceptionDate` (Date): Fund inception date (start of operations)
- `liquidationDate` (Date, nullable): Fund liquidation date if status = LIQUIDATED

**Fund Validation Rules**:
- CNPJ must be 14 digits, valid checksum per CVM
- Fund name required, 10-200 characters
- annualFeeRate must be 0.0 to 5.0 (0% to 500% annual, typically 0.1-2.0%)
- Manager, administrator, custodian must be valid registered entities
- Fund cannot be ACTIVE before inceptionDate

### Daily NAV Ingestion & Caching

**Daily NAV Entity**:
- `fundId` (UUID): Reference to fund
- `navDate` (Date): Calculation date (business day)
- `navValue` (BigDecimal, scale 8): Net asset value per quota (e.g., 10.50000000)
- `totalPatrimony` (BigDecimal, scale 2): Total fund value in reais (sum of all assets)
- `totalQuotas` (BigDecimal, scale 8): Total quotas outstanding
- `dataQualityFlag` (Enum): LIVE, CACHED, 1_DAY_LAG, DELAYED, ESTIMATED, FALLBACK
- `sourceSystem` (String): CVM, INGESTION_MODULE, MANUAL_OVERRIDE
- `ingestionTimestamp` (Timestamp): When NAV was ingested
- `revisedDate` (Date, nullable): If corrected, prior NAV date

**NAV Calculation Rules**:
```
NAV per quota = Total Fund Patrimony / Total Quotas Outstanding

Example:
- Total patrimony: R$ 100,000,000
- Total quotas: 9,523,809.52380952 (scale 8)
- NAV per quota = 100,000,000 / 9,523,809.52380952 = 10.50000000
```

**NAV Validation Rules**:
- NAV must be > 0
- NAV per quota must not change > 10% from prior day (sanity check; flag if exceeds)
- Total patrimony must be >= sum of (NAV × investor quotas)
- Data quality flags set by atomant-ingestion module
- NAV cannot be updated retroactively > 24 hours (correction window)

**NAV Revision Workflow**:
1. Receive correction from atomant-ingestion (original NAV was wrong)
2. Store new NAV with `revisedDate` = original incorrect date
3. Trigger automatic recalculation of fees for corrected date
4. Publish FUND_NAV_CORRECTED event for downstream modules
5. Investors notified if NAV change > 1% (via integration module)

### Fund Status Lifecycle

| Status | Allowed Transitions | Operations Allowed |
|--------|-------------------|------------------|
| REGISTERED | → ACTIVE | No investments; master data edits only |
| ACTIVE | → SUSPENDED, → LIQUIDATED | All operations (invest, redeem, fees) |
| SUSPENDED | → ACTIVE, → LIQUIDATED | No invest/redeem; fees continue; daily operations |
| LIQUIDATED | None (terminal) | No operations; liquidation proceeds only |

**Status Change Rules**:
- REGISTERED → ACTIVE: Requires inceptionDate <= today AND manager approval
- ACTIVE → SUSPENDED: Compliance trigger OR manual CVM directive (audit logged)
- ACTIVE/SUSPENDED → LIQUIDATED: CVM authorization required; publish FUND_LIQUIDATION_INITIATED event
- Liquidation process: Distribute remaining patrimony pro-rata to quota holders; create redemption orders

---

## 3. Quota Holder Ledger & Position Management

### Quota Holder Entity

**Quota Holder Record**:
- `holderId` (UUID): System-generated unique identifier
- `fundId` (UUID): Reference to fund
- `investorId` (String): CPF (11 digits) or CNPJ (14 digits) of investor
- `holderType` (Enum): INVESTOR_RETAIL, INVESTOR_INSTITUTIONAL, CUSTODIAN, ADMINISTRATOR
- `status` (Enum): ACTIVE, SUSPENDED, REDEEMED_ALL
- `kycStatus` (Enum): PENDING, APPROVED, REJECTED, BLOCKED_AML
- `createdDate` (Date): First investment date
- `lastActivityDate` (Date): Last investment/redemption date
- `totalInvestedAmount` (BigDecimal, scale 2): Cumulative invested (tracking only)
- `totalRedeemedAmount` (BigDecimal, scale 2): Cumulative redeemed (tracking only)

**Validation Rules**:
- investorId must be valid CPF/CNPJ per CVM/BACEN
- KYC status must be APPROVED before investments allowed
- AML sanctions screening required (COAF integration)
- Investor cannot have > R$ 1,000,000 in fund without institutional accreditation (per CVM rules)

### Quota Balance Entity

**Daily Quota Balance**:
- `balanceId` (UUID): Unique identifier
- `holderId` (UUID): Reference to quota holder
- `fundId` (UUID): Reference to fund
- `balanceDate` (Date): As-of date (business day)
- `openingQuotas` (BigDecimal, scale 8): Quotas at start of day
- `investmentQuotas` (BigDecimal, scale 8): Quotas purchased during day
- `redemptionQuotas` (BigDecimal, scale 8): Quotas sold during day
- `closingQuotas` (BigDecimal, scale 8): Quotas at end of day
- `feeQuotasDeducted` (BigDecimal, scale 8): Quotas deducted for daily fee
- `navValueAtClose` (BigDecimal, scale 8): NAV price at close (for reconciliation)
- `reconciliationStatus` (Enum): PENDING, RECONCILED, VARIANCE_DETECTED
- `varianceAmount` (BigDecimal, scale 2, nullable): Difference if variance detected

**Daily Balance Calculation**:
```
Opening Quotas (from prior day) = Prior Day Closing Quotas
+ Investment Quotas (from settled buy orders)
- Redemption Quotas (from settled sell orders)
- Fee Quotas Deducted (daily fee allocation)
= Closing Quotas
```

**Reconciliation Validation**:
- Closing Quotas must equal opening + investments - redemptions - fees
- If variance detected: Flag for manual review; publish QUOTA_BALANCE_VARIANCE event
- Variance tolerance: < 0.00000001 quotas (scale 8 precision)

---

## 4. Investment Order Lifecycle

### Investment Order Entity

**Investment Order Record**:
- `orderId` (UUID): Unique order identifier
- `holderId` (UUID): Quota holder placing order
- `fundId` (UUID): Fund being invested
- `orderDate` (Date): Order placement date (business day)
- `orderTime` (Time): Order placement time (HH:MM:SS)
- `investmentAmount` (BigDecimal, scale 2): Amount in reais to invest
- `quotasRequested` (BigDecimal, scale 8): Calculated quotas = amount / NAV at order time
- `navAtOrder` (BigDecimal, scale 8): NAV price used for quota calculation
- `orderStatus` (Enum): SUBMITTED, VALIDATED, SETTLEMENT_PENDING, SETTLED, REJECTED, CANCELLED
- `rejectionReason` (String, nullable): If REJECTED, reason code
- `settlementDate` (Date): Expected settlement (T+2 business days per B3)
- `settledDate` (Date, nullable): Actual settlement date when SETTLED
- `createdTimestamp` (Timestamp): Record creation time
- `updatedTimestamp` (Timestamp): Last update time

### Investment Order Workflow

**Step 1: Order Submission**
- Investor submits buy order (amount in reais)
- Validate: Investor status = APPROVED KYC, holderStatus = ACTIVE, fundStatus = ACTIVE
- Calculate quotas: `quotasRequested = investmentAmount / navAtOrder`
- Check daily investment limit: Max R$ 1,000,000 per investor per day (per CVM)
- Check monthly investment limit: Max R$ 5,000,000 per investor per month (per CVM)
- Store order with status = SUBMITTED

**Step 2: Validation**
- Verify investmentAmount > 0 AND < max allowed for investor type
- Verify investor funds availability (reserved in atomant-payment module)
- Verify fund balance check: totalPatrimony + investment <= max fund size (if applicable)
- If validation passes: orderStatus = VALIDATED
- If validation fails: orderStatus = REJECTED; publish ORDER_REJECTED event

**Step 3: Settlement Pending**
- Order moves to SETTLEMENT_PENDING
- Publish INVESTMENT_ORDER_CREATED event to message queue
- atomant-payment module receives event; validates payment readiness
- If payment confirmed: Publish PAYMENT_CONFIRMED event
- Investment module receives PAYMENT_CONFIRMED; proceeds to settlement

**Step 4: Settlement**
- Verify payment received (atomant-payment confirms)
- Calculate settlement quotas: `quotasToDeliver = investmentAmount / navAtSettlementDate`
- If settlementDate NAV unavailable, use most recent available NAV (with data quality flag)
- Add quotas to investor's daily quota balance
- Record: orderStatus = SETTLED, settledDate = today
- Publish INVESTMENT_SETTLED event

**Quota Rounding**:
- Calculate quotas to 8 decimal places (scale 8)
- Use HALF_EVEN rounding per financial industry standard
- Rounding difference (< 1 cent typically) goes to fund patrimony or investor depending on direction

### Investment Order Validation Rules

| Rule | Condition | Action |
|------|-----------|--------|
| **Investor KYC** | holderKycStatus ≠ APPROVED | REJECT with INVESTOR_NOT_APPROVED |
| **Fund Active** | fundStatus ≠ ACTIVE | REJECT with FUND_NOT_ACTIVE |
| **Daily Limit** | dailyInvestment > R$ 1M | REJECT with DAILY_LIMIT_EXCEEDED |
| **Monthly Limit** | monthlyInvestment > R$ 5M | REJECT with MONTHLY_LIMIT_EXCEEDED |
| **Minimum Investment** | investmentAmount < R$ 100 | REJECT with MINIMUM_INVESTMENT_NOT_MET |
| **NAV Available** | NAV unavailable > 5 days old | REJECT with NAV_TOO_STALE |
| **Investor Balance** | Payment not reserved | REJECT with PAYMENT_NOT_RESERVED |

---

## 5. Redemption Order Lifecycle

### Redemption Order Entity

**Redemption Order Record**:
- `orderId` (UUID): Unique order identifier
- `holderId` (UUID): Quota holder redeeming
- `fundId` (UUID): Fund being redeemed
- `orderDate` (Date): Redemption request date
- `orderTime` (Time): Redemption request time
- `quotasToRedeem` (BigDecimal, scale 8): Quotas being sold
- `redemptionAmount` (BigDecimal, scale 2): Expected proceeds = quotas × NAV at order
- `navAtOrder` (BigDecimal, scale 8): NAV price used for redemption amount calculation
- `orderStatus` (Enum): SUBMITTED, VALIDATED, SETTLEMENT_PENDING, SETTLED, REJECTED, CANCELLED
- `rejectionReason` (String, nullable): If REJECTED, reason code
- `settlementDate` (Date): Expected settlement (T+2 business days per B3)
- `settledDate` (Date, nullable): Actual settlement date
- `taxWithheld` (BigDecimal, scale 2): Withholding tax deducted (capital gains tax)
- `netProceeds` (BigDecimal, scale 2): Redeemed amount - tax withholding
- `createdTimestamp` (Timestamp): Record creation time
- `updatedTimestamp` (Timestamp): Last update time

### Redemption Order Workflow

**Step 1: Order Submission**
- Investor submits sell order (quotas to redeem)
- Validate: Investor status = ACTIVE, holderStatus = ACTIVE, fundStatus ≠ LIQUIDATED
- Verify quota balance: availableQuotas >= quotasToRedeem
- Calculate redemption amount: `redemptionAmount = quotasToRedeem × navAtOrder`
- Reserve quotas in investor's balance (mark as "pending redemption")
- Store order with status = SUBMITTED

**Step 2: Validation**
- Verify quotasToRedeem > 0
- Verify quotasToRedeem <= available balance (considering pending redemptions)
- Verify NAV available (not > 5 days old)
- Verify no redemption restrictions (if fund has gates/restrictions)
- If validation passes: orderStatus = VALIDATED
- If validation fails: orderStatus = REJECTED; unreserve quotas

**Step 3: Tax Calculation**
- Determine holding period: Settlement date - Original purchase date
- If holding <= 30 days: withholding rate = 22.5% (short-term capital gains)
- If holding > 30 days: withholding rate = 15% (long-term capital gains)
- If loss (NAV lower than purchase price): No withholding; carry forward for tax offset
- Calculate: `taxWithheld = redemptionAmount × withholdingRate` (if gain)
- Calculate: `netProceeds = redemptionAmount - taxWithheld`

**Tax Holding Period Rules**:
- Calculate holding period in days from original investment date to settlement date
- If investor received replacement quota (rights issue), adjust holding period
- If investor received reinvested fee, holding period starts from reinvestment date (not original)

**Step 4: Settlement Pending**
- Publish REDEMPTION_ORDER_CREATED event
- atomant-payment module reserves funds for redemption payout
- Mark quotas as "pending redemption" (not available for further redemptions)

**Step 5: Settlement**
- Verify settlement date reached (T+2 business days)
- Use settlement date NAV for final proceeds calculation
- Recalculate proceeds: `proceedsAtSettlement = quotasToRedeem × navAtSettlementDate`
- Recalculate withholding if NAV changed materially (>1% change triggers recalculation)
- Remove quotas from investor's balance
- Update atomant-audit with redemption record
- Publish REDEMPTION_SETTLED event
- Publish PAYMENT_TRANSFER_REQUESTED event (to atomant-payment for bank transfer)

### Redemption Restrictions

| Scenario | Restriction |
|----------|------------|
| Fund SUSPENDED | Redemptions blocked; queue for settlement when resumed |
| Fund LIQUIDATED | Liquidation proceeds distributed pro-rata; investor cannot selective redeem |
| Redemption gate active | Max 2% of fund value redeemed per day; excess queued for next day |
| Investor AML flag | Redemption blocked; COAF notification; 10-day hold before release |

---

## 6. Fee Calculation & Distribution

### Daily Fee Calculation

**Fee Calculation Formula**:
```
Daily Fee = Fund NAV × Annual Fee Rate / 252 (business days per year)

Example:
- Fund NAV: R$ 100,000,000
- Annual rate: 0.50% (0.005000)
- Daily fee = 100,000,000 × 0.005000 / 252 = 19,841.27
```

**Fee Rounding**:
- Scale 4 (0.0001)
- Rounding mode: HALF_EVEN (Banker's rounding)
- Example: 19,841.269 → 19,841.27

**Fee Split (Rateio)**:
- Allocate daily fee to each quota holder pro-rata
- `Holder Fee = Daily Fee × (Holder Quotas / Total Quotas)`

**Fee Quota Deduction**:
- Convert fee amount to quotas: `Fee Quotas = Daily Fee / NAV`
- Deduct fee quotas directly from investor's balance (not cash withdrawal)
- Record in atomant-audit module with investor details

### Fee Entities

**Daily Fee Calculation Record**:
- `calculationId` (UUID): Unique calculation identifier
- `fundId` (UUID): Fund
- `calculationDate` (Date): Business day calculation performed
- `navValue` (BigDecimal, scale 8): NAV used for calculation
- `annualFeeRate` (BigDecimal, scale 6): Fee rate on calculation date
- `dailyFee` (BigDecimal, scale 4): Total daily fee in reais
- `businessDayNumber` (Integer): Day number in calendar year (1-252)
- `totalQuotasOutstanding` (BigDecimal, scale 8): Total quotas at calculation time
- `quotaHolders` (Integer): Count of quota holders receiving fee split
- `calculatedTimestamp` (Timestamp): When calculation executed
- `status` (Enum): CALCULATED, ALLOCATED, REVERSED

**Holder Fee Split Record**:
- `splitId` (UUID): Unique split identifier
- `calculationId` (UUID): Reference to daily calculation
- `holderId` (UUID): Quota holder
- `quotasOwned` (BigDecimal, scale 8): Holder's quotas at calculation time
- `feeAllocationPercentage` (BigDecimal, scale 8): Percentage of total fee = quotas / total
- `allocatedFeeAmount` (BigDecimal, scale 4): Fee amount in reais for this holder
- `allocatedFeeQuotas` (BigDecimal, scale 8): Fee amount converted to quotas
- `auditRecordId` (UUID): Reference to atomant-audit record

### Fee Calculation Workflow

**Daily Schedule**: 5:30 PM (after NAV published by atomant-ingestion)

1. **Data Gathering**:
   - Query latest NAV for fund (from atomant-ingestion or cache)
   - If NAV unavailable: Use fallback (prior day NAV with FALLBACK flag)
   - Query total outstanding quotas from quota ledger
   - Query all quota holders with non-zero balances

2. **Calculation**:
   - Calculate daily fee: NAV × rate / 252
   - Round to scale 4 using HALF_EVEN

3. **Fee Allocation**:
   - For each quota holder:
     - Calculate percentage: holder quotas / total quotas
     - Calculate fee amount: daily fee × percentage
     - Convert to quota deduction: fee amount / NAV
     - Deduct from holder's balance

4. **Audit Recording**:
   - Record calculation in atomant-audit module (immutable append-only)
   - Include breakdown by quota holder
   - Flag data quality (LIVE, CACHED, FALLBACK)

5. **Event Publishing**:
   - Publish DAILY_FEE_CALCULATED event to message queue
   - Include calculation details for downstream modules

### Fee Reversal & Correction

**Scenario**: CVM discovered error in NAV; fund must recalculate fees retroactively

1. Receive DATA_CORRECTION event from atomant-ingestion
2. Query original fee calculation for corrected date
3. Calculate new fee with corrected NAV
4. Calculate difference per quota holder
5. Reverse original fee allocation (subtract quotas)
6. Allocate corrected fee allocation (add quotas)
7. Record reversal in atomant-audit with linkage to original calculation
8. Publish FEE_RECALCULATED event; atomant-integration notifies investors

---

## 7. Daily Position Reconciliation

### Reconciliation Process

**Schedule**: Daily at 7:00 PM (after fees calculated)

**Steps**:
1. Query all quota holders' current balances from investment-core DB
2. Query all atomant-audit fee allocation records for the day
3. Calculate expected balances:
   - For each holder: 
     - Opening balance (from prior day)
     - + Settled investment quotas (from today's settled orders)
     - - Settled redemption quotas (from today's settled orders)
     - - Fee quotas (from today's fee allocation)
     - = Expected closing balance
4. Compare expected vs. actual balances
5. If match (within tolerance): Reconciliation PASSED
6. If variance: Log variance record; flag for manual review

**Reconciliation Tolerance**:
- Quota variance tolerance: < 0.00000001 (1 smallest unit at scale 8)
- Amount variance tolerance: < R$ 0.01

**Variance Handling**:
- Publish QUOTA_BALANCE_VARIANCE event if variance exceeds tolerance
- Log variance with:
  - Holder ID
  - Fund ID
  - Variance amount (in quotas and reais)
  - Expected vs. actual balances
  - Timestamp and user (if manual intervention)
- Alert operations team if variance > R$ 100

### Reconciliation Error Scenarios

| Scenario | Root Cause | Recovery Action |
|----------|-----------|-----------------|
| Investment settled in atomant-payment but not in investment-core | System lag (message queue) | Retry message consumption; manual match if > 1 hour |
| Redemption marked redeemed but quotas still in balance | Fee system error | Reverse fee allocation; recalculate |
| Fee double-deducted | Duplicate message from calculator | Check idempotency key; replay if needed |
| Missing settlement | Payment processor failure | Check atomant-payment status; escalate |

---

## 8. Integration Points

### Inbound Integrations (Events Consumed)

| Source Module | Event Topics | Consumption | Use Case |
|---------------|-------------|-----------|----------|
| atomant-ingestion | FUND_NAV_UPDATED, FUND_NAV_CORRECTED | Cache update, trigger fee recalc | Daily NAV ingestion; correction handling |
| atomant-calculator | DAILY_FEE_CALCULATED | Fee allocation and splitting | Record fee splits per holder |
| atomant-payment | PAYMENT_CONFIRMED, PAYMENT_FAILED | Settlement confirmation | Settle investment/redemption orders |
| atomant-auth | MFA_CHALLENGE_SENT, AUTH_FAILURE_DETECTED | Investor validation | Validate investor before order processing |
| atomant-audit | AUDIT_RECORD_CREATED | Reconciliation verification | Match with fee allocation records |

### Outbound Integrations (Events Published)

| Destination | Event Topics | Trigger | Data Included |
|-----------|-------------|---------|----------------|
| atomant-calculator | DAILY_FEE_CALCULATED | Fee calculation complete | NAV, quotas, fee amount, holders |
| atomant-payment | INVESTMENT_ORDER_CREATED, REDEMPTION_ORDER_CREATED | Order submitted | Investor, amount, NAV, settlement date |
| atomant-audit | FEE_ALLOCATION_RECORDED, INVESTMENT_SETTLED, REDEMPTION_SETTLED | Orders settled, fees recorded | Full audit details |
| atomant-integration | INVESTMENT_CONFIRMATION, REDEMPTION_CONFIRMATION, NAV_PUBLISHED | Order completion, fee notification | Investor details, amounts, dates |
| atomant-auth | INVESTMENT_LIMIT_CHECK | Order validation | Investor ID, fund, amount |

### NAV Dependency

- **Source**: atomant-ingestion (via message queue or REST cache)
- **Freshness**: Use current day NAV if available; fallback to prior day with "FALLBACK" flag
- **If > 5 days stale**: Reject order with error STALE_NAV; queue for retry when fresh NAV available
- **Correction handling**: Receive DATA_CORRECTION event; recalculate fees for affected date

### Fee Integration

- **Source**: atomant-calculator publishes DAILY_FEE_CALCULATED
- **Investment-core consumes**: Stores fee allocation details; updates quota balances
- **Audit trail**: Records fee split per holder in atomant-audit

### Payment Integration

- **Outbound**: Publish INVESTMENT_ORDER_CREATED when order validated
- **Inbound**: Consume PAYMENT_CONFIRMED to settle investment
- **Outbound**: Publish REDEMPTION_ORDER_CREATED; wait for PAYMENT_CONFIRMED
- **Redemption settlement**: Atomant-payment transfers net proceeds to investor bank account

---

## 9. Data Validation & Constraints

### Fund Master Data Validation

| Field | Validation |
|-------|-----------|
| CNPJ | 14 digits, valid checksum, registered with CVM |
| Name | 10-200 characters, no special characters |
| Fund class | Must be in enum (EQUITY, FIXED_INCOME, etc.) |
| Annual fee rate | 0.0 to 5.0, typically 0.1 to 2.0 |
| Manager/Admin/Custodian | Must be valid 14-digit CNPJ registered with BACEN |
| Status transitions | Only allowed transitions per state machine |

### Investor Validation

| Field | Validation |
|-------|-----------|
| CPF | 11 digits, valid checksum per CPF algorithm |
| CNPJ | 14 digits, valid checksum per CNPJ algorithm |
| KYC status | Must be APPROVED for active investments |
| AML status | Must pass COAF sanctions screening |
| Investment limit | Enforced by order validation |

### Order Validation

| Field | Validation |
|-------|-----------|
| Investment amount | > R$ 100, < R$ 1,000,000/day, < R$ 5,000,000/month |
| Quotas | Scale 8 precision, > 0 |
| NAV | > 0, not > 10% daily change, not > 5 days stale |
| Settlement date | T+2 business days per B3 calendar |

### Quota Balance Validation

| Check | Rule |
|-------|------|
| Daily reconciliation | Expected = opening + buys - sells - fees |
| Quota precision | Scale 8; tolerance < 0.00000001 |
| No negative quotas | closingQuotas >= 0 always |
| Fee deduction | feeQuotasDeducted <= (opening + daily buys) |

---

## 10. Error Classification & Handling

### Order Validation Errors

| Error Code | Scenario | HTTP Status | Recovery |
|-----------|----------|-----------|----------|
| INVESTOR_NOT_APPROVED | KYC status ≠ APPROVED | 422 | Submit KYC; retry later |
| FUND_NOT_ACTIVE | Fund status ≠ ACTIVE | 422 | Wait for fund activation |
| DAILY_LIMIT_EXCEEDED | > R$ 1M/day | 422 | Retry next day |
| NAV_UNAVAILABLE | No NAV available | 503 | Retry after NAV published |
| INSUFFICIENT_QUOTAS | Redeem more than owned | 422 | Reduce redemption amount |
| PAYMENT_NOT_RESERVED | atomant-payment failed | 402 | Verify funds; retry |

### Reconciliation Errors

| Error | Cause | Action |
|-------|-------|--------|
| Quota variance | Fee double-deducted; message lag | Alert ops; investigate root cause; reverse if needed |
| Missing investment | Message queue lag | Retry message consumption; manual match if > 1 hour |
| Settlement mismatch | Payment processor lag | Check atomant-payment status; escalate |

### Data Integrity Errors

| Check | If Failed | Action |
|-------|-----------|--------|
| NAV < 0 | Data error in atomant-ingestion | Reject NAV; request correction |
| Daily fee = 0 when rate > 0 | Calculation error | Recalculate with correct formula |
| Fund quotas mismatch | Sum of holder quotas ≠ total | Trigger reconciliation audit |

---

## 11. Performance & Scalability

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Order placement validation | <500ms | KYC check, fund status, limit validation |
| Order settlement | <2s | Quota allocation, balance update, audit log |
| Daily fee calculation (1000+ holders) | <5s | Parallel calculation per holder |
| Position reconciliation | <10s | Query all balances; compare with audit |
| NAV lookup & caching | <100ms | In-memory cache; fallback to database |
| Quota balance query | <200ms | Indexed by holderId, fundId, date |

### Concurrency & Scalability

| Resource | Limit | Notes |
|----------|-------|-------|
| Virtual Threads | Unlimited | Java 21 Virtual Threads for order processing |
| Thread pool (fee calc) | Core 10, Max 50 | Parallel fee calculation per holder |
| Database connections | 50 | Connection pool for PostgreSQL |
| Message queue consumers | 3 | Kafka/RabbitMQ consumer group; auto-scaling |

### Database Partitioning

- **Daily quota balances**: Partition by date (monthly ranges)
- **Fee calculations**: Partition by fund + date (monthly)
- **Orders**: Partition by status + date (monthly)
- **Retention**: Keep hot data (current year); archive to S3 after 2 years

---

## 12. Compliance & Regulatory

### CVM Compliance
- Fund registration mandatory before accepting investments
- NAV published daily by 5:00 PM
- Fee disclosure in prospectus (updated annually)
- 20-year audit trail of all transactions
- Monthly NAV reports to CVM

### BACEN Compliance
- Working calendar enforcement (B3 business days)
- Settlement T+2 per market regulations
- Foreign investor tracking (for capital controls)
- Monthly reporting of foreign investor positions

### Tax Authority Compliance
- Capital gains withholding (22.5% short-term, 15% long-term)
- Monthly tax reporting (DARF forms)
- Quarterly estimated tax payments
- Annual investor statements with tax details

### LGPD Data Protection
- Investor PII encrypted at rest and in transit
- Support data deletion requests (90-day SLA)
- Privacy notice on all investor communications
- Audit trail of data access (who accessed investor data, when, why)

---

## 13. Testing Requirements

### Unit Tests (100% coverage)

**Fee Calculation**:
- Daily fee formula: NAV × rate / 252
- Fee split: pro-rata allocation
- Rounding: HALF_EVEN per financial standards
- Edge cases: NAV = 0, rate = 0, single holder, many holders

**Quota Operations**:
- Daily balance reconciliation: opening + buys - sells - fees
- Investment order: quota calculation, settlement
- Redemption order: quota removal, tax withholding
- Validation: limits, status checks

**Data Validation**:
- Fund CNPJ validation
- Investor CPF/CNPJ validation
- Order amount validation
- Quota precision (scale 8)

### Integration Tests

**Workflow Tests**:
- Investment order: submission → validation → settlement
- Redemption order: submission → validation → tax calc → settlement
- Fee calculation: NAV ingestion → fee calc → allocation → audit log
- Reconciliation: balance query → expected calc → variance detection

**Event Handling**:
- NAV_UPDATED event consumption
- PAYMENT_CONFIRMED event handling
- Fee allocation record creation
- Audit trail logging

### Performance Tests

- Order processing throughput (1000 orders/min)
- Fee calculation (1000+ holders in <5s)
- Position reconciliation (10k balances in <10s)
- Database query latency (percentile P95, P99)

### Resilience Tests

- NAV unavailable (use fallback)
- Fund status change during pending orders
- Payment failure scenario
- Database connection failure

---

## 14. API Endpoint Specifications

### Fund Registration
```
POST /api/v1/funds
Authorization: Bearer {jwt_token}
X-Role: FUND_MANAGER

Request:
{
  "cnpj": "00.000.000/0001-00",
  "name": "ABC Fund Plus",
  "fundClass": "EQUITY",
  "manager": "00.000.000/0001-01",
  "administrator": "00.000.000/0001-02",
  "custodian": "00.000.000/0001-03",
  "annualFeeRate": 0.005000,
  "inceptionDate": "2020-01-15"
}

Response (201 Created):
{
  "fundId": "uuid",
  "cnpj": "00.000.000/0001-00",
  "status": "REGISTERED"
}
```

### Fund NAV Query
```
GET /api/v1/funds/{fundId}/nav/{date}

Response (200 OK):
{
  "fundId": "uuid",
  "navDate": "2026-06-08",
  "navValue": 10.50000000,
  "dataQualityFlag": "LIVE",
  "totalPatrimony": 100000000.00,
  "totalQuotas": 9523809.52380952
}
```

### Investment Order Submission
```
POST /api/v1/orders/investment
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "investorId": "12345678901",
  "fundId": "uuid",
  "investmentAmount": 10000.00
}

Response (202 Accepted):
{
  "orderId": "uuid",
  "status": "SUBMITTED",
  "estimatedQuotas": 952.38,
  "expectedSettlementDate": "2026-06-10"
}
```

### Investment Order Status
```
GET /api/v1/orders/investment/{orderId}
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "orderId": "uuid",
  "status": "SETTLED",
  "settledDate": "2026-06-10",
  "quotasReceived": 952.380952,
  "settlementNAV": 10.50000000
}
```

### Redemption Order Submission
```
POST /api/v1/orders/redemption
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request:
{
  "investorId": "12345678901",
  "fundId": "uuid",
  "quotasToRedeem": 952.38
}

Response (202 Accepted):
{
  "orderId": "uuid",
  "status": "SUBMITTED",
  "estimatedProceeds": 10000.00,
  "estimatedWithholding": 1500.00,
  "estimatedNetProceeds": 8500.00,
  "expectedSettlementDate": "2026-06-10"
}
```

### Quota Balance Query
```
GET /api/v1/holders/{investorId}/funds/{fundId}/balance/{date}
Authorization: Bearer {jwt_token}

Response (200 OK):
{
  "holderId": "uuid",
  "fundId": "uuid",
  "balanceDate": "2026-06-08",
  "closingQuotas": 952.380952,
  "navValue": 10.50000000,
  "marketValue": 10000.00
}
```

### Daily Fee Calculation
```
GET /api/v1/funds/{fundId}/fees/{date}
Authorization: Bearer {jwt_token}
X-Role: COMPLIANCE_OFFICER

Response (200 OK):
{
  "fundId": "uuid",
  "calculationDate": "2026-06-08",
  "navValue": 10.50000000,
  "annualFeeRate": 0.005000,
  "dailyFee": 19841.27,
  "totalQuotas": 9523809.52,
  "quotasOutstanding": 9523809.52,
  "quotaHolders": 2500,
  "status": "ALLOCATED"
}
```

---

## 15. Data Model Summary

### Core Entities

**Fund** (Aggregate Root)
- fundId, cnpj, name, fundClass, manager, administrator, custodian
- annualFeeRate, status, inceptionDate, liquidationDate

**QuotaHolder** (Aggregate Root)
- holderId, fundId, investorId, holderType, status, kycStatus

**DailyQuotaBalance** (Value Object)
- balanceId, holderId, fundId, balanceDate
- openingQuotas, investmentQuotas, redemptionQuotas, closingQuotas, feeQuotasDeducted

**InvestmentOrder** (Entity)
- orderId, holderId, fundId, investmentAmount, quotasRequested
- orderStatus, settlementDate, settledDate, navAtOrder

**RedemptionOrder** (Entity)
- orderId, holderId, fundId, quotasToRedeem, redemptionAmount
- orderStatus, settlementDate, settledDate, taxWithheld, netProceeds

**DailyFeeCalculation** (Entity)
- calculationId, fundId, calculationDate, dailyFee, totalQuotas

**HolderFeeSplit** (Value Object)
- splitId, calculationId, holderId, allocatedFeeAmount, allocatedFeeQuotas

---

## 16. Integration Timeline & Priorities

### Phase 1 (Weeks 1-2): Fund Master Data
1. Fund registration API
2. Fund status lifecycle
3. Fund validation rules

### Phase 2 (Weeks 3-4): Quota Ledger
1. Quota holder management
2. Daily quota balances
3. Position reconciliation

### Phase 3 (Weeks 5-6): Order Processing
1. Investment order workflow
2. Redemption order workflow
3. Order validation rules

### Phase 4 (Weeks 7-8): Fee Integration
1. Fee calculation integration with atomant-calculator
2. Fee allocation and split
3. Fee audit logging

### Phase 5 (Weeks 9-10): Settlement
1. Payment integration with atomant-payment
2. Order settlement workflow
3. Tax withholding calculations

### Phase 6 (Weeks 11-12): Testing & Compliance
1. Comprehensive test coverage
2. Performance tuning
3. Regulatory compliance verification
4. Production readiness

---

## Summary

The **Investment-Core Module** is the central hub for fund operations and quota holder management in the atomant system. It ensures:

1. **Fund Master Data Integrity**: Registration, status management, NAV tracking
2. **Quota Ledger Accuracy**: Position tracking, daily reconciliation, variance detection
3. **Order Processing**: Investment and redemption workflows with full audit trail
4. **Fee Management**: Daily calculation, pro-rata allocation, accurate splits
5. **Regulatory Compliance**: CVM, BACEN, tax authority requirements
6. **Performance**: Sub-second order validation; <5s fee calculations; <10s reconciliation
7. **Scalability**: Handle 10k+ quota holders; process 1000 orders/min; 252 business days/year

Integration with atomant-ingestion (NAV), atomant-calculator (fees), atomant-payment (settlement), and atomant-audit (records) ensures end-to-end accuracy and compliance.
