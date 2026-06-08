# Feature Specification: CQRS & Event Sourcing Payment Core

**Feature Branch**: `cqrs-event-sourcing-payment`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'CQRS & Event Sourcing Payment Core' specification. Address the high read/write asymmetry in the Account Management domain by implementing the Command Query Responsibility Segregation (CQRS) and Event Sourcing patterns. Use an event backbone with exactly-once processing guarantees to ensure 100% data consistency for financial transactions (preventing negative balances). Stack: Quarkus, SmallRye Reactive Messaging, Apache Kafka."

---

## 1. User Scenarios & Testing

### User Story 1 - Command Ingestion & Event Storage (Priority: P1)
As a Payment client, I want to execute commands (e.g., `DebitAccountCommand`) that validate balance limits, write events to an append-only Event Store, and publish them to Kafka so that the write path is completely auditable.

* **Why this priority**: Core write-path. Emits the events that drive the entire event-sourcing database replication process.
* **Independent Test**: Submit a `DebitAccountCommand` for $ 50.00. Verify the system checks the current balance, appends an `AccountDebitedEvent` to the Event Store, and publishes the event to topic `payment.account.events`.
* **Acceptance Scenarios**:
  1. **Given** a command to debit an account, **When** the account has sufficient funds, **Then** the command succeeds, persisting the event with an incremented version number.
  2. **Given** a command to debit an account, **When** the debit amount exceeds the current balance, **Then** the command fails with `400 Bad Request` and no event is emitted.

---

### User Story 2 - Aggregate State Reconstitution (Priority: P1)
As a Command Handler, I want to rebuild the current state of an account by replaying its historical events from the Event Store in chronological order, so that I can validate business rules against up-to-date values.

* **Why this priority**: Required to validate state (e.g. balance bounds) on the write-side before committing new commands.
* **Independent Test**: Load an account with 3 events: `Created (+$100)`, `Debited (-$30)`, and `Credited (+$50)`. Verify the reconstituted account balance is exactly `$ 120.00` and its version is `3`.
* **Acceptance Scenarios**:
  1. **Given** an account ID, **When** loaded by the Event Sourcing repository, **Then** the engine queries all events sorted by version ascending, applies them to a blank `Account` aggregate, and returns the finished state.

---

### User Story 3 - CQRS Read Model Synchronization (Priority: P1)
As a Query Client, I want to query my account balance from a read-optimized datastore that is updated asynchronously via the Kafka event backbone, so that my queries have sub-millisecond latencies without locking the write store.

* **Why this priority**: Addresses the high read/write asymmetry. Prevents heavy read queries from blocking writing transactions.
* **Independent Test**: Emit a mock `AccountDebitedEvent` on Kafka. Verify the consumer updates the `account_balances_projection` table, and a subsequent GET request returns the updated balance.
* **Acceptance Scenarios**:
  1. **Given** an incoming event on the Kafka topic, **When** processed by the read-side listener, **Then** the projection database table is updated immediately.

---

### User Story 4 - Transactional Exactly-Once Kafka Processing (Priority: P1)
As a Financial Auditor, I want the system to guarantee exactly-once processing for all database writes and Kafka events so that we prevent duplicate transaction postings and negative balances.

* **Why this priority**: Ensures 100% data consistency across databases and event brokers during network failures or producer retries.
* **Independent Test**: Inject a network partition during a debit transaction. Verify the transaction either commits both to the PostgreSQL Event Store and Kafka atomically, or rolls back completely (zero partial commits).
* **Acceptance Scenarios**:
  1. **Given** a Kafka producer, **When** sending events, **Then** the system uses the Kafka transactional API (`processing.guarantee=exactly_once_v2`), ensuring events are only visible to consumers if the local database transaction commits.

---

## 2. Edge Cases

- **Concurrency Mismatches (Optimistic Lock)**: Two concurrent debit commands arrive for version 4.
  * *Resolution*: The Event Store table has a unique constraint on `(aggregate_id, version)`. The second insert fails, triggering a rollback. The command handler retries the command by reloading version 5 and executing validation again.
- **Snapshotting thresholds**: Replaying an account with 100,000 transaction events takes too long.
  * *Resolution*: Every 100 events, write an `AccountSnapshot` record. When loading, query the latest snapshot first, then replay only subsequent events.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (CQRS Architecture)**: The application MUST separate command writes (Event Store) from query projections (Read-model views).
- **FR-002 (Event-Sourced State)**: The write-side MUST reconstituted aggregate states exclusively by loading and replaying historical events from `account_event_store` table.
- **FR-003 (Transaction Isolation & Concurrency)**: The Event Store database schema MUST enforce optimistic concurrency control via a composite unique constraint on `(aggregateId, version)`.
- **FR-004 (Exactly-Once Semantics)**: Outbound event publishers MUST configure Kafka transactions (`exactly-once`) to ensure atomicity between DB writes and Kafka event dispatches.
- **FR-005 (Balance Validation Gate)**: The command validator MUST reject any debit operation that results in a negative balance (`balance < 0`).
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **EventStoreEntry**:
  * `id`: Long (Primary Key).
  * `aggregateId`: String (UUID/Account ID).
  * `version`: Long (Incremental sequence starting at 1).
  * `eventType`: String.
  * `eventPayload`: String (JSON metadata).
  * `timestamp`: OffsetDateTime.

- **AccountBalanceProjection**:
  * `accountId`: String (Primary Key).
  * `balanceInCents`: Long.
  * `version`: Long.
  * `lastUpdated`: OffsetDateTime.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Concurrent requests for the same version yield a 100% rejection rate for the lagging request, protecting state sanity.
- **SC-002**: Replaying 100 events takes under 10ms of aggregate processing time.
- **SC-003**: Incomplete transactions (e.g. database commits that fail after Kafka produces) are cleanly blocked by Kafka's transactional coordinator rules.
