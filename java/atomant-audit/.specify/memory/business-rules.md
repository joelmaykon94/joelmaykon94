# Business Rules: System Investment & Payment Process

## Overview
This document defines the business rules governing investment transactions and payment processing within the `atomant-audit` module, ensuring compliance with financial regulations, audit requirements, and operational integrity.

---

## 1. Investment Process Business Rules

### 1.1 Investment Transaction Classification
- **Definition**: An investment transaction represents a quota holder's commitment of capital into a financial fund.
- **Valid States**: `PENDING`, `APPROVED`, `REJECTED`, `SETTLED`
- **Immutability**: Once settled, investment transactions cannot be modified or deleted—only corrected via reversal transactions.
- **Audit Trail**: Every state transition must be logged with timestamp, actor identifier, and reason.

### 1.2 Investment Validation Rules

#### Pre-Investment Checks
1. **KYC Compliance**: Quota holder must pass Know-Your-Customer (KYC) validation
   - Verify identity documentation completeness
   - Ensure no sanctions or regulatory flags exist
   - Validate business entity status (active, good standing)

2. **Investment Amount Constraints**
   - Minimum investment: Defined per fund type (stored in fund master data)
   - Maximum single transaction: Fund-specific upper limit
   - Cumulative monthly limit: Per quota holder account
   - Daily investment capacity: Fund liquidity constraints

3. **Quota Holder Eligibility**
   - Account status must be `ACTIVE`
   - No outstanding regulatory holds or suspensions
   - Tax registration must be current and verified
   - For institutional investors: Board approval required (logged)

#### Post-Investment Settlement
1. **NAV (Net Asset Value) Assignment**
   - Investment settled at NAV effective for the transaction date
   - NAV determined by calculation date cutoff (typically T+1)
   - Historical NAV amendments must not retroactively modify settled investments

2. **Fee Application**
   - Administrative fees applied based on investment amount and fund structure
   - Fee calculation uses formulas defined in `atomant-calculator`
   - Pro-rata adjustments for partial-month investments follow: 
     $$\text{Prorated Fee} = \text{Daily Fee} \times \frac{\text{Days in Investment Period}}{\text{Total Days in Month}}$$

### 1.3 Investment Reversal Rules
- **Allowed Within**: 5 business days of settlement (configurable per fund)
- **Reversal Processing**: Creates offsetting transaction with `REVERSED` status
- **Fee Adjustment**: Reversal causes administrative fees to be credited back to quota holder
- **Audit Log Entry**: Must reference original investment ID and business justification

---

## 2. Payment Process Business Rules

### 2.1 Payment Types & Triggers

#### Type A: Administrative Fee Payments
- **Frequency**: Monthly, calculated on the last business day of the month
- **Amount**: Derived from daily fee calculations × number of days held
- **Trigger Conditions**:
  - Calculation memory confirms fee entitlement (see `atomant-calculator`)
  - Fund position active on calculation date
  - No regulatory holds on quota holder account

#### Type B: Redemption Payments
- **Initiated By**: Quota holder redemption request
- **Amount**: (Redemption Quota Count × Current NAV) - Applicable Fees
- **Processing Time**: T+5 (5 business days settlement)
- **Fee Deduction**: Redemption fees deducted from redemption proceeds

#### Type C: Dividend/Interest Distributions
- **Frequency**: As declared by fund manager (quarterly, semi-annual, or annual)
- **Amount**: Proportional to quota holder's share on record date
- **Ex-Dividend Date**: Positions acquired after ex-date do not participate

#### Type D: Tax & Regulatory Withholdings
- **Withholding Calculation**: Based on quota holder tax classification
- **Retention**: Withheld amounts held in segregated account pending remittance to tax authority
- **Municipal Tax (ISS)**: Aggregated by branch code (see constitution §2)

### 2.2 Payment Eligibility & Pre-Payment Validation

1. **Account Status Check**
   - Quota holder account must be `ACTIVE`
   - No regulatory suspension or embargo
   - No outstanding compliance failures

2. **Fund Status Check**
   - Fund operations status is `OPEN`
   - No liquidity crisis or redemption suspension
   - Fund NAV is published and current

3. **Banking Information Validation**
   - Registered bank account on file (IBAN or local equivalent)
   - Account holder name matches quota holder name
   - Account verified via micro-deposit confirmation (if required by regulation)

4. **Amount Validation**
   - Payment amount > 0 and ≤ entitled amount
   - Payment does not exceed available fund liquidity
   - Foreign exchange rules applied if cross-border payment

### 2.3 Payment Sequencing & Waterfall

Payments are sequenced in the following priority order:

1. **Taxes & Withholdings** (highest priority)
   - Income tax withholding
   - Municipal tax (ISS) remittance
   - Regulatory penalties or assessments

2. **Administrative & Transaction Fees**
   - Fund management fees
   - Custody fees
   - Redemption fees

3. **Principal & Income Distributions**
   - Dividends and interest accruals
   - Redemption proceeds
   - Rebalancing payments

**Exception**: Regulatory holds or court orders override the waterfall order.

### 2.4 Payment Authorization & Approval

- **Amount ≤ R$ 50,000**: System-approved (automated)
- **Amount > R$ 50,000 AND ≤ R$ 250,000**: Requires fund manager approval
- **Amount > R$ 250,000**: Requires fund manager + compliance officer approval
- **Cross-Border Payments**: Always requires compliance officer approval
- **Approval SLA**: 24 business hours (audit logged)

### 2.5 Payment Execution & Settlement

#### Settlement Stages
1. **PAYMENT_INITIATED**: Payment record created, waiting authorization
2. **PAYMENT_APPROVED**: All approvals obtained, queued for execution
3. **PAYMENT_SUBMITTED**: Transmitted to banking network (ACH, wire, etc.)
4. **PAYMENT_SETTLED**: Funds deducted from fund account, recipient notified
5. **PAYMENT_COMPLETED**: Confirmation received from banking network

#### Reconciliation
- **Daily Reconciliation**: Submitted vs. settled payments cross-checked
- **Variance Handling**: Unexplained variances escalated to operations within 2 hours
- **Failed Payment Retry**: Automatic retry up to 3 times (configurable backoff)
- **Manual Intervention**: If auto-retry exhausted, escalate to operations team

#### Audit Trail Requirements
Every payment execution stage must persist:
- Timestamp (UTC)
- Actor identifier (user, system, or API client)
- Source and destination accounts
- Amount and currency
- Status code and reason (if rejected)
- Batch processing identifier (if applicable)

---

## 3. Regulatory & Compliance Rules

### 3.1 Position Holding Limitations
- **Minimum Hold Period**: 30 days from investment (configurable per fund)
- **Lock-up Period**: Applies to restricted funds; no redemption allowed
- **Seasoning Period**: New accounts: 5 business days before first redemption permitted

### 3.2 Currency & Foreign Exchange
- **Base Currency**: BRL (Brazilian Real)
- **Cross-Currency Investments**: Must be pre-approved at account level
- **FX Rate Locking**: Rates locked at transaction initiation time
- **FX Risk Disclosure**: Quota holder must acknowledge foreign exchange risk

### 3.3 Anti-Money Laundering (AML) & Sanctions
- **Screening**: Every investment and payment over R$ 25,000 triggers sanctions screening
- **Blocked Parties**: Transactions rejected if parties match OFAC/EU/UN lists
- **Beneficial Owner Verification**: For entities, verify ultimate beneficial owners (UBO)
- **Suspicious Activity Reporting (SAR)**: Triggered if patterns match predefined rules

### 3.4 Data Retention & Right to Audit
- **Investment Records**: Retained for 20 years (compliance with §1 of constitution)
- **Payment Records**: Retained for 10 years (minimum regulatory requirement)
- **Audit Access**: Regulators (CVM, BCB, COAF) granted read access upon warrant

---

## 4. Error Handling & Dispute Resolution

### 4.1 Failed Investment Transactions
- **Automatic Retry**: System retries failed investments up to 2 times (configurable)
- **Manual Review**: After auto-retry exhaustion, escalated to operations
- **Notification**: Quota holder notified within 4 hours of failure
- **Refund**: If investment rejected, any fees charged are refunded within 2 business days

### 4.2 Payment Discrepancies
- **Detection**: Automated daily reconciliation identifies missing/excess payments
- **Investigation**: Operations team investigates within 24 hours
- **Resolution**: 
  - If fund error: Corrective payment issued within 5 business days
  - If quota holder error: Escalated to compliance for advisory
  - If banking error: Dispute filed with banking network (SLA 10 business days)

### 4.3 Regulatory Disputes & Appeals
- **Appeal Process**: Quota holders may appeal denied investments/payments within 15 days
- **Review Authority**: Compliance officer conducts independent review
- **Escalation**: Unresolved disputes escalated to executive committee

---

## 5. System Integration Points

### 5.1 Dependencies on `atomant-calculator`
- Investment fee calculations depend on `CalculatorService`
- Administrative fees must be recalculated if fee schedule changes
- Prorated fee logic must match exactly (bi-directional audit)

### 5.2 Dependencies on Banking Systems
- Payment execution via banking gateway (ACH, wire transfers, PIX)
- Real-time balance inquiries from fund custodian
- Reconciliation feeds from bank settlement system

### 5.3 Dependencies on `atomant-payment` Module
- Payment processing orchestration delegated to payment module
- Approval workflow managed by payment module (not audit module)
- Compliance rules enforced by payment module business logic

---

## 6. Metrics & Monitoring

### 6.1 Investment Metrics
- **Daily investment volume** (BRL)
- **Approval/rejection rate** (%)
- **Average approval time** (hours)
- **Reversal rate** (%)

### 6.2 Payment Metrics
- **Daily payment volume** (BRL)
- **Payment success rate** (%)
- **Average settlement time** (hours)
- **Failed payment rate** (%)
- **Appeal/dispute rate** (%)

### 6.3 Alerting Thresholds
- Investment volume anomaly: > 2 standard deviations from 30-day average
- Payment failure spike: > 5% failure rate in any hour
- Reconciliation variance: Any unexplained variance > R$ 10,000
- Regulatory hold accumulation: > 3 active holds per quota holder

