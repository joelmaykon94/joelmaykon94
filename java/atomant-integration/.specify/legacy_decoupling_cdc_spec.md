# Feature Specification: Legacy Decoupling & Change Data Capture (CDC)

**Feature Branch**: `legacy-decoupling-cdc`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Legacy Decoupling & Change Data Capture' specification. Address the 'Distributed Monolith' and 'Spaghetti Mesh' anti-patterns between the legacy Credit Cards, Retail Lending, and Guaranty Mainframe silos. Implement an Event-Driven Architecture using Change Data Capture (CDC, e.g., Debezium) and Apache Kafka to stream state changes from legacy databases into a modernized read-optimized datastore. This prevents synchronous point-to-point failures, reduces coupling, and provides real-time data for the Payment Core without overloading the mainframe. Stack: Quarkus, SmallRye Reactive Messaging."

---

## 1. User Scenarios & Testing

### User Story 1 - Consume Legacy Credit Card Database CDC Events (Priority: P1)
As a modernized Payment Core Service, I want the integration service to ingest credit card profile updates asynchronously using CDC events so that card status changes are reflected in our read-optimized store.

* **Why this priority**: Core security validation. Prevents processing payments for cards that are blocked or closed in the legacy system.
* **Independent Test**: Emit a mock Debezium "update" event on the `legacy.cards.cdc` topic. Verify the system processes the event asynchronously and updates the local postgres table `cards_read_model`.
* **Acceptance Scenarios**:
  1. **Given** a Debezium payload with `op = "u"` on topic `legacy.cards.cdc`, **When** consumed by the integration layer, **Then** the local data model updates the card limit and status fields.

---

### User Story 2 - Consume Legacy Retail Lending CDC Events (Priority: P1)
As a modernized Payment Core Service, I want to ingest retail lending status changes using CDC events so that active credit limits are synced.

* **Why this priority**: Decouples loan disbursements from blocking mainframe calls.
* **Independent Test**: Emit a Debezium "create" event on `legacy.lending.cdc`. Verify a new entry is created in `lending_read_model`.
* **Acceptance Scenarios**:
  1. **Given** a new loan contract event, **When** processed, **Then** the credit limit is updated in the read-optimized datastore.

---

### User Story 3 - Mainframe Guaranty CDC Parsing & Normalization (Priority: P2)
As an Integration Engine, I want to parse mainframe CDC events (which are flat structures or uppercase fields) and map them to our normalized JSON/Relational schema so that the payment core remains insulated.

* **Why this priority**: Insulates the payment core from legacy schemas, acting as an Anti-Corruption Layer (ACL).
* **Independent Test**: Publish a mainframe event containing `TX_STATUS_CODE = "A"`. Verify the system translates it to status `ACTIVE` and persists it.
* **Acceptance Scenarios**:
  1. **Given** a mainframe CDC event, **When** parsed, **Then** the output conforms to modern domain models.

---

### User Story 4 - Out-of-Order Event Protection (Priority: P1)
As a Data Engineer, I want the system to ignore older CDC updates if a newer update has already been processed, so that we prevent data race conditions and stale writes.

* **Why this priority**: Essential to guarantee eventual consistency in high-frequency event streams.
* **Independent Test**: Process a card event with `ts_ms = 10005`. Attempt to process an event with the same ID but `ts_ms = 10000`. Verify the older event is ignored.
* **Acceptance Scenarios**:
  1. **Given** an incoming CDC event, **When** the event's source timestamp (`ts_ms`) is older than the `lastUpdated` timestamp in the database, **Then** the event is safely discarded.

---

## 2. Edge Cases

- **Tombstone Records (Hard Deletions)**: A record is deleted in the source database, emitting a Debezium payload with `op = "d"` and null `after` state.
  * *Resolution*: The consumer must interpret `op = "d"` as a soft-deletion, marking the status as `DELETED` in the local read-optimized view, or evicting the corresponding key from the cache.
- **CDC Event Buffer Backpressure**: High volume legacy writes overwhelm the Quarkus consumer.
  * *Resolution*: Configure the Kafka consumer channel with `backpressure.strategy=buffer` and process event handling on Java 21 virtual threads (`@RunOnVirtualThread`) to scale processing capacity.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Kafka Consumer Channels)**: The system MUST consume CDC events from topics:
  * `legacy.cards.cdc`
  * `legacy.lending.cdc`
  * `legacy.guaranty.cdc`
  using Quarkus SmallRye Reactive Messaging.
- **FR-002 (Modernized Read Datastore)**: Consumed events MUST be merged into a read-optimized PostgreSQL schema (`cards_read_model`, `lending_read_model`), decoupling read operations from the legacy mainframe.
- **FR-003 (MIME / Envelope Translation)**: The consumer MUST extract payload parameters (`before`, `after`, `op`, `ts_ms`) and normalize legacy formats.
- **FR-004 (Out-of-Order Protection)**: The ingestion layer MUST check the `ts_ms` value, discarding any event that has a timestamp older than the local record's `lastUpdated` timestamp.
- **FR-005 (Soft-Delete Processing)**: Deletions (`op = "d"`) MUST set target rows to status `DELETED` in the read model, keeping an audit trail.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **DebeziumEventEnvelope**:
  * `op`: String (c, u, d).
  * `ts_ms`: Long.
  * `before`: Map (nullable).
  * `after`: Map (nullable).

- **ReadModelMetadata**:
  * `id`: String (Primary Key).
  * `lastUpdatedTimestamp`: Long (derived from event `ts_ms`).
  * `status`: String.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Stale or out-of-order messages are ignored 100% of the time, keeping the read model consistent with the latest source state.
- **SC-002**: Re-syncing database projections from Kafka offsets maintains eventual consistency within 1 second.
- **SC-003**: CPU usage remains stable under spike loads of 5,000 messages per second.
