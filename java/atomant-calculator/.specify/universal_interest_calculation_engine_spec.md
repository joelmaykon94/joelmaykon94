

# Feature Specification: Universal Interest Calculation Engine

**Feature Branch**: `universal-interest-calculation-engine`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Universal Interest Calculation Engine' specification. Define an Architecture Building Block (ABB) that abstracts interest rate logic away from legacy silos (CDC, Consignado). Create a stateless domain service that receives the principal amount, rate, period, and index type, returning the calculated interest. Enforce the use of Java BigDecimal with RoundingMode.HALF_EVEN for absolute financial precision. Expose this capability as an internal microservice API to serve multiple business lines consistently. Stack: Quarkus."

---

## 1. User Scenarios & Testing

### User Story 1 - Stateless Interest Compounding Calculation (Priority: P1)
As an External Billing System or Credit Engine, I want to calculate interest on a loan contract by supplying the principal, rate, period, and index type so that I get the exact interest and total amount due.

* **Why this priority**: Core utility service that must remain completely stateless, serving as a unified calculation engine.
* **Independent Test**: Send a POST request to `/calculate/interest` with principal `1000.00`, annual rate `0.100000`, period `252` days, and index `PRE`. Verify that the calculated interest returns correct compound values.
* **Acceptance Scenarios**:
  1. **Given** a calculation request with valid positive parameters, **When** processed, **Then** the service computes the compounded rate and returns `200 OK` with the calculation results.

---

### User Story 2 - High Precision Banker's Rounding (Priority: P1)
As a Financial Auditor, I want all calculations to utilize Banker's Rounding (HALF_EVEN) so that there is no systemic upward rounding bias on bulk loan portfolio projections.

* **Why this priority**: Essential to maintain absolute regulatory financial precision and prevent cumulative rounding errors.
* **Independent Test**: Submit a calculation that yields a fractional cent of exactly `0.005`. Verify the system rounds down to the nearest even number (`0.00`), while `0.015` rounds up to `0.02`.
* **Acceptance Scenarios**:
  1. **Given** intermediate calculation steps, **When** computing compound interest, **Then** the service uses `BigDecimal` with `RoundingMode.HALF_EVEN` and scale `6` for rates, and scale `2` for final currency amounts.

---

### User Story 3 - Index-linked Interest Adjustment (Priority: P2)
As a Product Manager, I want to compute interest linked to economic indices (such as CDI or inflation-linked IPCA) so that variable-rate contracts are supported.

* **Why this priority**: Variable-rate lending contracts depend on historical or current index rate projections.
* **Independent Test**: Request a calculation with index `CDI` and rate `1.200000` (meaning 120% of CDI). The engine queries the index value, computes the variable rate, and returns the response.
* **Acceptance Scenarios**:
  1. **Given** an index selection `CDI` or `IPCA`, **When** calculating interest, **Then** the engine adjusts the base rate by the index factor before compounding.

---

## 2. Edge Cases

- **Zero or Negative Values**: A client sends a request with `principal = 0.00`, `period = 0`, or negative rates.
  * *Resolution*: Validate that principal and period are strictly non-negative. If rate is negative, it represents a negative interest rate (supported in some economic scenarios) but principal and period must be `>= 0`. Zero values return interest of `0.00`.
- **Large Period Compounding**: Calculating interest for a period of 10,000 days.
  * *Resolution*: Restrict the maximum period to 3650 days (10 years) in the API validator to prevent CPU starvation due to exponential compounding calculations.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Stateless Domain Service)**: The microservice MUST NOT persist any calculation records, operating purely as a request-response utility.
- **FR-002 (Financial Math Formulas)**: The engine MUST support compound interest calculation:
  $$TotalAmount = Principal \times (1 + DailyRate)^{PeriodInDays}$$
  $$Interest = TotalAmount - Principal$$
  where DailyRate is converted from AnnualRate based on a standard 252-day business year or 360-day calendar year.
- **FR-003 (Banker's Rounding)**: All intermediate calculations and final values MUST use Java `BigDecimal` with `RoundingMode.HALF_EVEN`.
- **FR-004 (Index Selection)**: The engine MUST support three index types:
  * `PRE` (Pre-fixed, standard annual rate compounding).
  * `CDI` (Variable interbank rate multiplier).
  * `IPCA` (Inflation-linked consumer price index adjuster).
- **FR-005 (Internal API Exposure)**: The capability MUST be exposed via REST endpoint `POST /calculate/interest`.

### Key Entities / DTOs

- **CalculationRequest**:
  * `principal`: BigDecimal (not null, min 0.01, scale 2).
  * `annualRate`: BigDecimal (not null, scale 6).
  * `periodInDays`: Integer (not null, min 1, max 3650).
  * `indexType`: Enum (`CDI`, `IPCA`, `PRE`).
  * `indexMultiplier`: BigDecimal (scale 4, optional, defaults to 1.0000).

- **CalculationResponse**:
  * `principal`: BigDecimal (scale 2).
  * `interest`: BigDecimal (scale 2).
  * `totalAmount`: BigDecimal (scale 2).
  * `effectiveDailyRate`: BigDecimal (scale 8).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Compounded outputs match exact banker's rounded mathematical results to 2 decimal places.
- **SC-002**: Average REST endpoint response latency is under 15ms under a load of 500 concurrent calculation calls per second.
- **SC-003**: The calculation returns mathematically correct zero interest when rate or period is zero.
