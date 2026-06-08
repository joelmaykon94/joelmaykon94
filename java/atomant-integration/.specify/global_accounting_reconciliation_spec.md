# Feature Specification: Global Accounting Reconciliation

**Feature Branch**: `global-accounting-reconciliation`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Global Accounting Reconciliation' specification. Develop an administrative endpoint for querying the status of financial fee batches sent to the 'Enterprise ERP Ledger'. Implement an asynchronous batch job (ETL 2) that ingests reconciliation return files from the ERP, parses them, updates the internal calculated fees' status (e.g., Accepted/Rejected), and logs any discrepancies. This ensures full auditability for international compliance. Stack: Quarkus, Quartz Scheduler for batch triggering."

---

## 1. User Scenarios & Testing

### User Story 1 - Administrative Status Query (Priority: P1)
As an Audit Administrator, I want to query the status of a specific fee batch sent to the Enterprise ERP Ledger so that I can monitor compliance transmissions and check for delivery issues.

* **Why this priority**: Required for operational observability and auditing of outgoing accounting data.
* **Independent Test**: Send a GET request to `/api/v1/integration/batches/{batchId}`. Verify it returns `200 OK` with JSON fields showing state `SENT` or `ACCEPTED`, records count, and transmission timestamp.
* **Acceptance Scenarios**:
  1. **Given** a registered batch ID, **When** queried by an admin, **Then** the service returns the status and summary data.
  2. **Given** a non-existent batch ID, **When** queried, **Then** the API returns `404 Not Found`.

---

### User Story 2 - Asynchronous Ingestion of Reconciliation Returns (ETL 2) (Priority: P1)
As a System Operator, I want the reconciliation engine to run a nightly batch job that automatically imports return files from the Enterprise ERP Ledger so that manual processing is avoided.

* **Why this priority**: Automates the feedback loop of accounting entries.
* **Independent Test**: Setup Quartz to fire a trigger, place a mock reconciliation file in the target directory. Verify Quartz schedules and executes the job, parsing the file using Java NIO.
* **Acceptance Scenarios**:
  1. **Given** a configured Quartz cron trigger, **When** the scheduled time fires, **Then** the `EtlReconciliationJob` executes.
  2. **Given** a processing execution, **When** the file is successfully parsed, **Then** the system registers the file name in the processing log to block duplicate runs.

---

### User Story 3 - Update Fee Reconciliation Status (Priority: P1)
As an Accounting Auditor, I want the batch job to parse the status of each batch record and update our internal database records to `ACCEPTED` or `REJECTED` so that the ledger reflects accurate state.

* **Why this priority**: Core business validation. Outlines which fee calculations were approved by the central system.
* **Independent Test**: Place a return file containing 1 accepted record and 1 rejected record. Verify the corresponding database records are updated correctly.
* **Acceptance Scenarios**:
  1. **Given** a return file, **When** parsed, **Then** the database status of calculated fees matches the ERP system processing result.

---

### User Story 4 - Discrepancy Logging & Mismatch Audit (Priority: P2)
As a Compliance Inspector, I want the reconciliation job to log a detailed warning if a return file indicates a mismatch in fee amounts or contains unknown identifiers, so that we can investigate immediately.

* **Why this priority**: Critical for error tracking and preventing accounting mismatches between systems.
* **Independent Test**: Process a file containing a record with mismatched fee amounts. Verify a record is created in the `ReconciliationDiscrepancy` table detailing the differences, and a warning is logged.
* **Acceptance Scenarios**:
  1. **Given** a discrepancy in values, **When** parsed, **Then** the system writes a record to the discrepancies database and log files.

---

## 2. Edge Cases

- **Duplicate File Processing**: Attempting to process the same return file twice.
  * *Resolution*: Generate an MD5/SHA-256 hash of the return file before processing. Save it in a `ProcessedFiles` table. Reject processing if the hash exists.
- **Corrupted File Formats**: A return file is empty or missing headers.
  * *Resolution*: The job must catch parsing exceptions, log a critical alert, move the file to an `/error` folder, and abort the transaction.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Admin Status API)**: Expose JAX-RS path `GET /api/v1/integration/batches/{batchId}`.
- **FR-002 (Quartz Scheduling)**: The reconciliation job MUST execute asynchronously based on a configurable Quartz trigger (e.g. `0 0 2 * * ?` for daily at 2:00 AM).
- **FR-003 (NIO File Processing)**: The batch job MUST read return files from a dedicated folder using Java NIO `Files` streams.
- **FR-004 (Status Synchronization)**: The engine MUST update database status fields of fee entities to `ACCEPTED` or `REJECTED` depending on file contents.
- **FR-005 (Audit Logging)**: The system MUST write discrepancy reports (e.g., amount mismatches, unmapped IDs) to a dedicated PostgreSQL table and emit structured JSON warning logs.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted. Endpoints reference the generic "Enterprise ERP Ledger".

### Key Entities

- **FeeBatch**:
  * `id`: UUID (Primary Key).
  * `status`: Enum (`SENT`, `ACCEPTED`, `REJECTED`).
  * `totalCalculatedCents`: Long.
  * `sentAt`: OffsetDateTime.
  * `reconciledAt`: OffsetDateTime.

- **ReconciliationDiscrepancy**:
  * `id`: Long (Primary Key).
  * `batchId`: UUID.
  * `recordReference`: String.
  * `expectedValue`: Long.
  * `reportedValue`: Long.
  * `reason`: String.
  * `loggedAt`: OffsetDateTime.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Processing return files with up to 10,000 records takes under 5 seconds of CPU processing time.
- **SC-002**: Orphan records in file (not present in database) are logged as discrepancies, without aborting the batch run.
- **SC-003**: File checksum validations block reprocessing attempts of identical files 100% of the time.
