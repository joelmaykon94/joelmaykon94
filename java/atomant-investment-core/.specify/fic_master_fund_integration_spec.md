# Feature Specification: FIC Master Fund Integration

**Feature Branch**: `fic-master-fund-integration`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'FIC Master Fund Integration' specification. If a user selects 'Internal Master', the system MUST search the legacy database using an Anti-Corruption Layer (ACL). Support three search modes: by legacy code (requires 4 digits, zero-padded), by CNPJ (standard mask), or by Name. Implement exact error mappings (e.g., 'Legacy code not found in legacy registry'). On success, auto-fill the 'Master Fund' field in the format 'Legacy Code - Fantasy Name' and lock it for editing. If 'External Master' or 'New Internal Master' is selected, bypass the search and enable manual input. Stack: Quarkus REST Client."

---

## 1. User Scenarios & Testing

### User Story 1 - Search Internal Master by Legacy Code (Priority: P1)
As a Fund Creator, I want to query an internal Master Fund using its legacy code so that the system auto-populates its metadata and guarantees consistency with the legacy registry.

* **Why this priority**: Core integration feature required for all internal feeder funds.
* **Independent Test**: Select "Internal Master", query code "78". Verify the outgoing client request pads it to "0078", finds the fund, returns "0078 - Master Fixed Income", and locks the Master Fund input.
* **Acceptance Scenarios**:
  1. **Given** a feeder fund configuration step, **When** the user selects "Internal Master" and queries legacy code `78`, **Then** the request is zero-padded to `0078`, sent to the legacy client, and returns the unified master info.
  2. **Given** a found master fund, **When** the response is mapped, **Then** the "Master Fund" text input is auto-filled with `0078 - Master Fixed Income` and marked as read-only.

---

### User Story 2 - Search Internal Master by CNPJ (Priority: P1)
As a Fund Creator, I want to query the legacy database using the Master Fund's CNPJ so that I can link it to my feeder fund.

* **Why this priority**: Alternative search mechanism necessary when the internal legacy code is unknown.
* **Independent Test**: Search using CNPJ `12.345.678/0001-90`. Verify the system sanitizes the input to `12345678000190`, finds it in the legacy database, and auto-fills `0089 - Legacy Growth Fund` in the text field.
* **Acceptance Scenarios**:
  1. **Given** a CNPJ search selection, **When** the user enters a formatted CNPJ, **Then** the Anti-Corruption Layer (ACL) strips formatting characters, performs the query, and maps the result.

---

### User Story 3 - Map Legacy Integration Errors (Priority: P1)
As a Compliance Officer, I want the system to output friendly and descriptive error messages when a legacy search fails so that I know exactly why the search failed.

* **Why this priority**: Legacy systems return cryptic codes (e.g., `ERR_404_SIG`); these must be sanitized before displaying to the user.
* **Independent Test**: Query a non-existent legacy code `9999`. Verify the system returns `404 Not Found` with a clear message: "Legacy code not found in legacy registry".
* **Acceptance Scenarios**:
  1. **Given** a query that results in a legacy missing error, **When** mapped by the ACL, **Then** the API returns a structured JSON payload: `{"error": "Legacy code not found in legacy registry"}`.
  2. **Given** an unreachable legacy system, **When** the REST Client times out, **Then** the system returns `503 Service Unavailable` with message "Legacy core registry is temporarily offline".

---

### User Story 4 - Bypass Legacy Search (Priority: P2)
As a Fund Creator, I want to bypass legacy queries when selecting an external master or creating a new internal master so that I can type in the name manually.

* **Why this priority**: Required for funds whose masters do not exist in the legacy registry yet.
* **Independent Test**: Select "External Master". Verify the search button is disabled, the Master Fund field is editable, and no outbound legacy API calls are dispatched.
* **Acceptance Scenarios**:
  1. **Given** a feeder fund configuration, **When** the user selects "External Master" or "New Internal Master", **Then** the search criteria inputs are hidden, and the Master Fund field is set to editable.

---

## 2. Edge Cases

- **Legacy Code Length Validation**: Entering a 5-digit code or negative values.
  * *Resolution*: Validate in the API layer that the legacy code is a non-negative integer of maximum 4 digits. Any value outside this bounds must be rejected with `400 Bad Request` before calling the legacy system.
- **Multiple Matches on Name Search**: Querying by name yields multiple entries.
  * *Resolution*: The legacy integration must support returning a list of matching funds. The user can select the desired fund from a dropdown selector. Once selected, the field format `[Code] - [Fantasy Name]` is applied and locked.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Anti-Corruption Layer)**: The system MUST isolate legacy data schemas inside a dedicated translation component (`LegacyMasterFundACL`), returning standard domain objects.
- **FR-002 (Search Protocol)**: The system MUST support querying legacy registry via three modes:
  * **Legacy Code**: Padded to 4 digits (e.g. `12` -> `0012`).
  * **CNPJ**: Sanitized to digits only.
  * **Name**: String query.
- **FR-003 (Auto-fill Formatting)**: On a successful query, the backend MUST format the target master representation as: `[Legacy Code] - [Fantasy Name]`.
- **FR-004 (Form Locking)**: The UI and API contract MUST lock the `masterFund` selection once resolved, blocking manual changes to it unless the master type is switched.
- **FR-005 (Bypass and Manual Input)**: The system MUST allow free-text input and bypass legacy search calls if `masterFundType` is `EXTERNAL_MASTER` or `NEW_INTERNAL_MASTER`.

### Key Entities

- **LegacyMasterFund**:
  * `legacyCode`: String (4 characters, numeric, zero-padded).
  * `cnpj`: String (14 numeric characters).
  * `fantasyName`: String.
  * `corporateName`: String.
  * `status`: String (ACTIVE, INACTIVE).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Non-numeric or invalid code/CNPJ inputs are blocked at the validation layer without sending requests to the legacy endpoint.
- **SC-002**: Auto-fill text strictly adheres to the schema `[4-digit Legacy Code] - [Fantasy Name]`.
- **SC-003**: Incomplete search attempts return specific error messages rather than raw stack traces.
