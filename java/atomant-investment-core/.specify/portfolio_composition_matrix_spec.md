# Feature Specification: Portfolio Composition Matrix

**Feature Branch**: `portfolio-composition-matrix`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Portfolio Composition Matrix' specification. Define domain models for four portfolio templates: Fixed Income, Equities, Multimarket, and FX. Map the hierarchical structure: Portfolios contain Groups (Accordion UI), and Groups contain Assets. Each asset requires '% Min/PL' and '% Max/PL' inputs. Each group requires a single '% Max Modality' field. Crucial Business Rule: Do NOT auto-sum percentages to block at 100%, as these are theoretical operational limits. Allow dynamic addition/removal of custom asset rows while protecting default system rows from deletion. Stack: Quarkus, Hibernate Panache."

---

## 1. User Scenarios & Testing

### User Story 1 - Select Portfolio Template (Priority: P1)
As a Fund Creator, I want to select a portfolio template (Fixed Income, Equities, Multimarket, or FX) when setting up my fund so that the default structure of groups and assets is loaded automatically.

* **Why this priority**: Core foundation. Saves user effort by loading pre-defined compliance categories based on the fund classification.
* **Independent Test**: Create a composition, select template `FIXED_INCOME`. Verify the backend returns a tree structure containing groups (e.g. "Public Bonds", "Private Credits") and default assets (e.g. "Sovereign Bills") loaded.
* **Acceptance Scenarios**:
  1. **Given** a new portfolio configuration page, **When** the template is chosen, **Then** the default system rows are returned in the response payload.

---

### User Story 2 - Configure Operational Limits (Priority: P1)
As a Portfolio Manager, I want to define `% Min/PL` and `% Max/PL` for each asset, and `% Max Modality` for each group, to set theoretical allocation boundaries.

* **Why this priority**: Operational limits dictate compliance verification, and must bypass the 100% sum limit since they represent independent maximum limits.
* **Independent Test**: Submit a composition where the sum of `% Max/PL` across assets equals 250%. Verify the payload validates and persists successfully.
* **Acceptance Scenarios**:
  1. **Given** an asset limit configuration, **When** the user inputs `% Min/PL = 20%` and `% Max/PL = 80%`, **Then** it passes validation since `% Min/PL <= % Max/PL`.
  2. **Given** a group submission, **When** the sum of all `% Max/PL` limits does not equal 100%, **Then** the system MUST NOT reject the request (auto-sum checking is bypassed).

---

### User Story 3 - Add/Remove Custom Asset Rows (Priority: P2)
As a Fund Creator, I want to dynamically add custom asset rows to any portfolio group and remove them if needed, so that I can accommodate unique fund setups.

* **Why this priority**: Customization is necessary for specialized investments that fall outside typical system templates.
* **Independent Test**: Append a custom row "My Custom Asset" to a group, populate its limits, then delete it. Verify it is removed from the composition structure.
* **Acceptance Scenarios**:
  1. **Given** a portfolio composition, **When** the user calls the API to add a custom asset, **Then** a new row is appended with the `systemDefault` flag set to `false`.
  2. **Given** a custom asset row with `systemDefault = false`, **When** the user deletes it, **Then** it is successfully removed.

---

### User Story 4 - Protect Default System Rows (Priority: P1)
As a Compliance Inspector, I want the system to block the deletion of default template rows so that the integrity of the base template is protected.

* **Why this priority**: Core security validation. If default regulatory assets are deleted, automated compliance checks will fail.
* **Independent Test**: Send a delete request for a default row (`systemDefault = true`). Verify the API returns `400 Bad Request` with message "System default rows cannot be deleted."
* **Acceptance Scenarios**:
  1. **Given** a system default row, **When** a user attempts to delete it, **Then** the deletion fails and database records remain unchanged.

---

## 2. Edge Cases

- **Validation Range Conflict**: A user inputs `% Min/PL = 50%` and `% Max/PL = 40%`.
  * *Resolution*: Validate that `% Min/PL <= % Max/PL` for every asset row. Reject invalid inputs with `400 Bad Request`.
- **Negative Percentages**: A user enters negative limits.
  * *Resolution*: Restrict all percentage fields to non-negative values (`>= 0.0000`).

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Template Enums)**: The system MUST support four portfolio templates: `FIXED_INCOME`, `EQUITIES`, `MULTIMARKET`, `FX`.
- **FR-002 (Hierarchical Domain Structure)**: The persistence schema MUST map a 3-tier hierarchy: Portfolios contain Groups, and Groups contain Assets.
- **FR-003 (Min/Max Asset Limits)**: Each Asset row MUST support `% Min/PL` and `% Max/PL` boundaries (modeled as `BigDecimal` with scale 4, e.g. `0.0500`).
- **FR-004 (Max Modality Limit)**: Each Asset Group MUST require a single `% Max Modality` limit.
- **FR-005 (Bypass Sum Validation)**: The validation engine MUST NOT enforce that the sum of percentages equals 100%.
- **FR-006 (Default Protection)**: Any asset row marked with `systemDefault = true` MUST block deletion requests.
- **FR-007 (Dynamic Rows)**: Assets marked with `systemDefault = false` MUST allow dynamic deletion and insertion.

### Key Entities

- **PortfolioComposition**:
  * `id`: Long (Primary Key).
  * `template`: Enum (`FIXED_INCOME`, `EQUITIES`, `MULTIMARKET`, `FX`).
  * `groups`: List of `AssetGroup`.

- **AssetGroup**:
  * `id`: Long (Primary Key).
  * `name`: String.
  * `maxModality`: BigDecimal (scale 4).
  * `assets`: List of `AssetRow`.

- **AssetRow**:
  * `id`: Long (Primary Key).
  * `name`: String.
  * `minPl`: BigDecimal (scale 4).
  * `maxPl`: BigDecimal (scale 4).
  * `systemDefault`: Boolean (Flags immutable template assets).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Custom rows can be deleted, while default template rows remain protected.
- **SC-002**: A composition with total allocations summing to any value (e.g. 350%) compiles and persists successfully without errors.
- **SC-003**: The API layer rejects configurations where `% Min/PL` > `% Max/PL` with a clear field validation error.
