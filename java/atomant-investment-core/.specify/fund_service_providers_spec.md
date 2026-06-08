# Feature Specification: Fund Service Providers

**Feature Branch**: `fund-service-providers`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Fund Service Providers' specification. Implement conditional auto-filling: If the 'Originating Department' is 'WMD', auto-fill 'Manager' as 'JPM Wealth Distribution' and lock the institutional Tax ID (e.g., LEI Code) field. For 'Custodian', provide a predefined list of international custodians (e.g., J.P. Morgan, BNY Mellon, State Street, Citi) that auto-fills their respective fixed LEI Codes, while allowing custom manual entries for unlisted custodians. Include a 'Co-Management' toggle that conditionally requires the co-manager name (defaulting to 'JPM Life & Retirement') and ID. Stack: Quarkus."

---

## 1. User Scenarios & Testing

### User Story 1 - Conditional Manager Auto-filling (Priority: P1)
As a Fund Creator, I want the system to automatically configure and lock the manager and its Legal Entity Identifier (LEI) when the originating department is set to "WMD" (Wealth Management Division) to prevent configuration mistakes.

* **Why this priority**: Business efficiency and validation gate that guarantees WMD funds are assigned to the correct manager division.
* **Independent Test**: Create a fund with `originatingDepartment = WMD`. Verify that `managerName` is automatically set to "JPM Wealth Distribution" and the `managerLei` field is populated and locked.
* **Acceptance Scenarios**:
  1. **Given** a fund registration where `originatingDepartment` is `WMD`, **When** the service providers step is loaded, **Then** `managerName` is set to "JPM Wealth Distribution", the manager LEI is set to a fixed ID, and the field is marked read-only.
  2. **Given** a department change from `WMD` to `GAM`, **When** updated, **Then** the manager fields are unlocked for manual input.

---

### User Story 2 - Custodian Predefined List Lookup (Priority: P1)
As a Fund Creator, I want to select a custodian from a predefined list of international custodians so that the custodian's official LEI code is automatically populated.

* **Why this priority**: Prevents manual entry errors for common global financial institutions.
* **Independent Test**: Select "BNY Mellon" from the custodian dropdown. Verify that the custodian LEI automatically populates with BNY Mellon's official LEI (`HPFR58Z636SO26ZQAA67`).
* **Acceptance Scenarios**:
  1. **Given** a custodian dropdown selection of "J.P. Morgan", "BNY Mellon", "State Street", or "Citi", **When** selected, **Then** the corresponding unique 20-character LEI is filled.

---

### User Story 3 - Custom Custodian Input Bypass (Priority: P2)
As a Fund Creator, I want to enter a custom custodian name not in the default list so that I can configure specialized or local custodians.

* **Why this priority**: Flexibility requirement. Predefined lists cannot cover 100% of global custodians.
* **Independent Test**: Enter custom custodian "Local Trust Bank", and manually input LEI `12345678901234567890`. Verify it passes validation. Enter a 15-character LEI, verify `400 Bad Request`.
* **Acceptance Scenarios**:
  1. **Given** a custodian input, **When** the user types a custom name not in the list, **Then** the custodian LEI field is unlocked for manual typing.
  2. **Given** a manual LEI input, **When** the user submits the form, **Then** the system validates that it is exactly 20 alphanumeric characters (ISO 17442 format).

---

### User Story 4 - Co-Management Conditional Requirements (Priority: P1)
As a Fund Creator, I want to enable a Co-Management toggle so that I can configure a co-manager name (which defaults to "JPM Life & Retirement") and their corresponding LEI code.

* **Why this priority**: Structural setup required for joint-managed fund assets.
* **Independent Test**: Toggle co-management to active. Submit with empty co-manager LEI, verify `400 Bad Request`. Submit with co-manager LEI, verify `200 OK`.
* **Acceptance Scenarios**:
  1. **Given** `hasCoManagement` is true, **When** submitted, **Then** `coManagerName` defaults to "JPM Life & Retirement" if left blank, and `coManagerLei` is mandatory.
  2. **Given** `hasCoManagement` is false, **When** submitted, **Then** co-manager fields are ignored and set to null.

---

## 2. Edge Cases

- **ISO 17442 LEI Format Check digit**: LEI codes contain a checksum in the last two digits (ISO 7064 Mod 97-10).
  * *Resolution*: The validator must perform a standard check digit validation (mod 97) on all manually entered LEI codes to ensure they are valid.
- **Toggling Co-Management Off**: A user populates co-manager details, then toggles co-management off.
  * *Resolution*: The system must wipe all co-manager fields and set them to null in the database when saving with the toggle disabled.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (WMD Auto-fill)**: If `originatingDepartment` matches "WMD", the system MUST populate `managerName` with "JPM Wealth Distribution", set `managerLei` to `549300OU5NHM2A197412`, and lock the manager fields.
- **FR-002 (Predefined Custodians)**: The system MUST maintain a static mapping of international custodians and their LEI codes:
  * J.P. Morgan: `549300OU5NHM2A197412`
  * BNY Mellon: `HPFR58Z636SO26ZQAA67`
  * State Street: `549300T8G03S6S4R4K21`
  * Citi: `549300H04M6B93V5V391`
- **FR-003 (Custom Custodians)**: If the user inputs a custodian name not in the predefined list, the custodian LEI field MUST be editable.
- **FR-004 (LEI Format Validation)**: All manually entered LEI codes MUST be validated against the standard 20-character ISO 17442 pattern and mod 97 check digit.
- **FR-005 (Co-Management Validation)**: If `hasCoManagement` is true, the `coManagerLei` is mandatory. The `coManagerName` MUST default to "JPM Life & Retirement" if not provided by the user.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **FundServiceProviders**:
  * `managerName`: String (max 255 chars).
  * `managerLei`: String (exactly 20 chars).
  * `custodianName`: String (max 255 chars).
  * `custodianLei`: String (exactly 20 chars).
  * `hasCoManagement`: Boolean.
  * `coManagerName`: String (nullable).
  * `coManagerLei`: String (nullable).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: 100% of custom LEI entries failing the ISO 17442 checksum validation are rejected.
- **SC-002**: Selecting a predefined custodian updates the UI form model and populates the database with the correct mapped LEI.
- **SC-003**: Turning off the co-management toggle cleanses all co-manager data from the entity before persistence.
