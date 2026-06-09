# Business Rules: Calculator Module for Investment & Payment Process

## Overview

This document defines the business rules for financial calculations within the `atomant-calculator` module, which serves as the central calculation engine for the investment and payment processing lifecycle. All calculations must strictly adhere to Java `BigDecimal` with `RoundingMode.HALF_EVEN` to ensure regulatory compliance and audit trail accuracy.

---

## 1. Investment-Related Calculations

### 1.1 Investment NAV (Net Asset Value) Calculation

#### Daily NAV Computation
- **Definition**: NAV represents the per-unit value of a fund on a given date
- **Formula**:
  $$NAV_{\text{Daily}} = \frac{\text{Total Fund Assets} - \text{Total Liabilities}}{\text{Total Quotas Outstanding}}$$
- **Calculation Frequency**: Once per business day, computed after market close (typically 4:00 PM São Paulo time)
- **Effective Date**: NAV effective for T+1 (next business day)
- **Precision**: 8 decimal places (BigDecimal scale)
- **Rounding**: `RoundingMode.HALF_EVEN`

#### NAV Components
1. **Total Fund Assets**:
   - Cash and equivalents
   - Securities positions (valued at market close price)
   - Accrued interest and dividends
   - Foreign currency positions (converted at ECB/Reuters mid-rate)

2. **Total Liabilities**:
   - Administrative fees accrued (not yet paid)
   - Custody fees
   - Trading commissions pending settlement
   - Regulatory withholdings

3. **Adjustments for Fund Events**:
   - **Stock Splits**: Fund quotas adjusted proportionally; NAV recalculated
   - **Distributions**: NAV adjusted downward by distribution amount per quota
   - **Capital Calls**: Increases total assets; NAV may increase if new capital > existing liabilities

#### NAV Amendment Rules
- **Correction Window**: 24 hours post-publication
- **Reasons for Amendment**: Pricing error (> 0.01%), settlement failure, FX rate error
- **Procedure**: 
  1. Compliance officer identifies error and documents justification
  2. NAV recalculated for affected date(s)
  3. All downstream calculations (fees, redemptions) recalculated
  4. Audit trail entry created with original vs. corrected NAV
  5. Quota holders notified within 2 business hours
  6. Corrected NAV republished; historical records marked as amended

### 1.2 Investment Amount Determination

#### Quota Purchase Calculation
Given an investment amount (in BRL), determine the number of quotas acquired:
$$\text{Quotas Acquired} = \frac{\text{Investment Amount}}{NAV_{\text{Effective}}}$$

**Precision**:
- Intermediate calculation: 10 decimal places
- Final quota count: 8 decimal places (cannot issue fractional quotas beyond 8 places)
- Rounding: `RoundingMode.HALF_EVEN`

#### Minimum & Maximum Investment Constraints
- **Minimum Investment**: R$ 1,000.00 (standard individual investor)
  - Institutional minimum: R$ 10,000.00
  - Qualified investor minimum: R$ 100,000.00
- **Maximum Single Transaction**: R$ 10,000,000.00 (configurable per fund)
- **Daily Aggregated Limit per Investor**: R$ 50,000,000.00
- **Monthly Aggregated Limit per Fund**: R$ 500,000,000.00 (liquidity constraint)

#### Validation Rules
- If `Investment Amount < Minimum`, reject with error code `INVESTMENT_BELOW_MINIMUM`
- If `Investment Amount > Maximum Single Transaction`, prompt for split or escalate to fund manager approval
- If `Daily Aggregate > Limit`, queue remaining for next business day or request extension
- If `Monthly Aggregate > Limit`, allocate proportionally across remaining business days in month

### 1.3 Settlement Price Determination

#### Settlement Date Convention
- **T+0**: Settlement on transaction date (only for intraday transfers within same custodian)
- **T+1**: Settlement on next business day (standard for retail investors)
- **T+3**: Settlement on 3rd business day (institutional investors, large transactions)

#### Price Locking
- **Lock Point**: Investor submits investment order at Market Close (4:00 PM São Paulo time)
- **NAV Effective**: NAV published for T+1, used for quote calculation
- **Investor Confirmation**: 15-minute window to confirm purchase at locked NAV
  - If confirmed: Settled at locked NAV
  - If not confirmed: Order expires; investor must resubmit
- **After Confirmation**: NAV locked until settlement date; no repricing

#### Partial Fill Handling
- If investment amount not fully allocated by close of settlement date, investor has two options:
  1. **Automatic Resubmission**: Order resubmitted next business day at current NAV (default)
  2. **Refund**: Investment amount returned with accrued interest for days on hold (calculated per Rule 3.1)

---

## 2. Payment-Related Calculations

### 2.1 Administrative Fee Calculation

#### Rule 1: Daily Fund Fee (Diarization)
The annual management fee is converted to a daily fee based on a 252-business-day calendar:
$$\text{Daily Fund Fee} = \frac{\text{Fund NAV} \times \text{Annual Fee Rate}}{252}$$

**Implementation**:
```
BigDecimal dailyFee = fundNAV
    .multiply(annualFeeRate)
    .divide(BigDecimal.valueOf(252), 4, RoundingMode.HALF_EVEN);
```

**Precision**: 4 decimal places
**Timing**: Calculated each business day; persisted to audit memory

#### Special Cases
1. **Leap Year Adjustment**: Use 252 business days (constant, not adjusted for leap days)
2. **Fund Inception**: If fund < 252 days old, prorate the year-to-date fee
3. **Fund Closure**: If fund closes mid-month, calculate pro-rata fee through closure date

### 2.2 Quota Holder Fee Apportionment

#### Rule 2: Representation Ratio
Calculate each quota holder's ownership percentage:
$$\text{Representation Ratio} = \frac{\text{Holder Quotas}}{\text{Total Fund Quotas}}$$

**Implementation**:
```
BigDecimal representation = holderQuotas
    .divide(totalFundQuotas, 8, RoundingMode.HALF_EVEN);
```

**Precision**: 8 decimal places
**Timing**: Calculated daily for each position

#### Rule 3: Pro-rata Fee Apportionment
Allocate the daily fund fee to each quota holder:
$$\text{Pro-rata Fee} = \text{Daily Fund Fee} \times \text{Representation Ratio}$$

**Implementation**:
```
BigDecimal proratedFee = dailyFundFee
    .multiply(representation)
    .setScale(4, RoundingMode.HALF_EVEN);
```

**Precision**: 4 decimal places (internal); converted to 2 decimal places for final billing
**Timing**: Calculated daily; accumulated for monthly fee billing

#### Special Scenarios
1. **New Investor (Mid-Month)**:
   - Investment settled on Day 15 of month
   - Pro-rata fees calculated from Day 15-30 (16 days held)
   - Representation ratio applies only for held days
   - Formula:
     $$\text{Pro-rata Monthly Fee} = \text{Daily Pro-rata Fee} \times \frac{\text{Days Held}}{30}$$

2. **Investor Redemption (Mid-Month)**:
   - Redemption settled on Day 20 of month
   - Pro-rata fees calculated for Day 1-20 (20 days held)
   - Redemption proceeds debited by accumulated fees for held period

3. **Fund Split/Consolidation**:
   - If fund quotas increase due to reinvestment: Representation ratio recalculated; fees continue uninterrupted
   - If fund consolidates (e.g., 1-for-10 reverse split): Quotas adjusted, representation ratio unchanged
   - Fees NOT recalculated retroactively; only applied prospectively

### 2.3 Redemption Payment Calculation

#### Redemption Proceeds Formula
Given redemption of Q quotas:
$$\text{Redemption Gross Proceeds} = Q \times NAV_{\text{Settlement Date}}$$
$$\text{Redemption Fees} = \text{Accumulated Pro-rata Fees} + \text{Redemption Transaction Fee}$$
$$\text{Redemption Net Proceeds} = \text{Redemption Gross Proceeds} - \text{Redemption Fees}$$

**Precision**: 2 decimal places (final user amount)

#### Redemption Transaction Fee
- **Standard Fee**: 0.25% of redemption amount (capped at R$ 5,000.00)
- **High-Frequency Redemption Penalty**: If investor redeems > 4 times in 90-day period:
  - Additional 1% fee on 5th+ redemption
  - Waived if investor holds for minimum 180 days without redemption
- **Institutional Fee**: 0.10% (lower rate for CNPJ-registered investors)

#### Tax Withholding on Redemption
- **Capital Gains Tax** (if applicable):
  - Gain = Redemption Proceeds - Investment Cost Basis
  - Tax Rate: 15% (long-term, held > 30 days); 22.5% (short-term, held ≤ 30 days)
  - Withheld from redemption proceeds; remitted to tax authority
- **Income Tax**:
  - Accrued interest/dividends subject to 15% withholding (if not already withheld)

#### Redemption Settlement Timing
- **Submission**: Investor requests redemption before 2:00 PM São Paulo time
- **Settlement Window**: T+5 business days (5 business day settlement)
- **NAV Used**: NAV effective as of T+1 (next business day after submission)
- **If Settlement Delayed** (liquidity crisis, regulatory hold):
  - Additional holdback interest accrues daily per Rule 2.4
  - Interest rate: CDI + 2% annual
  - Investor notified of delay and accrued interest amount

### 2.4 Interest Accrual on Holdback Periods

#### Rule: Holdback Interest Accrual
When redemption or payment is held beyond normal settlement window:
$$\text{Holdback Interest} = \text{Held Amount} \times \frac{\text{CDI Rate + 2\%}}{252} \times \text{Days Held}$$

**Implementation**:
```
BigDecimal dailyRate = (CDIRate.add(BigDecimal.valueOf(0.02)))
    .divide(BigDecimal.valueOf(252), 8, RoundingMode.HALF_EVEN);
BigDecimal holdbackInterest = heldAmount
    .multiply(dailyRate)
    .multiply(BigDecimal.valueOf(daysHeld))
    .setScale(2, RoundingMode.HALF_EVEN);
```

**Precision**: 2 decimal places
**Capitalization**: Added to redemption amount or next payment
**Approval**: Automatically applied; investor notified when settlement clears

### 2.5 Dividend & Distribution Calculations

#### Ex-Dividend Date Determination
- **Record Date**: Date on which investor must hold quotas to receive distribution
- **Ex-Dividend Date**: First business day on or after which quotas trade without dividend rights (typically -1 day from record date)
- **Payment Date**: Funds distributed to investor account (typically 5 business days post record date)

#### Distribution Amount per Quota
Given total distribution amount D and total quotas Q:
$$\text{Distribution per Quota} = \frac{D}{Q}$$

**Precision**: 8 decimal places (matches quota precision)

#### Investor Entitlement
- Investor entitled to distribution if they held quotas on record date
- If quotas acquired after ex-dividend date: No distribution entitlement for current distribution
- If quotas redeemed before record date: Entitled to distribution only if held through ex-dividend date

#### Tax Treatment of Distributions
- **Dividend Income**: 15% withholding tax (automatic)
- **Interest on Capital**: 22.5% withholding tax (negotiated rate)
- **Return of Capital**: No withholding (reduction in cost basis)

---

## 3. Financial Index Calculations

### 3.1 Index-Linked Fee Calculations

#### CDI (Interbank Deposit Rate) - Linked Fees
If fund uses CDI-linked fees (e.g., "CDI + 1.5%"):
$$\text{Effective Annual Fee Rate} = \text{CDI Rate} + \text{Fee Spread}$$

**CDI Source**: Published daily by B3 (formerly BOVESPA)
- **Update Frequency**: Once per business day at 4:30 PM São Paulo time
- **Effective For**: Calculations on next business day
- **Backfill**: If CDI delayed, use previous day's rate with 1-day carryforward

#### IPCA (Inflation Index) - Linked Fees
If fund uses IPCA-linked fees (e.g., "IPCA + 2%"):
$$\text{Effective Annual Fee Rate} = (1 + \text{IPCA Rate}) \times (1 + \text{Fee Spread}) - 1$$

**IPCA Source**: Published by IBGE (Brazilian Statistics Bureau)
- **Update Frequency**: Monthly (typically 11th of following month)
- **Application**: Retroactively applied for month reported
- **Adjustment**: Fee recalculated for each day of month using published rate

#### Selic (Central Bank Rate) - Linked Fees
If fund uses Selic-linked fees:
$$\text{Effective Annual Fee Rate} = \text{Selic Rate} \times \text{Fee Multiplier}$$

**Selic Source**: Published by Central Bank of Brazil
- **Update Frequency**: Daily (published after COPOM meetings or market adjustments)
- **Intraday Updates**: If Selic changes mid-day, weighted average used for daily calculation

### 3.2 Index Validation & Fallback Rules

#### Data Availability Rules
- If index not available for calculation date:
  1. Use previous business day's rate (1-day lag)
  2. If previous day unavailable: Use last available rate + 1-day lag
  3. If > 5 business days missing: Escalate to fund manager for manual override

#### Index Source Verification
- **Primary Source**: B3 API for CDI, IBGE for IPCA, Central Bank for Selic
- **Fallback Source**: Bloomberg terminal (if primary source delayed)
- **Manual Override**: Fund manager can manually input rate with compliance review

#### Audit Trail for Index-Linked Calculations
- Every index value used logged with:
  - Source identifier
  - Effective date
  - Rate value
  - Calculation date using that rate
  - Any manual overrides (with justification)

---

## 4. Precision & Rounding Rules for All Calculations

### 4.1 Scalar Precision Standards

| Calculation | Scale | Rounding Mode | Usage |
|-------------|-------|---------------|-------|
| NAV | 8 | HALF_EVEN | Fund unit pricing |
| Daily Fee | 4 | HALF_EVEN | Fee apportionment |
| Representation Ratio | 8 | HALF_EVEN | Quota holder ownership |
| Pro-rata Fee (intermediate) | 4 | HALF_EVEN | Before final billing |
| Final Currency Amounts | 2 | HALF_EVEN | User-facing payments |
| Interest Rates (annual) | 6 | HALF_EVEN | Fee rate calculations |
| Daily Interest Rates | 8 | HALF_EVEN | Accrual calculations |

### 4.2 Rounding Rules by Operation

1. **Intermediate Calculations**:
   - Maintain maximum precision (8+ decimal places)
   - Round only at final step before persisting
   - Never round during chain of calculations

2. **Aggregations**:
   - Sum individual rounded values (not the reverse)
   - Example: Sum pro-rata fees for all quota holders in fund
   $$\text{Total Daily Fee} = \sum_{i=1}^{n} \text{Prorated Fee}_i$$
   - Compare with calculated Daily Fund Fee; variance analyzed (< 0.01 BRL acceptable)

3. **Reconciliation Variance**:
   - Due to rounding across thousands of quota holders, sum of pro-rata fees may differ from calculated daily fund fee
   - Acceptable variance: < R$ 0.01 per fund per day
   - If variance > threshold: Investigate for calculation errors, audit logged

### 4.3 Scale Conversion Rules

When converting between scales (e.g., from 4-place to 2-place):
```
BigDecimal rounded = value
    .setScale(targetScale, RoundingMode.HALF_EVEN);
```

**Never use truncation or rounding towards zero** — always use HALF_EVEN.

---

## 5. Special Calculation Rules for Edge Cases

### 5.1 Fund Inception & Closure

#### Inception Calculations
- Fund launched on Day 1 with opening NAV = R$ 1.00 (standard)
- Initial investments priced at NAV 1.00
- First daily fee calculation on Day 1 (prorated to 1/252 of annual rate)

#### Closure Calculations
- Final NAV published on last trading day
- Remaining quota holders' redemptions processed at final NAV
- Pro-rata fees calculated through closure date
- Final audit memory record created with closure timestamp

### 5.2 Corporate Actions (Stock Splits, Consolidations)

#### Stock Split (Fund Quota Split)
- Example: 1-for-2 split (each quota becomes 2 quotas)
- **Impact on NAV**: NAV halved; total quotas doubled; representation ratio unchanged
  $$NAV_{\text{Post}} = \frac{NAV_{\text{Pre}}}{2}$$
  $$\text{Quotas}_{\text{Post}} = \text{Quotas}_{\text{Pre}} \times 2$$
  $$\text{Representation}_{\text{Post}} = \frac{\text{Quotas}_{\text{Post}}}{\text{Total Quotas}_{\text{Post}}} = \text{Representation}_{\text{Pre}}$$
- **Effective Date**: Post-split, all new calculations use post-split NAV and quotas
- **Investor Communication**: Notified 5 business days before effective date

#### Stock Consolidation (Reverse Split)
- Example: 10-for-1 reverse split (10 quotas become 1 quota)
- **Calculations**: Inverse of split (NAV increased 10x, quotas decreased 10x)
- **Fractional Quota Handling**:
  - If investor holds fractional quotas that cannot be consolidated (e.g., 15 quotas in 10-for-1), redeem at NAV
  - Example: 15 quotas → 1 full quota + 5 fractional → 1 quota + cash payment (5 × NAV)

### 5.3 Fund Reorganization & Merger

#### Merger: Fund A + Fund B → Fund C
- **NAV Determination**:
  - Fund C NAV = (Fund A Total Assets + Fund B Total Assets) / (Fund A Total Quotas + Fund B Total Quotas)
- **Quota Conversion** (if applicable):
  - Fund A investors: Quotas converted based on agreed ratio
  - Example: 1 Fund A quota → 1.25 Fund C quotas
  $$\text{Fund C Quotas} = \text{Fund A Quotas} \times \text{Conversion Ratio}$$
- **Fee Application**:
  - Fund A investors receive pro-rata fee credit for merger date
  - Fund C fees apply from merger date forward
  - No retroactive recalculation of pre-merger periods

---

## 6. Reconciliation & Validation Rules

### 6.1 Daily Reconciliation Checks

After daily fee calculations, validate:

1. **NAV Consistency**:
   - NAV change < 5% from previous day (flag if > 5% for manual review)
   - Daily NAV >= 0.01 (no negative NAVs)

2. **Fee Aggregation**:
   - Sum of all pro-rata fees ≈ Daily Fund Fee (variance < R$ 0.01)
   - If variance > threshold: Recalculate all pro-rata fees; investigate rounding issues

3. **Quota Consistency**:
   - Total quotas = Σ all quota holder holdings
   - Variance should be 0 (log any discrepancy > 1 quota)

4. **Representation Validation**:
   - Sum of all representation ratios = 1.0 (variance < 0.000001)
   - Any individual representation ratio > 0.5: Flag for manual review (concentration risk)

### 6.2 Monthly Reconciliation

- **Investment Verification**: Total invested cash = Σ (Quotas × NAV Settlement)
- **Redemption Verification**: Total redeemed proceeds = Σ (Quotas × NAV Settlement - Fees)
- **Fee Billing**: Monthly fee invoice = Σ daily pro-rata fees (aggregate)
- **Asset Movement**: Fund balance = Opening balance + Investments - Redemptions - Fees ± Market P&L

### 6.3 Audit Trail Validation

Every calculation tied to:
- **Calculation ID**: UUID generated at calculation time
- **Timestamp**: Millisecond precision
- **Data Hash**: SHA-256 hash of input parameters (for tamper detection)
- **Actor**: System, scheduled job, or manual override identifier
- **Approval Status**: Whether calculation requires secondary approval

---

## 7. Error Handling & Fallback Rules

### 7.1 Calculation Error Scenarios

| Scenario | Error Code | Handling |
|----------|-----------|----------|
| Division by zero (zero quotas) | `ZERO_DIVISOR` | Abort; flag to fund manager |
| Negative NAV computed | `NEGATIVE_NAV` | Reject; investigate asset pricing |
| Precision overflow (scale > 12) | `PRECISION_EXCEEDED` | Round aggressively; alert analyst |
| Index data missing | `INDEX_UNAVAILABLE` | Use previous day rate + 1-day lag |
| Settlement price locked after submission | `PRICE_LOCK_EXPIRED` | Reject order; ask for resubmission |

### 7.2 Retry & Recovery

- **Automatic Retry**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Alert Threshold**: If 3 retries fail, escalate to fund manager
- **Manual Override**: Fund manager can manually input calculation with compliance review

---

## 8. Regulatory & Compliance Requirements

### 8.1 CVM (Securities Commission) Compliance
- All fee calculations must be reconcilable to monthly statements provided to investors
- Fee rate disclosures must match calculations (tolerance: ±0.0001%)
- Calculation methodology documented in fund prospectus; changes require CVM approval

### 8.2 Audit Memory Integration
- Every calculation persisted to atomant-audit immutable log (see atomant-audit constitution §1)
- Audit records include full input parameters and computed results
- 20-year retention for all calculation records

### 8.3 Tax Reporting
- Dividend/interest withholding calculations provided to tax authorities (InfoDiv format)
- Capital gains calculated and reported per investor for tax return filing
- Calculation methodology compliant with IRS Normative Instructions

---

## 9. Performance & Scalability Targets

### 9.1 Calculation Performance

- **Daily Fee Calculation**: < 5ms per fund (< 2 seconds for 500 funds)
- **Apportionment Calculation**: < 1ms per quota holder (< 10 seconds for 10,000 holders)
- **Batch Processing**: Handle 100,000 calculations per minute (distributed across servers)
- **Memory Footprint**: < 500MB for in-memory calculation engine with 100,000 concurrent requests

### 9.2 Caching Strategy

- **Index Cache**: CDI, IPCA, Selic rates cached for 24 hours (Redis)
- **NAV Cache**: Daily NAV cached after publication; invalidated on amendment
- **Calculation Cache**: Results cached keyed by (fund_id, calculation_date) for 30 days
- **Cache Invalidation**: Automatic on config change; manual override available for emergency corrections

### 9.3 Bulk Calculation Optimization

- Batch process calculation requests in groups of 1000
- Use stream processing (not loops) for large quota holder lists
- Parallelize calculations across CPU cores (8+ cores recommended)
- Database connection pooling: Min 10, Max 50 connections

---

## 10. Dependencies & Integration Points

### 10.1 Upstream Dependencies
- **Market Data**: NAV inputs from fund custodian system
- **Index Data**: CDI/IPCA/Selic from B3, IBGE, Central Bank APIs
- **Configuration**: Fee rates and calculation rules from `atomant-investment-core`

### 10.2 Downstream Dependencies
- **Audit Module** (`atomant-audit`): All calculations logged immutably
- **Payment Module** (`atomant-payment`): Fee and redemption amounts drive payment processing
- **Reporting Module**: Calculation details exported for investor statements and tax reporting

### 10.3 External API Integration
- **B3 API**: CDI rate retrieval (daily update)
- **IBGE API**: IPCA rate retrieval (monthly update)
- **Central Bank API**: Selic rate retrieval (variable frequency)
- **Banking APIs**: Settlement NAV publication (if using external custodian)

---

## 11. Testing & Validation Requirements

### 11.1 Unit Test Coverage

- **Mathematical Formulas**: 100% coverage of all calculation paths
- **Edge Cases**: Zero values, maximum values, precision boundaries
- **Rounding Validation**: Verify HALF_EVEN applied correctly
- **Index Fallback**: Test missing index scenarios and fallback logic

### 11.2 Integration Tests

- **End-to-End Calculation**: Input fund data → Output fee + apportionment
- **Reconciliation Tests**: Sum of pro-rata fees = Daily fund fee
- **Cross-Module Integration**: Calculations flow correctly to audit and payment modules
- **Regulatory Compliance**: Fee calculations match disclosed rates (tolerance ±0.0001%)

### 11.3 Performance Tests

- Load testing: 1000 concurrent calculation requests
- Stress testing: Calculation latency under database lock conditions
- Memory profiling: Heap usage for batch processing 100,000+ records
- Cache effectiveness: Hit rates for index and NAV caches

