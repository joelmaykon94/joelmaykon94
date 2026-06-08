# Feature Specification: Demand Management State & Navigation

**Feature Branch**: `demand-management-state-navigation`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Demand Management State & Navigation' specification. Enforce role-based access: the 'Formalization' endpoint must block unauthorized users even if accessed directly via URL. Implement a dual-save state mechanism: 'Save' (Draft mode, accepts partial data without enforcing mandatory fields) and 'Save and Proceed' (enforces all business validations before advancing). Define dynamic UI rules where selecting 'Multiple (N Classes)' automatically spawns exactly N distinct configuration tabs, requiring all to be filled. Stack: Quarkus, RESTEasy."

---

## 1. User Scenarios & Testing

### User Story 1 - Save Draft (Priority: P1)
As a Fund Creator, I want to save a partial fund registration draft (missing target date, name, or class config) so that I can resume editing the demand later without losing progress.

* **Why this priority**: Crucial for usability when fund details are unknown during early stages of creation.
* **Independent Test**: Start creation, insert only "Requestor Name", click "Save". Verify that the backend persists the record with `DRAFT` status and returns a successful response code.
* **Acceptance Scenarios**:
  1. **Given** a new fund registration form, **When** only partial fields are provided (e.g. `requestor="Alice"`, no fund name, no date) and "Save" is clicked, **Then** the system returns `201 Created` with state `DRAFT` and generates a `demandId`.
  2. **Given** an existing fund demand in `DRAFT` status, **When** some fields are updated and "Save" is clicked, **Then** changes are stored without enforcing validations, and state remains `DRAFT`.

---

### User Story 2 - Save and Proceed (Priority: P1)
As a Fund Creator, I want to validate and submit my fund demand so that it advances to the formalization phase.

* **Why this priority**: Required to transition a demand from a temporary draft to an official proposal.
* **Independent Test**: Provide all valid fields (including future launch date and class configs) and submit. Verify state changes to `PENDING_FORMALIZATION`.
* **Acceptance Scenarios**:
  1. **Given** a fund demand in `DRAFT` status, **When** the creator clicks "Save and Proceed" with missing mandatory fields (e.g., empty Fund Name), **Then** the system rejects the request with `400 Bad Request` yielding validation errors, and the state remains `DRAFT`.
  2. **Given** a fund demand in `DRAFT` status, **When** all validations pass and "Save and Proceed" is clicked, **Then** the system persists the data, transitions the state to `PENDING_FORMALIZATION`, and returns `200 OK`.

---

### User Story 3 - Formalize Demand with RBAC Enforcements (Priority: P1)
As an Authorized Administrator or Compliance Officer, I want to formalize a pending fund demand so that the fund is approved and finalized.

* **Why this priority**: Security gate ensuring only privileged users approve new fund creations, preventing direct URL access manipulation.
* **Independent Test**: Send a POST request to `/funds/{id}/formalize` with a JWT containing only `CUSTOMER` role, verify a `403 Forbidden` response. Send the same request with `ADMIN` role, verify `204 No Content` and status `FORMALIZED`.
* **Acceptance Scenarios**:
  1. **Given** a fund demand in `PENDING_FORMALIZATION` status, **When** an unauthorized user (missing role `ADMIN`) attempts to access POST `/funds/{id}/formalize`, **Then** the request is blocked yielding `403 Forbidden`.
  2. **Given** a fund demand in `PENDING_FORMALIZATION` status, **When** an authorized administrator (having role `ADMIN`) accesses POST `/funds/{id}/formalize`, **Then** the state transitions to `FORMALIZED` and returns `204 No Content`.

---

### User Story 4 - Dynamic N-Classes Tabs (Priority: P2)
As a Fund Creator, I want the UI/API to dynamically match my selection of multiple classes so that I am prompted to fill exactly N distinct configuration structures.

* **Why this priority**: Prevents mismatch between the chosen structure type and the detailed configurations sent to the backend.
* **Independent Test**: Select `MULTI_CLASS` structure and set target classes count to 3. Verify exactly 3 class tabs are created on the UI and that the API rejects any submission that does not contain exactly 3 valid class objects.
* **Acceptance Scenarios**:
  1. **Given** a fund demand configuration screen, **When** the user selects `MULTI_CLASS` and sets class count to 2, **Then** 2 distinct share class configurations are required.
  2. **Given** a submission payload, **When** `classStructureType = MULTI_CLASS` but the payload contains fewer or more configurations than specified, **Then** the system returns `400 Bad Request` with structured validation errors.

---

## 2. Edge Cases

- **Date Toggle Boundary**: What happens when the user fills in a future target date, then checks the "no forecast" box?
  * *Resolution*: Checking "no forecast" must clear and disable the target date. The API must reject requests where `noForecast` is true and a launch date is present.
- **Concurrent Submission**: What happens if an admin tries to formalize a demand that is still in `DRAFT` state?
  * *Resolution*: The API must validate the state transition path. Transition is only allowed: `DRAFT` -> `PENDING_FORMALIZATION` -> `FORMALIZED`. Direct transition from `DRAFT` to `FORMALIZED` must return `409 Conflict`.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (State Machine)**: The system MUST manage the lifecycle of a fund demand using the following states: `DRAFT`, `PENDING_FORMALIZATION`, `FORMALIZED`.
- **FR-002 (Draft Save)**: The system MUST allow saving a demand with partial parameters (any fields omitted except the `requestor` attribute) when state is `DRAFT`.
- **FR-003 (Validation Groups)**: The system MUST trigger JSR-380 validation rules only during "Save and Proceed" (e.g., checks for future launch dates, maximum custody fee limits, index constraints).
- **FR-004 (RBAC Security)**: The formalization endpoint `/funds/{id}/formalize` MUST be protected by Quarkus Security (`@RolesAllowed({"ADMIN"})`), blocking direct URL access from non-admin roles.
- **FR-005 (Dynamic Tabs)**: The UI and backend schema validation MUST enforce that the number of details in the `classes` list matches exactly the class structure specification.

### Key Entities

- **FundDemand**:
  * `id`: unique long identifier.
  * `status`: Enum (`DRAFT`, `PENDING_FORMALIZATION`, `FORMALIZED`).
  * `requestor`: string.
  * `originatingDepartment`: string.
  * `targetLaunchDate`: LocalDate (nullable).
  * `noForecast`: boolean.
  * `fundType`: Enum (`FIXED_INCOME`, `FEEDER_FUND`, etc.).
  * `classStructureType`: Enum (`SINGLE_CLASS`, `MULTI_CLASS`).
  * `classes`: List of `FundClass` configurations (constrained dynamically).

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Direct HTTP POST requests to `/funds/{id}/formalize` by non-admins must yield `403 Forbidden` 100% of the time.
- **SC-002**: Bypassing business validations must occur only when the draft endpoint is utilized, resulting in successful persistence of incomplete inputs.
- **SC-003**: Schema validates that $N$ configurations are present and complete when class counts are updated.
