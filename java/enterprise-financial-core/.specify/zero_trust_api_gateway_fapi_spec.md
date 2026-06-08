# Feature Specification: Zero-Trust API Gateway & FAPI Security

**Feature Branch**: `zero-trust-api-gateway-fapi`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Zero-Trust API Gateway & FAPI Security' specification. Implement a centralized API Gateway to resolve the 'Spaghetti Mesh' integration anti-pattern. Enforce Zero-Trust security principles using mutual TLS (mTLS) for internal service-to-service communication. For external Open Banking integrations, implement Financial-grade APIs (FAPI) standards leveraging OAuth 2.0 and Proof Key for Code Exchange (PKCE). Stack: Quarkus, SmallRye JWT."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centralized mTLS Service Communication (Priority: P1)

As an Internal Microservice, I want to communicate with other backend services through the API Gateway using mutual TLS (mTLS) handshakes so that service identity and channel encryption are guaranteed.

* **Why this priority**: Core Zero-Trust security requirement. Insulates the internal microservice network from sniffing and spoofing attacks.
* **Independent Test**: Send an HTTP call from `atomant-payment` to `atomant-calculator` without a client certificate. Verify the connection is terminated during TLS handshake. Send with a valid certificate, verify connection is established.
* **Acceptance Scenarios**:

1. **Given** a request sent to the API Gateway, **When** mTLS socket handshake fails or the client certificate is missing, **Then** the gateway rejects the connection before routing.

---

### User Story 2 - External FAPI Authorization Code Flow with PKCE (Priority: P1)

As an External Open Banking Client, I want to request access tokens using the FAPI OAuth 2.0 flow with Proof Key for Code Exchange (PKCE) so that our authorization code cannot be intercepted.

* **Why this priority**: Required FAPI compliance for secure client authentication in external banking integrations.
* **Independent Test**: Initiate OAuth flow with `code_challenge_method = S256` and a code challenge. Retrieve authorization code, request token by supplying `code_verifier`. Verify token is issued successfully.
* **Acceptance Scenarios**:

1. **Given** a token request on `/oauth/token`, **When** the `code_verifier` does not hash to match the original `code_challenge`, **Then** the request is rejected with `400 Bad Request` and error `invalid_grant`.

---

### User Story 3 - JWT Verification via SmallRye (Priority: P1)

As an API Resource Controller, I want the system to validate incoming Bearer access tokens using SmallRye JWT so that expired or tampered tokens are rejected before matching JAX-RS paths.

* **Why this priority**: Standard token security validation, preventing access to privileged resources by unauthenticated requests.
* **Independent Test**: Send a GET request with an expired JWT token. Verify a `401 Unauthorized` response. Send a modified token signature, verify `401`.
* **Acceptance Scenarios**:

1. **Given** a resource path protected by JWT validation, **When** the signature is invalid or `exp` timestamp has passed, **Then** the REST engine returns `401 Unauthorized`.

---

### Edge Cases

- **PKCE Missing parameters**: An external client initiates the flow but omits `code_challenge` or sets `code_challenge_method = plain`.
  * *Resolution*: FAPI standards prohibit `plain` PKCE methods. The server MUST reject the authorization request immediately with `400 Bad Request` if `code_challenge` is missing or method is not set to `S256`.
- **Certificate Revocation Check Lag**: A compromised certificate needs to be blocked before the daily CRL list updates.
  * *Resolution*: Enforce Online Certificate Status Protocol (OCSP) stapling at the gateway layer for real-time certificate status checks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (mTLS Enforcement)**: The API Gateway MUST enforce TLS 1.3 with mutual authentication (mTLS) for all internal service-to-service network hops.
- **FR-002 (FAPI OAuth 2.0 PKCE)**: The authorization server MUST enforce PKCE code challenges utilizing the SHA-256 algorithm (`S256`) for all client authorization codes.
- **FR-003 (Access Token Cryptography)**: Access tokens issued MUST be cryptographically signed JSON Web Tokens (JWT) conforming to RFC 7519.
- **FR-004 (SmallRye JWT Validation)**: Internal resource microservices MUST integrate `quarkus-smallrye-jwt` to validate token signatures and verify standard claims (`sub`, `iss`, `aud`, `exp`, `roles`).
- **FR-005 (Security Auditing)**: The gateway MUST emit structured JSON logs for all failed handshakes, expired tokens, and invalid PKCE challenges.
- **FR-006 (Sanitization)**: Zero internal proprietary bank-specific naming conventions are permitted.

### Key Entities

- **TokenExchangeRequest**:
  * `grantType`: String (strictly `authorization_code`).
  * `code`: String (not null).
  * `redirectUri`: String (not null).
  * `clientId`: String (not null).
  * `codeVerifier`: String (not null, min 43, max 128 chars).

- **TokenExchangeResponse**:
  * `accessToken`: String (JWT format).
  * `tokenType`: String (strictly `Bearer`).
  * `expiresIn`: Long (e.g. 900 seconds).
  * `scope`: String.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Handshake attempts with a negotiated protocol lower than TLS 1.3 are terminated at the socket layer.
- **SC-002**: Token requests utilizing `plain` PKCE methods are blocked with 100% accuracy.
- **SC-003**: The API gateway routes valid, mTLS-authenticated requests with less than 2ms of overhead latency.

## Assumptions

- **ASM-001**: Internal microservices are deployed within a private virtual network (VPC) where mTLS is enforced.
- **ASM-002**: External Open Banking clients register their public keys for client authentication (e.g. Private Key JWT).
- **ASM-003**: An identity provider (IdP) supporting FAPI-compliant OAuth 2.0 PKCE and mTLS is integrated or deployed alongside the gateway.
- **ASM-004**: The API Gateway manages routing and passes validated JWT claims to downstream microservices in a standardized HTTP header.
