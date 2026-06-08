# Feature Specification: Regulatory Compliance & AML Audit

**Feature Branch**: `regulatory-compliance-aml-audit`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Regulatory Compliance & AML Audit' specification. Address the high regulatory barrier for Payment Accounts by implementing immutable audit trails and Anti-Money Laundering (AML) controls. Ensure the architecture supports a 'Compliance-as-Code' approach with continuous automated validation to meet Central Bank licensing requirements. Use an append-only storage pattern for auditing data alterations. Stack: Quarkus, Hibernate Envers."

---

## 1. User Scenarios & Testing

### User Story 1 - Immutable Audit Trail of Data Alterations (Priority: P1)
As a Compliance Auditor, I want the system to automatically record all modifications to account statuses and balances in an append-only database schema so that we maintain a complete historical record of data alterations.

* **Why this priority**: Core Central Bank licensing requirement. All financial account balance and state changes must be auditable.
* **Independent Test**: Create an account, update its balance, then change its status to `CLOSED`. Query the audit logs. Verify Envers has created revision records matching each lifecycle state change.
* **Acceptance Scenarios**:
  1. **Given** an audited entity `AccountEntity`, **When** a transaction commits updates to its state, **Then** a corresponding revision is appended to the audit tables (`accounts_AUD`, `REVINFO`).

---

### User Story 2 - Real-Time Anti-Money Laundering (AML) Checks (Priority: P1)
As an AML Compliance Analyst, I want the transfer flow to evaluate transaction amounts and velocities before execution, blocking or flagging high-risk transactions.

* **Why this priority**: Prevents illicit funds movement and ensures compliance with global anti-money laundering limits.
* **Independent Test**: Submit a transfer request for `$ 15,000.00` (above the `$ 10,000.00` threshold). Verify that the system flags the transaction as `FLAGGED_FOR_REVIEW` and records the AML rule check.
* **Acceptance Scenarios**:
  1. **Given** a transfer request, **When** the amount exceeds `1000000` cents ($ 10,000.00), **Then** the transfer is processed but flagged, creating a transaction record in the `AmlRuleCheck` audit table.
  2. **Given** a sender tax ID that matches a compliance blacklist, **When** submitted, **Then** the transfer is blocked immediately returning `400 Bad Request`.

---

### User Story 3 - Continuous Automated Compliance-as-Code (Priority: P2)
As a QA Engineer, I want the test suite to automatically verify the immutability of audit configurations during CI build pipelines so that misconfigurations are blocked before deployment.

* **Why this priority**: Code assurance. Ensures developers do not accidentally disable auditing annotations or delete triggers.
* **Independent Test**: Run a test that attempts to execute a SQL hard delete on `accounts_AUD`. Verify the database trigger throws a constraint error, blocking the delete.
* **Acceptance Scenarios**:
  1. **Given** an automated test run, **When** a SQL statement tries to modify or delete a row inside any `_AUD` audit log tables, **Then** the database rules block the operation.

---

## 2. Edge Cases

- **Audit Metadata Expiration**: The user token expires during an active database transaction.
  * *Resolution*: The Envers revision listener must extract the security context at the time of session flush. If context is empty (e.g. system task), default to `SYSTEM_JOB` user context.
- **Velocity Limit Spike**: A user submits 20 micro-transfers of $ 600.00 in under 2 minutes (structuring behavior).
  * *Resolution*: The AML service must query the transaction database within a sliding window (e.g. last 10 minutes). If cumulative transfers exceed $ 10,000.00, it flags subsequent requests as structured AML events.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Hibernate Envers Integration)**: The persistence layer MUST integrate `quarkus-hibernate-orm` with Hibernate Envers, annotating `AccountEntity` and `TransferEntity` with `@Audited`.
- **FR-002 (Immutable Database Audit)**: The audit log tables (`accounts_AUD`, `transfers_AUD`) MUST be configured as append-only via database trigger rules that fail on any `DELETE` or `UPDATE` statements.
- **FR-003 (Audit Context Retention)**: Each audit revision MUST record the user ID (from JWT claim `sub`), client IP, and operation timestamp.
- **FR-004 (AML Rule Checks)**: The system MUST execute AML rules prior to executing peer-to-peer transfers, checking for blacklisted entities and velocity thresholds.
- **FR-005 (Reporting Flag)**: Any internal transfer exceeding `$ 10,000.00` (`1,000,000` cents) MUST flag the transfer status as `FLAGGED_FOR_REVIEW` for regulatory compliance logging.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **AmlRuleCheck**:
  * `id`: UUID (Primary Key).
  * `transactionId`: String (not null).
  * `status`: Enum (`CLEARED`, `FLAGGED_FOR_REVIEW`, `BLOCKED`).
  * `matchedRules`: List<String>.
  * `checkedAt`: OffsetDateTime.

- **CustomRevisionInfo**:
  * `id`: Long (Primary Key, matches standard Revision number).
  * `timestamp`: Long.
  * `userId`: String (populated from JWT context).
  * `ipAddress`: String.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Hard delete statements executed against the audit tables fail 100% of the time, keeping historical changes intact.
- **SC-002**: Automated compliance validation tests verify that Envers is active on all core models during boot.
- **SC-003**: Blacklisted account identifiers are blocked from initiating transfers with sub-10ms response latencies.
