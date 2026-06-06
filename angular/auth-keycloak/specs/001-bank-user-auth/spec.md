# Feature Specification: Keycloak Bank User Authentication

**Feature Branch**: `001-bank-user-auth`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "Build an application that can help me authicated my user in my bank. This application use security high level full context and using key cloak https://github.com/mauriciovigolo/keycloak-angular this frontend is responsability login, change password, signup and home my application of investiments. This implements security patterns and if not can implements create suggestion for exemple backend future implementation with java and quarkus"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Authentication and Session Management (Priority: P1)

As a bank customer, I want to securely log in using Keycloak OIDC so that I can access my investments dashboard and profile securely.

**Why this priority**: Core bank application access must be restricted to authenticated users to protect sensitive financial data.

**Independent Test**: Verify that trying to access `/home` redirects to the Keycloak login screen, and successfully logging in redirects back to `/home` with valid tokens.

**Acceptance Scenarios**:

1. **Given** a user who is not authenticated, **When** they attempt to access `/home`, **Then** the application MUST redirect them immediately to the Keycloak login page.
2. **Given** a user on the Keycloak login page, **When** they enter valid credentials, **Then** they MUST be redirected to `/home` and their authenticated session details (username, roles) MUST be displayed.
3. **Given** an active authenticated session, **When** the Access Token expires, **Then** the application MUST silently refresh the token in the background using the Refresh Token without interrupting the user.

---

### User Story 2 - Account Registration / Signup (Priority: P2)

As a new customer, I want to register a new account on the identity provider so that I can begin using the bank's services.

**Why this priority**: Enables self-service user acquisition while delegating security-sensitive credential storage entirely to Keycloak.

**Independent Test**: Verify that clicking "Register" on the landing page redirects to the Keycloak sign-up form, and submitting it successfully authenticates and routes the user back.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they click "Sign Up", **Then** the application MUST redirect them to the Keycloak Registration flow page.
2. **Given** a registration form in Keycloak, **When** the user completes registration, **Then** they MUST be automatically logged in and redirected back to `/home`.

---

### User Story 3 - Password Self-Service Management (Priority: P2)

As an authenticated customer, I want to securely change my password within the application context so that I can maintain my account security.

**Why this priority**: Critical security capability ensuring users can rotate credentials easily.

**Independent Test**: Verify that clicking "Change Password" in the application settings redirects the user to the Keycloak password update form, and upon completion, returns them to the application.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/home`, **When** they click "Change Password", **Then** the application MUST redirect them to the Keycloak Update Password flow page.
2. **Given** a password update page, **When** the user submits the new password, **Then** they MUST be redirected back to the investments application and prompted to log in with their new credentials.

---

### User Story 4 - Investments Dashboard Access (Priority: P1)

As an authenticated customer, I want to view my investments dashboard overview so that I can monitor my assets.

**Why this priority**: Represents the primary business capability of the application that must be restricted to verified bank customers.

**Independent Test**: Verify that only users with the `bank-customer` role can view dashboard charts and portfolios.

**Acceptance Scenarios**:

1. **Given** an authenticated user with `bank-customer` role, **When** they access `/home`, **Then** they MUST see their total investment balance, asset list, and monthly return metrics.
2. **Given** an authenticated user WITHOUT the `bank-customer` role, **When** they access `/home**, **Then** they MUST be redirected to an "Access Denied" page.

### Edge Cases

- **Token Refresh Failure**: If silent refresh fails due to network loss or refresh token expiration, the application MUST automatically clear local session states, notify the user with a friendly error, and redirect to the login screen.
- **Back Button After Logout**: If a user clicks the browser's back button after logging out, the application MUST verify session invalidation and prevent them from seeing cached dashboard pages.
- **Concurrent Keycloak Sessions**: If the user's session is terminated from another device or administratively, the next local request MUST trigger an immediate redirect to login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST utilize the `keycloak-angular` wrapper to initialize the Keycloak JS SDK at startup during the Angular `APP_INITIALIZER` phase.
- **FR-002**: The application MUST implement a standard route guard (extending `KeycloakAuthGuard`) to protect `/home` and other dashboard paths.
- **FR-003**: The application MUST enable Authorization Code Flow with PKCE (Proof Key for Code Exchange) as the OAuth2 flow.
- **FR-004**: The application MUST append the active Bearer token in the HTTP Authorization headers for all outgoing API requests using an Angular HTTP Interceptor.
- **FR-005**: Keycloak configuration (Realm, Client ID, URL) MUST be injected at runtime using environment variables replaced in the container configuration (e.g., via a container entrypoint or a reverse proxy serving the dynamic config).
- **FR-006**: The registration process MUST require email verification; Keycloak MUST send an activation link to the user's email address which must be verified before the account is activated for login.

### Key Entities

- **AuthenticatedSession**: Holds the active token details, expiration time, roles, and profile information.
- **InvestmentPortfolio**: The structure containing the financial portfolio details, including asset list, current values, and transaction history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of routes under `/home` are protected, resulting in 0 unauthenticated access attempts succeeding.
- **SC-002**: Initial Keycloak bootstrap and session check overhead adds less than 400ms to the application startup time.
- **SC-003**: All outgoing API requests to backend endpoints include valid JWT Bearer tokens.
- **SC-004**: Password changes and new registrations are handled in under 2 minutes of user time.

## Future Backend Architecture Suggestions (Quarkus/Java)

To support this frontend authentication setup in a high-security banking environment, the future backend service SHOULD implement:
1. **Quarkus OIDC Extension**: Leverage `quarkus-oidc` to validate the incoming JWT Bearer tokens directly against the Keycloak realm.
2. **Role-Based Access Control (RBAC)**: Use `@RolesAllowed` annotations in Quarkus JAX-RS resources to enforce authorization matching the Keycloak roles (e.g. `bank-customer`).
3. **Keycloak Admin Client**: Use `quarkus-keycloak-admin-client` to manage users, fetch session audits, or trigger administrative actions from the backend.
4. **Token Propagation**: Enable OIDC Token Propagation if the Quarkus backend calls other microservices.

## Assumptions

- Keycloak server (v24+) is configured and accessible over HTTPS.
- The Angular client is registered in Keycloak as a public client with PKCE enabled.
- The standard user role in Keycloak for access is `bank-customer`.
