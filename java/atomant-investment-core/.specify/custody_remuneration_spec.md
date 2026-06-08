# Feature Specification: Custody Remuneration

**Feature Branch**: `custody-remuneration`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Custody Remuneration' specification. Ensure absolute financial precision. The 'Maximum Custody Fee' must be a percentage stored with exactly 4 decimal places (0.0000 mask). Implement the 'Minimum Remuneration' logic: if present, it must require a global economic index (SOFR, EURIBOR, US CPI) and a monetary value with a strict currency mask (e.g., $ 0.00), capped at 999,999.99. Use Java BigDecimal with RoundingMode.HALF_EVEN for all persistence and business logic to prevent floating-point precision loss. Stack: Quarkus."

---

## 1. User Scenarios & Testing

### User Story 1 - Custody Fee Precision (Priority: P1)
As a Portfolio Analyst, I want the system to store the Maximum Custody Fee percentage with exactly 4 decimal places (e.g. `0.8500%`) so that we maintain precise rate records.

* **Why this priority**: Required to accurately store fractional percentage values typical of high-volume funds.
* **Independent Test**: Submit a class with `maxCustodyFee = 0.008525` (representing `0.8525%`). Verify the system saves it successfully. Submit a value with 5 decimal places of percentage, verify it rounds using Banker's Rounding to 4 decimal places.
* **Acceptance Scenarios**:
  1. **Given** a fund class creation form, **When** the custody fee is entered as `0.8500%`, **Then** the value is persisted in the database as `0.008500`.

---

### User Story 2 - Conditional Minimum Remuneration (Priority: P1)
As a Fund Creator, I want the system to conditionally require an economic index and a monetary value when minimum remuneration is selected, so that we have complete correction terms.

* **Why this priority**: Ensures that a correction index is always specified if a minimum amount is contracted.
* **Independent Test**: Toggle minimum remuneration active. Submit with empty economic index, verify `400 Bad Request`. Submit with index `SOFR` and amount `$ 1200.00`, verify `200 OK`.
* **Acceptance Scenarios**:
  1. **Given** `hasMinRemuneration` is true, **When** submitted, **Then** both `economicIndex` and `minRemunerationAmount` are mandatory.
  2. **Given** `hasMinRemuneration` is false, **When** submitted, **Then** `economicIndex` and `minRemunerationAmount` must be null in the database.

---

### User Story 3 - Maximum Remuneration Value Cap (Priority: P1)
As a Risk Officer, I want the system to reject minimum remuneration values exceeding $ 999,999.99 to prevent operational entry errors.

* **Why this priority**: Limits exposure to data entry bugs (e.g., accidentally typing too many zeros).
* **Independent Test**: Attempt to submit `minRemunerationAmount = 1000000.00` (one million). Verify the API rejects the request with `400 Bad Request` and message "Minimum remuneration amount cannot exceed $ 999,999.99."
* **Acceptance Scenarios**:
  1. **Given** a minimum remuneration value input, **When** the value exceeds `999999.99`, **Then** validation fails.

---

### User Story 4 - Banker's Rounding Arithmetic Policy (Priority: P1)
As a Financial Auditor, I want all calculations and database mappings to enforce Banker's Rounding (HALF_EVEN) to ensure compliance with international accounting practices.

* **Why this priority**: Prevents systematic upward bias on roundings, guaranteeing mathematical accuracy.
* **Independent Test**: Query calculated daily fee values. Verify that an intermediate fee result of `0.005` rounds to `0.00`, and `0.015` rounds to `0.02`.
* **Acceptance Scenarios**:
  1. **Given** daily fee computations, **When** executing divisions, **Then** `RoundingMode.HALF_EVEN` is applied with Java `BigDecimal`.

---

## 2. Edge Cases

- **Negative Amounts**: A user inputs `minRemunerationAmount = -50.00` or `maxCustodyFee = -0.0100`.
  * *Resolution*: Validate that all monetary and percentage rates are strictly non-negative (`>= 0`).
- **Index without Minimum Remuneration**: A user selects an economic index but disables the `hasMinRemuneration` toggle.
  * *Resolution*: Wipe index and amount values to null when `hasMinRemuneration` is set to false.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Fee Rate Scale)**: The `maxCustodyFee` field MUST support exactly 4 decimal places in percentage representation (stored as `BigDecimal` with scale 6, e.g. `0.008500`).
- **FR-002 (Conditional Validations)**: If `hasMinRemuneration` is true, the fields `economicIndex` and `minRemunerationAmount` are MANDATORY.
- **FR-003 (Allowed Indexes)**: The `economicIndex` MUST be selected from:
  * `SOFR`
  * `EURIBOR`
  * `US_CPI`
- **FR-004 (Monetary Value Cap)**: The `minRemunerationAmount` MUST be positive and capped at exactly `$ 999,999.99` (stored as `BigDecimal` with scale 2).
- **FR-005 (Banker's Rounding)**: The system MUST enforce the use of `BigDecimal` with `RoundingMode.HALF_EVEN` for all persistence mappings, calculations, and rounding steps.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **CustodyRemuneration**:
  * `maxCustodyFee`: BigDecimal (scale 6, not null).
  * `hasMinRemuneration`: Boolean (not null).
  * `minRemunerationAmount`: BigDecimal (scale 2, nullable, max 999999.99).
  * `economicIndex`: Enum (`SOFR`, `EURIBOR`, `US_CPI`, nullable).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Submitting values above the `$ 999,999.99` threshold results in rejection with a detailed validation message.
- **SC-002**: Database column types for `maxCustodyFee` are mapped with precision 8, scale 6.
- **SC-003**: Arithmetic calculations do not exhibit floating-point binary rounding errors (e.g. `0.1 + 0.2` yielding `0.30000000000000004`).
