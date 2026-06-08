# Feature Specification: Global KYC & Risk Analysis Shared Service

**Feature Branch**: `global-kyc-risk-analysis`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Global KYC & Risk Analysis Shared Service' specification. Address the requirement to build reusable Architecture Building Blocks (ABBs) as an internal Platform as a Service (PaaS). Design standalone microservices for 'Know Your Customer' (KYC) and 'Risk Analysis' that decouple these functions from the Payment Core. Ensure the APIs are agnostic so future credit or investment products can plug into them with near-zero marginal cost. Stack: Quarkus, REST Client."

---

## 1. User Scenarios & Testing

### User Story 1 - Know Your Customer (KYC) Onboarding Verification (Priority: P1)
As a Payment Account Onboarding Service, I want to verify a customer's KYC status by tax ID so that I can automatically approve or block account creation based on compliance status.

* **Why this priority**: Mandatory regulatory gate. Account creation must block if KYC verification fails.
* **Independent Test**: Send a GET request to `/api/v1/kyc/verify/12345678901`. Verify the endpoint returns a JSON payload detailing the status `APPROVED` or `REJECTED`.
* **Acceptance Scenarios**:
  1. **Given** a valid tax ID, **When** queried, **Then** the KYC engine checks background databases and returns a standardized response containing status (`APPROVED`, `REJECTED`, `PENDING_MANUAL_REVIEW`).

---

### User Story 2 - Real-time Risk Score Calculation (Priority: P1)
As an Outbound Transfer Service, I want to evaluate a transaction's risk profile so that I can intercept and block fraudulent transfers before they are settled.

* **Why this priority**: Fraud prevention. Protects bank assets by intercepting suspicious operations.
* **Independent Test**: POST a risk request detailing amount, target, and location. Verify the response contains a `riskScore` integer between 0 and 100.
* **Acceptance Scenarios**:
  1. **Given** a transactional metadata payload, **When** evaluated, **Then** the system applies risk rules and outputs a numerical score along with list of matched alert flags.

---

### User Story 3 - Agnostic Product Integration (Priority: P2)
As a Credit Card Onboarding or Investment Fund Service, I want to invoke the shared KYC and Risk services using standard REST client endpoints so that we reuse compliance logic without code duplication.

* **Why this priority**: Reusability. Decouples onboarding gates from payment-specific domains, reducing new product integration costs.
* **Independent Test**: Query KYC status from a simulated credit module using the shared client. Verify the DTO parses correctly.
* **Acceptance Scenarios**:
  1. **Given** any external product domain, **When** it maps to the shared REST Client client headers, **Then** the KYC/Risk response integrates cleanly.

---

## 2. Edge Cases

- **External Database Registry Outage**: The public registries that the KYC engine queries are offline.
  * *Resolution*: Define a fallback resilience policy. The REST client must return `PENDING_MANUAL_REVIEW` status and flag `externalRegistryOffline = true`, allowing onboarding to hold rather than fail.
- **Payload Schema Divergence**: Different business lines send different payload models to the Risk Engine.
  * *Resolution*: The Risk API must accept a generic, key-value Map structure (`metadata`) for custom fields, keeping the core payload schema (`entityId`, `amountInCents`, `clientIp`) standardized.

---

## 3. Requirements

### Functional Requirements
- **FR-001 (KYC Status Engine)**: The KYC service MUST evaluate customer tax IDs, returning statuses: `APPROVED`, `REJECTED`, `PENDING_MANUAL_REVIEW`.
- **FR-002 (Product-Agnostic Contract)**: The REST API MUST expose endpoints:
  * `GET /api/v1/kyc/verify/{taxId}`
  * `POST /api/v1/risk/evaluate`
  using generic data types (e.g., standard strings, long cents) instead of payment-specific objects.
- **FR-003 (Risk Score Math)**: The Risk service MUST return a `riskScore` integer bounded between `0` (no risk) and `100` (highest risk).
- **FR-004 (REST Client Adapter)**: Inbound clients MUST integrate using type-safe MicroProfile REST Clients, insulating core domains from direct JDBC database connections.
- **FR-005 (Audit Logging)**: The service MUST log every KYC check and Risk evaluation result into database audits for regulatory compliance.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities / DTOs

- **KycVerificationStatus**:
  * `taxId`: String (Primary Key).
  * `status`: Enum (`APPROVED`, `REJECTED`, `PENDING_MANUAL_REVIEW`).
  * `riskRating`: String (LOW, MEDIUM, HIGH).
  * `verifiedAt`: OffsetDateTime.

- **RiskEvaluationRequest**:
  * `entityId`: String (Universal identifier, UUID/Tax ID).
  * `amountInCents`: Long (nullable).
  * `sourceIp`: String.
  * `additionalMetadata`: Map<String, String>.

- **RiskEvaluationResponse**:
  * `riskScore`: Integer (0-100).
  * `action`: Enum (`ALLOW`, `CHALLENGE`, `BLOCK`).
  * `triggeredRules`: List<String>.
  * `evaluatedAt`: OffsetDateTime.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: API query latency for verified profiles remains under 10ms when utilizing cache indices.
- **SC-002**: Standardized generic maps successfully parse custom metadata from credit, card, and investment client flows.
- **SC-003**: In the event of a downstream query timeout, the system degrades gracefully without thread blockages.
