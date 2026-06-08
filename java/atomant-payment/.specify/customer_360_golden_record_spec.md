# Feature Specification: Customer 360 Golden Record (MDM)

**Feature Branch**: `customer-360-golden-record`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Customer 360 Golden Record (MDM)' specification. Address the 'Fragmented Customer' anti-pattern identified in the Enterprise Architecture. Build an integration layer that aggregates customer profiles from legacy silos (CDC, Cards, Consortium) into a unified canonical model. Provide a real-time retrieval endpoint (sub-millisecond latency using Redis or Infinispan cache) for the Payment Account onboarding process. Ensure the architecture uses asynchronous event-driven messaging to keep the Golden Record updated whenever legacy systems change. Stack: Quarkus, SmallRye Reactive Messaging."

---

## 1. User Scenarios & Testing

### User Story 1 - Merge Siloed Profiles into Canonical Record (Priority: P1)
As an Integration Engine, I want to consume profile update events from legacy silos (CDC, Cards, Consortium) and merge them into a unified "Golden Record" so that the business has a single, accurate view of the customer.

* **Why this priority**: Core MDM foundation required to eliminate fragmented profile silos.
* **Independent Test**: Publish a profile update event from the Cards silo for a customer. Verify that the customer's canonical record incorporates the updated card-specific demographic fields.
* **Acceptance Scenarios**:
  1. **Given** a new customer profile change event from Cards, **When** processed by the MDM engine, **Then** a canonical `CustomerGoldenRecord` is persisted, joining card details with demographic data.

---

### User Story 2 - Real-time Cached Retrieval (Priority: P1)
As an Onboarding Service, I want to query the Golden Record of a customer by tax ID with sub-millisecond latency so that onboarding decisions can be made instantly without mainframe lookups.

* **Why this priority**: Crucial for high-throughput payment account onboarding, avoiding slow legacy database queries.
* **Independent Test**: Send a GET request to `/customers/{taxId}/golden-record`. Verify the response comes from the Redis cache (returning in < 5ms) and matches the unified database state.
* **Acceptance Scenarios**:
  1. **Given** a cached golden record, **When** queried by tax ID, **Then** the cache intercepts the query and returns the record instantly.
  2. **Given** a cache miss, **When** queried, **Then** the service fetches from the PostgreSQL database, populates the cache, and returns the result.

---

### User Story 3 - Asynchronous Change-Data Ingestion (Priority: P2)
As a Data Engineer, I want the system to listen to legacy profile updates asynchronously using Kafka streams so that the Golden Record is updated without locking transactional endpoints.

* **Why this priority**: Prevents blocking of frontend requests when legacy databases are performing updates.
* **Independent Test**: Emit three concurrent updates from different silos. Verify the system processes the events asynchronously using virtual threads, merges them correctly, and updates the cache.
* **Acceptance Scenarios**:
  1. **Given** legacy updates on Kafka topics `legacy.cdc.updates`, `legacy.cards.updates`, or `legacy.consortium.updates`, **When** consumed by SmallRye Reactive Messaging, **Then** the Golden Record updates and evicts the previous cache key.

---

## 2. Edge Cases

- **Attribute Conflicts (Data Collisions)**: Silo A (CDC) has phone number X, Silo B (Consortium) has phone number Y.
  * *Resolution*: Define a strict precedence ordering for demographics resolution: `Consortium` > `Cards` > `CDC`. If Consortium supplies a phone number, it overwrites CDC's value. If Consortium is empty, the CDC value remains.
- **Out-of-Order Events**: A profile update from 10:00 AM arrives after an update from 10:05 AM.
  * *Resolution*: Maintain a `version` or `lastModifiedTimestamp` inside the event header. The MDM engine must reject updates where the incoming event timestamp is older than the current `lastUpdated` timestamp in the database.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (Canonical Aggregation)**: The system MUST join demographic, cards, and consortium silos into a single `CustomerGoldenRecord` database schema.
- **FR-002 (Event-Driven Ingestion)**: The system MUST consume updates asynchronously over Kafka channels using Quarkus SmallRye Reactive Messaging.
- **FR-003 (Conflict Precedence)**: The system MUST resolve duplicate or conflicting fields using source silo priority order: `Consortium` (Highest) -> `Cards` (Medium) -> `CDC` (Lowest).
- **FR-004 (Sub-millisecond Read Cache)**: The system MUST cache the canonical record using a Redis key-value store, mapping `taxId` to JSON payloads, ensuring reads are sub-millisecond.
- **FR-005 (Cache Invalidation)**: Every database update to a Golden Record MUST invalidate/evict the corresponding Redis cache key to prevent stale reads.
- **FR-006 (REST API)**: The service MUST expose a public endpoint `GET /customers/{taxId}/golden-record` protected by access roles.

### Key Entities

- **CustomerGoldenRecord**:
  * `taxId`: String (Unique Primary Key, standard CPF/CNPJ identifier).
  * `fullName`: String.
  * `email`: String (Resolved by precedence).
  * `phone`: String (Resolved by precedence).
  * `birthDate`: LocalDate.
  * `cardsCustomerProfile`: Embedded/JSON (Card silo metadata).
  * `consortiumCustomerProfile`: Embedded/JSON (Consortium silo metadata).
  * `lastUpdated`: OffsetDateTime.
  * `siloUpdatesMap`: Map of source silo name to last modified timestamp.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: API endpoint read latency is consistently under 5ms for cached records under 1000 concurrent requests per second.
- **SC-002**: Conflicts between Card and CDC updates resolve automatically based on source priority rules.
- **SC-003**: The event queue processes up to 10,000 legacy updates per minute utilizing virtual thread consumers without message drops.
