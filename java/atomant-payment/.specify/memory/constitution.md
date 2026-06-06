# Project Constitution & Engineering Principles: `atomant-payment`

This constitution establishes the core, non-negotiable engineering principles, quality gates, and standards for the `atomant-payment` microservice/FaaS project. All AI agents, contributors, and pull requests must adhere to these guidelines to prevent architectural drift and maintain software quality.

---

## 1. Code Quality & Architecture Principles

### 1.1 Modern Java & Language Standards
* **Java 25 Runtime**: The project compiles against Java 25. Utilize modern Java idioms, including:
  * **Records**: Prefer `record` definitions over standard classes for DTOs, inputs, and immutable data transfer objects.
  * **Pattern Matching**: Use pattern matching for `instanceof` and modern `switch` expressions to write cleaner type-checking code.
  * **Immutability by Default**: Declare variables `final` where possible. Avoid setter methods unless strictly required by serialization or framework beans.

### 1.2 Quarkus CDI & Dependency Injection
* **Arc (CDI)**: Use JSR 365 / CDI annotations for bean life cycle management. Prefer `@ApplicationScoped` for stateless services and `@RequestScoped` for stateful request-bound components.
* **Constructor Injection**: Always use constructor injection instead of field injection (`@Inject`) on private fields. This makes unit testing easier and guarantees initialized instances.
  ```java
  private final PaymentService paymentService;

  public PaymentResource(PaymentService paymentService) {
      this.paymentService = paymentService;
  }
  ```

### 1.3 Payment Transaction Safety & Idempotency
* **Mandatory Idempotency Keys**: Every mutative action (e.g., charge, refund, transfer) must require a client-supplied UUID-based `Idempotency-Key` passed via request headers.
* **Atomic Check-and-Set**: Check for prior transactions and insert new transaction records atomically within the same database transaction context (`@Transactional`). Use pessimistic locking (`SELECT ... FOR UPDATE`) or database unique constraints to prevent race conditions during concurrent client retries.
* **Consistently Cache Results**: Store the final response body and HTTP status code along with the idempotency key. Any retry within the TTL period must yield the exact cached response without re-processing.
* **Transactional Outbox Pattern**: All domain events (e.g., payment processed, ledger updated) must be saved to a database outbox table in the same transaction as the payment record, then asynchronously dispatched to the message broker (e.g., Kafka).

### 1.4 Clean Code & SOLID
* **Single Responsibility (SRP)**: Keep JAX-RS Resource classes (`@Path`) and Funqy functions (`@Funq`) focused strictly on protocol adapters, request mapping, and validation. Delegate business logic to dedicated CDI beans (`@ApplicationScoped`).
* **Error Handling & Audit Logging**: 
  * Do not capture general exceptions to return raw HTTP response wrappers. Use JAX-RS `ExceptionMapper` classes to catch custom domain exceptions globally and format them into consistent error payloads.
  * Avoid `System.out.println` and `e.printStackTrace()`. Use JBoss Logging (`org.jboss.logging.Logger`) with appropriate log levels (`INFO`, `DEBUG`, `WARN`, `ERROR`).
  * Log all financial transactions and state modifications with correlation IDs. Mask sensitive customer data (e.g., PANs, CVVs, passwords) in all logs.

---

## 2. Testing Standards & Quality Gates

### 2.1 Test-Driven & Test-First Development
* All new services, utility functions, endpoints, and bug fixes must have corresponding test coverage.
* Write unit tests for business logic isolation and integration tests to verify container, REST, and function behaviors.

### 2.2 Framework & Tooling
* **JUnit 5**: Standard unit and integration testing runner.
* **Quarkus Tests**:
  * Use `@QuarkusTest` for unit and integration testing within the JVM.
  * Use `@InjectMock` from `io.quarkus.test.junit.mockito` to mock external adapters or repository services.
* **REST Assured**: Use `io.rest-assured` to validate REST endpoints and Funqy functions via local HTTP calls.
* **Native Integration Testing**:
  * For every test suite testing a resource, provide an Integration Test class extending it and annotated with `@QuarkusIntegrationTest`.
  * Ensure integration tests are executed under the `native` profile to guarantee native-image compatibility.

### 2.3 Concurrency & Idempotency Testing
* Write integration tests specifically designed to trigger concurrent requests with the same idempotency key to verify thread safety and race condition avoidance.
* Validate transaction rollback behaviors during database failures or downstream gateway timeouts.

### 2.4 Coverage Targets
* **Line Coverage**: Target a minimum of **80%** line coverage.
* **Branch Coverage**: Target a minimum of **75%** branch coverage.
* Critical business paths (payment execution, state changes, idempotency checks) must have **100%** coverage of all negative/failure scenarios.

---

## 3. User Experience Consistency (API & FaaS design)

### 3.1 REST API Design & HTTP Status Codes
* **HTTP Verbs**: Adhere to semantic REST conventions.
* **Status Codes**: 
  * `200 OK` for successful fetches.
  * `201 Created` when a transaction/payment is successfully created.
  * `400 Bad Request` for validation failures.
  * `401 Unauthorized` for missing or invalid credentials.
  * `403 Forbidden` for authenticated clients lacking sufficient permissions.
  * `404 Not Found` for missing endpoints or resources.
  * `409 Conflict` for mismatched request details on retried idempotency keys.
  * `500 Internal Server Error` only for unhandled exceptions. Avoid leaking stack traces in the response body.

### 3.2 Request/Response Schemas
* **Payload Convention**: Use standard camelCase for JSON keys (e.g., `paymentId`, `amountInCents`).
* **Input Validation**: Use Bean Validation annotations (`jakarta.validation.constraints`) such as `@NotNull`, `@Min`, `@Pattern`, and `@Size` on request payloads.
* **Error Response Format**: Standardize error bodies matching the `atomant-auth` schema:
  ```json
  {
    "code": "INSUFFICIENT_FUNDS",
    "message": "The transaction could not be completed due to insufficient balance",
    "details": [
      {
        "field": "amountInCents",
        "issue": "must be less than or equal to current balance"
      }
    ]
  }
  ```

### 3.3 Funqy & Serverless (FaaS) Functions
* Keep inputs and outputs clear and structured.
* Funqy function names must be lowercase with hyphens (kebab-case) for uniform URL path routing (e.g., `process-payment`).

---

## 4. Performance & Native Compilation Requirements

### 4.1 Native Executable Constraints (GraalVM)
* **Reflection & Class Loading**: Avoid dynamic class loading or reflection that cannot be resolved at build time. If reflection or dynamic serialization is necessary, register the target classes using `@RegisterForReflection`.
* **Static Initialization**: Minimize heavy work in static blocks or constructors that might run during build time rather than runtime.
* Ensure all dependencies added to `pom.xml` are native-friendly or have corresponding Quarkus extensions.

### 4.2 Resource Footprint & Serverless Scaling
* **Startup Time**: Target a startup time under **100ms** in Native mode to facilitate fast Knative scale-to-zero wakeups.
* **Memory Constraints**: Keep resident set size (RSS) memory consumption below **50MB** for a containerized native microservice at startup.
* **Asynchronous & Reactive Concurrency**:
  * For long-running, I/O-bound operations (e.g., downstream payment gateway requests), utilize non-blocking or reactive APIs (e.g., Quarkus Mutiny).
  * For standard workloads, leverage Java 25 Virtual Threads using `@RunOnVirtualThread` if blocking APIs are necessary.
