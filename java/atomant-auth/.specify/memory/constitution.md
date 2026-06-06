# Project Constitution & Engineering Principles: `atomant-auth`

This constitution establishes the core, non-negotiable engineering principles, quality gates, and standards for the `atomant-auth` microservice/FaaS project. All AI agents, contributors, and pull requests must adhere to these guidelines to prevent architectural drift and maintain software quality.

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
  private final TokenService tokenService;

  public AuthResource(TokenService tokenService) {
      this.tokenService = tokenService;
  }
  ```

### 1.3 Clean Code & SOLID
* **Single Responsibility (SRP)**: Keep JAX-RS Resource classes (`@Path`) and Funqy functions (`@Funq`) focused strictly on protocol adapters, request mapping, and validation. Delegate business logic to dedicated CDI beans (`@ApplicationScoped`).
* **Error Handling**: 
  * Do not capture general exceptions to return raw HTTP response wrappers.
  * Use JAX-RS `ExceptionMapper` classes to catch custom domain exceptions globally and format them into consistent error payloads.
  * Avoid `System.out.println` and `e.printStackTrace()`. Use JBoss Logging (`org.jboss.logging.Logger`) with appropriate log levels (`INFO`, `DEBUG`, `WARN`, `ERROR`).

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

### 2.3 Coverage Targets
* **Line Coverage**: Target a minimum of **80%** line coverage.
* **Branch Coverage**: Target a minimum of **75%** branch coverage.
* Critical business paths (token verification, credentials check) must have **100%** coverage of all negative/failure scenarios.

---

## 3. User Experience Consistency (API & FaaS design)

### 3.1 REST API Design & HTTP Status Codes
* **HTTP Verbs**: Adhere to semantic REST conventions:
  * `GET` for retrieving data (idempotent, side-effect free).
  * `POST` for initiating actions (e.g., token request, authentication) or creating resources.
  * `PUT`/`PATCH` for updates.
  * `DELETE` for resource removals.
* **Status Codes**: 
  * `200 OK` for successful fetches and generic operations.
  * `201 Created` when a resource is successfully created.
  * `400 Bad Request` for validation failures.
  * `401 Unauthorized` for missing or invalid credentials.
  * `403 Forbidden` for authenticated clients lacking sufficient permissions.
  * `404 Not Found` for missing endpoints or resources.
  * `500 Internal Server Error` only for unhandled exceptions. Avoid leaking stack traces in the response body.

### 3.2 Request/Response Schemas
* **Payload Convention**: Use standard camelCase for JSON keys (e.g., `accessToken`, `expiresIn`).
* **Input Validation**: Use Bean Validation annotations (`jakarta.validation.constraints`) such as `@NotNull`, `@NotBlank`, `@Size`, and `@Email` on request payloads.
* **Error Response Format**: Standardize error bodies:
  ```json
  {
    "code": "VALIDATION_FAILED",
    "message": "Constraint violations encountered",
    "details": [
      {
        "field": "username",
        "issue": "must not be blank"
      }
    ]
  }
  ```

### 3.3 Funqy & Serverless (FaaS) Functions
* Keep inputs and outputs clear and structured (e.g., using POJOs/Records like `NameInput` in `GreetingFunction.java`).
* Funqy function names must be lowercase with hyphens (kebab-case) for uniform URL path routing (e.g., `hello-funq`).

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
  * For long-running, I/O-bound operations, utilize non-blocking or reactive APIs (e.g., Quarkus Mutiny).
  * For standard workloads, leverage Java 25 Virtual Threads using `@RunOnVirtualThread` if blocking APIs are necessary.
