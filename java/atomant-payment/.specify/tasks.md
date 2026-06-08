# Tasks: Enterprise Payment Gateway (`atomant-payment`)

This document outlines the detailed, atomic execution task list for the implementation of the **Enterprise Payment Gateway** (`atomant-payment`) microservice. Tasks are structured to support parallel execution where possible (denoted by `[P]`) and organized sequentially through the requested stages.

---

## Phase 1: Setup & Foundational Security (Auth)

**Purpose**: Scaffold the microservice and implement JWT security role-based endpoints (ADMIN/CUSTOMER) for bank accounts.

- [ ] **T001**: Scaffold Maven project structure and configure Quarkus dependencies in `java/atomant-payment/pom.xml`.
- [ ] **T002 [P]**: Configure data source profiles (Dev/Test/Prod) and basic JPA parameters in `java/atomant-payment/src/main/resources/application.properties`.
- [ ] **T003 [P]**: Integrate `quarkus-smallrye-jwt` configurations for public key signature validation in `java/atomant-payment/src/main/resources/application.properties`.
- [ ] **T004**: Map the `Account` domain model to persistence mapping class in `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/persistence/AccountEntity.java`.
- [ ] **T005**: Implement the repository interface and queries using Panache Repository pattern in `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/persistence/AccountRepository.java`.
- [ ] **T006**: Implement JWT claim constraint checker in `java/atomant-payment/src/main/java/org/acme/payment/api/security/SecurityContextValidator.java` to verify `sub`/`customerId` ownership rules.
- [ ] **T007**: Implement JAX-RS endpoints for creating, querying, and closing accounts in `java/atomant-payment/src/main/java/org/acme/payment/api/rest/AccountResource.java`.
- [ ] **T008 [P]**: Implement account ledger statement retrieval with pagination in `java/atomant-payment/src/main/java/org/acme/payment/api/rest/AccountResource.java` (fetching last N transactions, default 10, max 100).
- [ ] **T009**: Write unit tests verifying core domain logic (e.g. closing account with balance > 0) in `java/atomant-payment/src/test/java/org/acme/payment/domain/service/AccountServiceTest.java`.
- [ ] **T010 [P]**: Write integration tests using REST Assured verifying authorization roles in `java/atomant-payment/src/test/java/org/acme/payment/api/rest/AccountResourceTest.java` (verifying `CUSTOMER` vs `ADMIN` endpoint accessibility).

**Checkpoint**: Foundation & Auth complete. Core endpoints are testable.

---

## Phase 2: Core Financial Transfers & Authorizer

**Purpose**: Implement synchronous internal transfer processing, deterministic lock ordering to prevent deadlocks, idempotency caching, and unstable authorizer API client routing.

- [ ] **T011**: Map transfer and transaction models in `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/persistence/TransferEntity.java` and `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/persistence/TransactionEntity.java`.
- [ ] **T012**: Implement Panache Repositories in `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/persistence/TransferRepository.java` and `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/persistence/TransactionRepository.java`.
- [ ] **T013**: Implement transfer logic with balance checks and deterministic pessimistic locking order (ordering account IDs ascending) in `java/atomant-payment/src/main/java/org/acme/payment/domain/service/TransferService.java`.
- [ ] **T014**: Create database mapping and filter middleware in `java/atomant-payment/src/main/java/org/acme/payment/api/rest/filter/IdempotencyFilter.java` to block duplicate transfer executions sharing identical `Idempotency-Key` headers.
- [ ] **T015**: Define REST Client interface for Mock Authorizer API utilizing SmallRye Fault Tolerance (`@Timeout`, `@Retry`, `@Fallback`) in `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/client/AuthorizerClient.java`.
- [ ] **T016**: Configure downstream authorizer connection parameters in `java/atomant-payment/src/main/resources/application.properties`.
- [ ] **T017**: Implement REST controller in `java/atomant-payment/src/main/java/org/acme/payment/api/rest/TransferResource.java` to dispatch POST requests to `TransferService`.
- [ ] **T018**: Write unit tests checking concurrent transaction scenarios and fallback behaviors in `java/atomant-payment/src/test/java/org/acme/payment/domain/service/TransferServiceTest.java`.
- [ ] **T019 [P]**: Write mock HTTP client contract tests using WireMock in `java/atomant-payment/src/test/java/org/acme/payment/infrastructure/client/AuthorizerClientTest.java`.
- [ ] **T020 [P]**: Write integration tests mapping out transfer API results (201, 400, 422, 409) in `java/atomant-payment/src/test/java/org/acme/payment/api/rest/TransferResourceTest.java`.

**Checkpoint**: Synchronous transfer flows, transaction isolation levels, and downstream client resilience are verified.

---

## Phase 3: Asynchronous Pix Processing

**Purpose**: Build reactive event routing over Kafka, configuring message consumers on lightweight Java Virtual Threads, registering telemetry metrics, and enabling JSON structured logging.

- [ ] **T021**: Configure inbound (`pix-requests`) and outbound (`pix-processed`) channels in `java/atomant-payment/src/main/resources/application.properties`.
- [ ] **T022**: Implement reactive event consumer `org.acme.payment.infrastructure.event.PixMessageConsumer` using `@RunOnVirtualThread` to execute processing off main loop OS threads.
- [ ] **T023**: Setup Kafka dead-letter-queue (DLQ) recovery redirection configs and retry policies in `java/atomant-payment/src/main/resources/application.properties`.
- [ ] **T024**: Register Promethus-ready metric components (Micrometer counters, latency timers) in `java/atomant-payment/src/main/java/org/acme/payment/infrastructure/event/PixMessageConsumer.java`.
- [ ] **T025 [P]**: Enable structured console JSON layouts and print filters in `java/atomant-payment/src/main/resources/application.properties`.
- [ ] **T026**: Write reactive loop tests verifying DLQ diversion and consumption rules using Kafka Dev Services in `java/atomant-payment/src/test/java/org/acme/payment/infrastructure/event/PixMessageConsumerTest.java`.

**Checkpoint**: Reactive messaging flow, resilience, and metrics coverage are functional.

---

## Phase 4: Docker Compose & Quarkus Infrastructure

**Purpose**: Execute Flyway database migration scripts sequentially and prepare local/container orchestrations.

- [ ] **T027 [P]**: Add Flyway migration SQL schema: `V1.0.0__create_accounts_table.sql` under `java/atomant-payment/src/main/resources/db/migration/`.
- [ ] **T028 [P]**: Add Flyway migration SQL schema: `V1.1.0__create_transactions_table.sql` under `java/atomant-payment/src/main/resources/db/migration/`.
- [ ] **T029 [P]**: Add Flyway migration SQL schema: `V1.2.0__create_transfers_table.sql` under `java/atomant-payment/src/main/resources/db/migration/`.
- [ ] **T030**: Create packaging setups in `java/atomant-payment/src/main/docker/Dockerfile.jvm` and `Dockerfile.native` files.
- [ ] **T031**: Compile environment mappings inside `java/atomant-payment/docker-compose.yml` integrating PostgreSQL, Redpanda/Kafka, the Mock Authorizer API, and payment microservices.
- [ ] **T032**: Run integration suites and compute test metrics, ensuring the overall codebase passes the 50% line coverage gate.

**Checkpoint**: Deployment configurations complete. Sandbox environment ready for boot.

---

## Dependencies & Execution Order

### Phase Dependencies
1. **Setup & Security (Phase 1)**: Can begin immediately.
2. **Core Financial & Authorizer (Phase 2)**: Depends on completion of Phase 1 (requires active Accounts schema and basic JWT security infrastructure).
3. **Async Pix (Phase 3)**: Depends on completion of Phase 2 (requires active accounts and transaction repositories to write processed Pix postings).
4. **Docker Compose & Infrastructure (Phase 4)**: Depends on completion of Phases 1, 2, and 3 (needs all entities finalized to write migrations, and all codes completed to dockerize and boot).

### Parallel Opportunities
* **Properties setup** (`T002`, `T003`) can run concurrently.
* **Migrations creation** (`T027`, `T028`, `T029`) can be authored in parallel.
* **Endpoint / Integration test writing** (`T010`, `T019`, `T020`) can execute in parallel.
