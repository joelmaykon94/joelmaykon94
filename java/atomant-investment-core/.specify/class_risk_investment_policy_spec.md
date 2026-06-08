# Feature Specification: Class Risk & Investment Policy

**Feature Branch**: `class-risk-investment-policy`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Class Risk & Investment Policy' specification. Define the 'Type of Management' logic: 'Active Referenced' requires both 'Benchmark' (e.g., SOFR, US CPI, S&P 500) and '% of Benchmark', whereas 'Passive' only requires the 'Benchmark'. Implement the 'Global Fund Classification' field dynamically fetching from the system validation list, prohibiting custom 'Others' entries to enforce taxonomy standardization (based on international standards like UCITS or SFDR). Add conditional fields for 'Redemption Barrier' and 'Private Credit'. Default 'ESG Class' to 'Not Applicable'. Stack: Quarkus, Hibernate Panache."

---

## 1. User Scenarios & Testing

### User Story 1 - Type of Management Limits Validation (Priority: P1)
As a Portfolio Analyst, I want the system to validate benchmark requirements depending on the selected Type of Management so that referencing rules are strictly enforced.

* **Why this priority**: Core regulatory business rule. Guarantees that referenced index allocations are fully specified.
* **Independent Test**: Submit a class with `managementType = ACTIVE_REFERENCED` and no `% of Benchmark`. Verify the system returns `400 Bad Request`. Resubmit with `percentOfBenchmark = 1.100000`, verify `200 OK`.
* **Acceptance Scenarios**:
  1. **Given** a fund class with `managementType = ACTIVE_REFERENCED`, **When** submitted, **Then** both `benchmark` and `percentOfBenchmark` are mandatory.
  2. **Given** a fund class with `managementType = PASSIVE`, **When** submitted, **Then** `benchmark` is mandatory and `percentOfBenchmark` must be empty.

---

### User Story 2 - Taxonomy Standardized Classification (Priority: P1)
As a Compliance Inspector, I want the fund classification to match only predefined international taxonomy values (UCITS, SFDR) to prevent the entry of non-compliant custom descriptions.

* **Why this priority**: Standardization. Enforces that classification fields align strictly with European and global ESG/investment definitions, avoiding custom "Others" tags that bypass reporting.
* **Independent Test**: Submit a payload with `globalClassification = "Others"`. Verify the REST layer blocks the serialization yielding `400 Bad Request`. Submit `SFDR_ARTICLE_8`, verify success.
* **Acceptance Scenarios**:
  1. **Given** a global fund classification input, **When** it does not match one of the predefined system enum options, **Then** validation fails.

---

### User Story 3 - Conditional Redemption Barrier & Private Credit Allocation (Priority: P2)
As a Risk Officer, I want the system to require maximum limits when redemption barriers or private credit investments are enabled, to monitor liquidity risks.

* **Why this priority**: Required for risk calculation and asset concentration limits.
* **Independent Test**: Toggle private credit active. Submit with empty credit max percentage. Verify validation fails.
* **Acceptance Scenarios**:
  1. **Given** `hasRedemptionBarrier` is true, **When** submitted, **Then** `redemptionBarrierPercentage` is mandatory.
  2. **Given** `hasPrivateCredit` is true, **When** submitted, **Then** `privateCreditMaxPercentage` is mandatory.

---

### User Story 4 - ESG Class Defaults (Priority: P1)
As a Fund Creator, I want the ESG Class to default to "Not Applicable" when configuring a new share class to ensure base compliance profiles are set.

* **Why this priority**: Safe default configuration value. Prevents mislabeling of green assets.
* **Independent Test**: Create a class without setting the ESG field. Verify the persisted record has `esgClass = NOT_APPLICABLE`.
* **Acceptance Scenarios**:
  1. **Given** an omitted ESG category field during new class setup, **When** saved, **Then** the value is persisted as `NOT_APPLICABLE`.

---

## 2. Edge Cases

- **Benchmark and Zero Percentages**: A user selects `ACTIVE_REFERENCED` and enters `percentOfBenchmark = 0.000000`.
  * *Resolution*: Validate that `percentOfBenchmark` is strictly positive (`> 0.000000`) when `ACTIVE_REFERENCED` is chosen.
- **Redemption Barrier Ranges**: Entering a redemption barrier percentage exceeding 100%.
  * *Resolution*: Enforce that the redemption barrier percentage is within the bounds of `0.01%` to `100.00%` (`0.0001` to `1.0000`).

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Active Referenced Rules)**: If `managementType` is `ACTIVE_REFERENCED`, the fields `benchmark` and `percentOfBenchmark` MUST be provided.
- **FR-002 (Passive Rules)**: If `managementType` is `PASSIVE`, the field `benchmark` MUST be provided, and `percentOfBenchmark` MUST be null.
- **FR-003 (Standardized Taxonomy)**: The `globalClassification` field MUST strictly map to the standardized system validation list:
  * `UCITS_COMPLIANT`
  * `SFDR_ARTICLE_6`
  * `SFDR_ARTICLE_8`
  * `SFDR_ARTICLE_9`
  Custom inputs (such as "Others") are strictly prohibited.
- **FR-004 (Conditional Barrier)**: If `hasRedemptionBarrier` is true, `redemptionBarrierPercentage` is MANDATORY and must be between `0.0001` and `1.0000`.
- **FR-005 (Conditional Private Credit)**: If `hasPrivateCredit` is true, `privateCreditMaxPercentage` is MANDATORY and must be between `0.0001` and `1.0000`.
- **FR-006 (ESG Class Default)**: The field `esgClass` MUST default to `NOT_APPLICABLE`.
- **FR-007 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **ClassRiskInvestmentPolicy**:
  * `managementType`: Enum (`ACTIVE_REFERENCED`, `PASSIVE`, `ACTIVE_UNREFERENCED`).
  * `benchmark`: String (max 100 chars, nullable).
  * `percentOfBenchmark`: BigDecimal (scale 6, nullable).
  * `globalClassification`: Enum (`UCITS_COMPLIANT`, `SFDR_ARTICLE_6`, `SFDR_ARTICLE_8`, `SFDR_ARTICLE_9`).
  * `hasRedemptionBarrier`: Boolean.
  * `redemptionBarrierPercentage`: BigDecimal (scale 4, nullable).
  * `hasPrivateCredit`: Boolean.
  * `privateCreditMaxPercentage`: BigDecimal (scale 4, nullable).
  * `esgClass`: Enum (`NOT_APPLICABLE`, `ARTICLE_8`, `ARTICLE_9`).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: API returns `400 Bad Request` if `percentOfBenchmark` is missing for `ACTIVE_REFERENCED` management types.
- **SC-002**: Standardized enums prevent any non-standard class taxonomy values from committing to the database.
- **SC-003**: The database defaults ESG fields to `NOT_APPLICABLE` for new classes.
