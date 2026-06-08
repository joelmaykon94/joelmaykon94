# Feature Specification: Fund Identification & Deadlines

**Feature Branch**: `fund-identification-deadlines`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Fund Identification & Deadlines' specification. Implement the 'Originating Department' field with a 3-character type-ahead search integrating with the 'Global Entity Registry (GER)' legacy database, pinning 'Wealth Management Division (WMD)', 'Global Asset Management (GAM)', and 'Fund Structuring Unit (FSU)' as top favorites. Implement the deadline logic: 'Expected Launch Date' is mandatory and must be a future date unless the 'No Forecast' checkbox is explicitly selected. 'Duration Term' defaults to 'Indeterminate'; if changed to 'Determinate', it conditionally requires a future 'End Date'. Stack: Quarkus, RESTEasy."

---

## 1. User Scenarios & Testing

### User Story 1 - Type-Ahead Department Search with Pinned Favorites (Priority: P1)
As a Fund Creator, I want to search for my originating department using a 3-character type-ahead query so that the field is populated from the Global Entity Registry, prioritizing our division favorites.

* **Why this priority**: Core form-filling utility. Ensures that the three most common departments are always accessible at the top of the search results.
* **Independent Test**: Call GET `/api/v1/departments/search?query=glo`. Verify the response returns at least 3 characters query results, pinning "Global Asset Management (GAM)" as the first result.
* **Acceptance Scenarios**:
  1. **Given** a department query, **When** the query length is less than 3 characters, **Then** the API returns `400 Bad Request`.
  2. **Given** a valid query, **When** results are retrieved from the legacy registry, **Then** matching entries for "Wealth Management Division (WMD)", "Global Asset Management (GAM)", and "Fund Structuring Unit (FSU)" are pinned to the top of the returned list.

---

### User Story 2 - Expected Launch Date Mutex Validation (Priority: P1)
As a Compliance Officer, I want the system to require a future expected launch date unless "No Forecast" is checked, so that we have accurate schedules or explicit flags for undetermined funds.

* **Why this priority**: Required for scheduling compliance reports and operational workflows.
* **Independent Test**: Submit a registration payload with `noForecast = false` and no expected launch date. Verify `400 Bad Request`. Repeat with a future launch date, verify `200 OK`.
* **Acceptance Scenarios**:
  1. **Given** a fund submission with `noForecast = false`, **When** the `expectedLaunchDate` is empty or in the past, **Then** validation fails.
  2. **Given** a fund submission with `noForecast = true`, **When** an `expectedLaunchDate` is supplied, **Then** validation fails (the field must be empty).

---

### User Story 3 - Duration Term and Conditional End Date (Priority: P2)
As a Fund Creator, I want the duration term to default to "Indeterminate", but if I change it to "Determinate", it must require a future "End Date" that is after the launch date.

* **Why this priority**: Necessary to enforce data integrity for funds with a fixed lifespan.
* **Independent Test**: Submit a payload with `durationTerm = DETERMINATE` and no `endDate`. Verify `400 Bad Request`. Submit with `endDate` before `expectedLaunchDate`, verify `400 Bad Request`.
* **Acceptance Scenarios**:
  1. **Given** a fund submission, **When** `durationTerm` is omitted, **Then** the system defaults the value to `INDETERMINATE` and `endDate` is not required.
  2. **Given** a fund submission with `durationTerm = DETERMINATE`, **When** `endDate` is empty or is not after the `expectedLaunchDate` (if present), **Then** validation fails.

---

## 2. Edge Cases

- **Launch Date in the Past Due to Timezone Offset**: A user submits a date that is today in their local timezone but yesterday in the server's timezone.
  * *Resolution*: Define launch date boundaries based on UTC midnight, validating that `expectedLaunchDate` is equal to or after the server's current date.
- **Null Launch Date and Determinate Term**: The user checks "No Forecast" (leaving launch date null) but sets `durationTerm = DETERMINATE`.
  * *Resolution*: If `expectedLaunchDate` is null and `durationTerm = DETERMINATE`, the `endDate` must still be a future date (`endDate.isAfter(LocalDate.now())`).

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Type-Ahead Constraint)**: The endpoint `/api/v1/departments/search` MUST enforce a minimum query parameter length of 3 characters.
- **FR-002 (Pinned Favorites)**: The type-ahead search MUST prioritize and sort these three entries to the top of any matching payload:
  * "Wealth Management Division (WMD)"
  * "Global Asset Management (GAM)"
  * "Fund Structuring Unit (FSU)"
- **FR-003 (Launch Date Validation)**: If `noForecast` is false, `expectedLaunchDate` is MANDATORY and MUST be a date strictly in the future.
- **FR-004 (No Forecast Mutex)**: If `noForecast` is true, the `expectedLaunchDate` MUST be null.
- **FR-005 (Duration Term Default)**: The field `durationTerm` MUST default to `INDETERMINATE`.
- **FR-006 (Conditional End Date)**: If `durationTerm` is `DETERMINATE`, the field `endDate` is MANDATORY and MUST be a future date after `expectedLaunchDate` (if launch date is set).
- **FR-007 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **FundIdentification**:
  * `originatingDepartment`: String (not null).
  * `expectedLaunchDate`: LocalDate (nullable).
  * `noForecast`: Boolean.
  * `durationTerm`: Enum (`INDETERMINATE`, `DETERMINATE`).
  * `endDate`: LocalDate (nullable).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Pinned departments always appear as the first three records in type-ahead search responses if they match the query characters.
- **SC-002**: Rejection rate is 100% when submitting a determinate duration term without a valid future end date.
- **SC-003**: The API returns clean validation messages distinguishing between launch date violations and end date violations.
