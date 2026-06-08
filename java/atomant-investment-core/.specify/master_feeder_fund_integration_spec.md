# Feature Specification: Master-Feeder Fund Integration

**Feature Branch**: `master-feeder-fund-integration`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Master-Feeder Fund Integration' specification. If a user selects 'Internal Master', the system MUST search the 'Legacy Fund Master Database (LFMD)' using an Anti-Corruption Layer (ACL). Support three search modes: by Global Registry Code (requires 4 digits, zero-padded), by LEI Code/Tax ID, or by Fund Name. Implement exact error mappings (e.g., 'Registry Code not found in LFMD'). On success, auto-fill the 'Master Fund' field in the format 'CODE - Fantasy Name' and lock it. If 'External Master' or 'New Internal Master' is selected, bypass the search and enable manual input. Stack: Quarkus REST Client."

---

## 1. User Scenarios & Testing

### User Story 1 - Search Internal Master by Global Registry Code (Priority: P1)
As a Fund Creator, I want to query an internal Master Fund using its Global Registry Code so that the system auto-populates its metadata and guarantees consistency with the legacy repository.

* **Why this priority**: Core integration feature required for all internal feeder funds.
* **Independent Test**: Select "Internal Master", query code "78". Verify the outgoing client request pads it to "0078", finds the fund, returns "0078 - Master Fixed Income", and locks the Master Fund input.
* **Acceptance Scenarios**:
  1. **Given** a feeder fund configuration step, **When** the user selects "Internal Master" and queries registry code `78`, **Then** the request is zero-padded to `0078`, sent to the LFMD client, and returns the unified master info.
  2. **Given** a found master fund, **When** the response is mapped, **Then** the "Master Fund" text input is auto-filled with `0078 - Master Fixed Income` and marked as read-only.

---

### User Story 2 - Search Internal Master by LEI Code/Tax ID (Priority: P1)
As a Fund Creator, I want to query the legacy database (LFMD) using the Master Fund's LEI Code or Tax ID so that I can link it to my feeder fund.

* **Why this priority**: Alternative search mechanism necessary when the internal registry code is unknown.
* **Independent Test**: Search using LEI `549300OU5NHM2A197412`. Verify the system sanitizes the input, finds it in the LFMD, and auto-fills `0089 - Legacy Growth Fund` in the text field.
* **Acceptance Scenarios**:
  1. **Given** an LEI search selection, **When** the user enters a valid 20-character LEI, **Then** the Anti-Corruption Layer (ACL) performs the query and maps the result.

---

### User Story 3 - Map Legacy LFMD Integration Errors (Priority: P1)
As a Compliance Officer, I want the system to output friendly and descriptive error messages when an LFMD legacy search fails so that I know exactly why the search failed.

* **Why this priority**: Legacy central registry errors must be parsed and returned clearly to the client.
* **Independent Test**: Query a non-existent registry code `9999`. Verify the system returns `404 Not Found` with a clear message: "Registry Code not found in LFMD".
* **Acceptance Scenarios**:
  1. **Given** a query that results in a legacy missing error, **When** mapped by the ACL, **Then** the API returns a structured JSON payload: `{"error": "Registry Code not found in LFMD"}`.
  2. **Given** an unreachable legacy system, **When** the REST Client times out, **Then** the system returns `503 Service Unavailable` with message "Legacy Fund Master Database is temporarily offline".

---

### User Story 4 - Bypass Legacy Search (Priority: P2)
As a Fund Creator, I want to bypass legacy queries when selecting an external master or creating a new internal master so that I can type in the name manually.

* **Why this priority**: Required for funds whose masters do not exist in the legacy registry yet.
* **Independent Test**: Select "External Master". Verify the search button is disabled, the Master Fund field is editable, and no outbound legacy API calls are dispatched.
* **Acceptance Scenarios**:
  1. **Given** a feeder fund configuration, **When** the user selects "External Master" or "New Internal Master", **Then** the search criteria inputs are hidden, and the Master Fund field is set to editable.

---

## 2. Edge Cases

- **Registry Code Length Validation**: Entering a 5-digit code or negative values.
  * *Resolution*: Validate in the API layer that the registry code is a non-negative integer of maximum 4 digits. Any value outside this bounds must be rejected with `400 Bad Request` before calling the legacy system.
- **Multiple Matches on Name Search**: Querying by name yields multiple entries.
  * *Resolution*: The legacy integration must support returning a list of matching funds. The user can select the desired fund from a dropdown selector. Once selected, the field format `[Code] - [Fantasy Name]` is applied and locked.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Anti-Corruption Layer)**: The system MUST isolate legacy LFMD data schemas inside a dedicated translation component (`LegacyMasterFundACL`), returning standard domain objects.
- **FR-002 (Search Protocol)**: The system MUST support querying legacy registry via three modes:
  * **Global Registry Code**: Padded to 4 digits (e.g. `12` -> `0012`).
  * **LEI Code / Tax ID**: Validated for format.
  * **Fund Name**: String query.
- **FR-003 (Auto-fill Formatting)**: On a successful query, the backend MUST format the target master representation as: `[Registry Code] - [Fantasy Name]`.
- **FR-004 (Form Locking)**: The UI and API contract MUST lock the `masterFund` selection once resolved, blocking manual changes to it unless the master type is switched.
- **FR-005 (Bypass and Manual Input)**: The system MUST allow free-text input and bypass legacy search calls if `masterFundType` is `EXTERNAL_MASTER` or `NEW_INTERNAL_MASTER`.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **LegacyMasterFund**:
  * `registryCode`: String (4 characters, numeric, zero-padded).
  * `leiCode`: String (exactly 20 chars).
  * `fantasyName`: String.
  * `corporateName`: String.
  * `status`: String (ACTIVE, INACTIVE).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Non-numeric or invalid code/LEI inputs are blocked at the validation layer without sending requests to the LFMD endpoint.
- **SC-002**: Auto-fill text strictly adheres to the schema `[4-digit Registry Code] - [Fantasy Name]`.
- **SC-003**: Incomplete search attempts return specific error messages rather than raw stack traces.
