# Business Rules: Authentication & Authorization for Investment & Payment Process

## Overview

This document defines the business rules governing user authentication, authorization, and credential management for the `atomant-auth` microservice within the investment and payment processing lifecycle. These rules ensure secure access control, regulatory compliance, and audit traceability.

---

## 1. User Authentication Business Rules

### 1.1 User Registration & Account Creation

#### Registration Types
1. **Individual Investors (Retail Quota Holders)**
   - CPF (Brazilian tax ID) as primary identifier
   - Full name, email, phone number required
   - Date of birth must be present (verify age ≥ 18 years)
   - Residential address with postal code validation

2. **Institutional Investors (Corporate Quota Holders)**
   - CNPJ (Corporate tax ID) as primary identifier
   - Legal entity name and registered office address
   - Authorized representative(s) must provide full credentials
   - Board approval documentation required (scanned and stored)

3. **Administrators & Fund Managers**
   - Email-based registration with organization domain validation
   - Department/role assignment by HR system
   - Requires organization-level onboarding

#### Pre-Registration Validation
- **Identity Verification**:
  - Individual: Verify CPF against Brazil's Receiver General (RFB) database
  - Institution: Verify CNPJ against CNPJ National Registry
  - Deceased check: Flag accounts associated with deceased individuals (via Social Security database integration)

- **Sanctions & Regulatory Checks**:
  - Screen against OFAC Specially Designated Nationals (SDN) list
  - Screen against EU consolidated sanctions list
  - Screen against Brazil's Central Bank (BCB) blacklist
  - **Failure Handling**: Account creation blocked; user notified with reason

- **Email Verification**:
  - Confirmation email sent with one-time token (valid for 24 hours)
  - Account inactive until email confirmed
  - Resend limit: 5 attempts per 24 hours

### 1.2 Password Requirements & Management

#### Password Policy
- **Minimum Length**: 12 characters
- **Complexity Rules**:
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 digit (0-9)
  - At least 1 special character (!@#$%^&*)
- **Password History**: Cannot reuse last 5 passwords
- **Expiration**: 90 days for high-privilege accounts (fund managers, admins)
  - Retail investors: No expiration (subject to change management)
  - Warning notification sent at 7 days before expiration

#### Password Reset & Recovery
- **Self-Service Reset**:
  - Reset link sent to registered email
  - Link valid for 30 minutes only
  - Cannot reset more than 5 times per 24 hours (rate limiting)
  - After 3 consecutive failed reset attempts: Account locked for 15 minutes

- **Admin-Initiated Reset**:
  - Compliance officer or administrator can initiate
  - User receives temporary password via email (12-character auto-generated)
  - Temporary password valid for 2 hours
  - User must change password on first login after reset
  - Admin action logged with timestamp and justification

### 1.3 Login & Session Management

#### Login Authentication
1. **Standard Login Flow**:
   - Username/email + password submission
   - Brute force protection:
     - Max 5 failed attempts per 15 minutes → Account locked for 15 minutes
     - Max 20 failed attempts per 24 hours → Account locked for 24 hours (manual unlock required)
   - Successful login triggers:
     - Session token generation (JWT)
     - Access log creation (IP address, device fingerprint, timestamp)
     - Multi-factor authentication (MFA) prompt if configured

2. **Login Step-Up Authentication** (for high-risk operations):
   - Required for investment > R$ 500,000
   - Required for first-time payment to new bank account
   - Re-authenticates user within same session with fresh credential verification

#### Session Token Management
- **Token Type**: JWT (JSON Web Token) with RS256 signature
- **Token Expiration**:
  - Standard session: 30 minutes of inactivity
  - Extended session (retail): 8 hours absolute maximum
  - Extended session (fund managers): 4 hours absolute maximum
- **Token Refresh**:
  - Refresh tokens valid for 30 days
  - Refresh token rotation on each use (new token issued, old revoked)
  - Max 10 concurrent refresh tokens per user

- **Session Termination**:
  - Automatic logout after inactivity timeout
  - Manual logout clears session token and invalidates refresh token
  - Concurrent session limit: 3 active sessions per user
  - Older sessions terminated when limit exceeded (user notified)

#### Device & Location Anomaly Detection
- **Device Fingerprinting**: Hash of (User-Agent, IP address, accept-language)
- **Anomaly Triggers**:
  - Login from new device → MFA required
  - Login from geographically impossible location (e.g., Brazil → US in < 1 hour) → Challenge required
  - Login from VPN/proxy → Flagged; may require escalated verification for high-risk operations
- **Risk Scoring**: Cumulative risk assessment determines MFA requirement

### 1.4 Multi-Factor Authentication (MFA)

#### MFA Enrollment & Configuration
- **Mandatory For**:
  - All institutional investors (CNPJ accounts)
  - All administrative and fund manager accounts
  - Individual investors (optional, encouraged)

- **Supported Methods**:
  1. **Time-Based OTP (TOTP)**: Google Authenticator, Authy, etc.
     - 6-digit code, 30-second window
     - Grace period: ±1 window (60 seconds total)
  2. **SMS OTP**: SMS-delivered 6-digit code (10-minute validity)
  3. **Email OTP**: Email-delivered link or 6-digit code (10-minute validity)
  4. **Push Notification**: Quarkus-integrated mobile app notification

#### MFA Triggers
- **Always Required For**:
  - Institutional investor logins
  - Admin/fund manager logins
  - Investment > R$ 500,000
  - Payment > R$ 250,000
  - Changes to registration (email, phone, bank account)

- **Conditional**:
  - Device anomaly (new device, geographically impossible login)
  - High-risk transaction patterns
  - Account security event (password change, session timeout after long inactivity)

#### Backup Codes
- Generated during MFA enrollment
- 10 single-use codes, each 8 characters
- Must be stored securely by user
- Each used code invalidated immediately
- All backup codes regenerated if 8+ codes used

---

## 2. Authorization & Access Control Business Rules

### 2.1 Role-Based Access Control (RBAC)

#### Predefined Roles

**Individual Investor (INVESTOR_RETAIL)**
- View own portfolio and transaction history
- Initiate investment requests (subject to daily/monthly limits)
- Request redemptions
- Change own password
- View account statements
- **Cannot**: Approve transactions, access other investor data, modify fund structures

**Institutional Investor (INVESTOR_INSTITUTIONAL)**
- View own portfolio and authorized representative accounts
- Initiate investment/redemption requests (same limits as retail)
- Authorize transactions (if multiple authorized reps assigned)
- View detailed fund performance metrics
- Export transaction reports (CSV, PDF)
- Assign/revoke access to authorized representatives
- **Cannot**: Modify fund rules, approve other institutions' transactions

**Fund Manager (FUND_MANAGER)**
- View all fund metrics and performance KPIs
- Publish daily NAV calculations
- Approve/reject individual investment requests > threshold
- Approve/reject payment requests > threshold
- Declare distributions and manage fund operations
- Generate regulatory reports
- Manage fee schedules (review/approval required from compliance)
- View aggregate investor data (anonymized portfolio stats)
- **Cannot**: Transfer funds, modify investor account details

**Compliance Officer (COMPLIANCE_OFFICER)**
- Approve investment/payment requests requiring compliance review
- Manage AML/sanctions screening rules
- Review and respond to regulatory inquiries
- Access audit logs and transaction histories
- Modify KYC/AML rules and thresholds
- Approve fee schedule changes
- Generate compliance reports
- **Cannot**: Approve transactions < threshold (escalation only), modify fund NAV

**System Administrator (ADMIN_SYSTEM)**
- Full system access (no approval gates)
- User account lifecycle management (create, disable, reset password)
- Audit log viewing and export
- System configuration and feature flags
- Database backup/restore coordination
- **Limited**: Cannot approve individual investor transactions (segregation of duties)

**Audit Officer (AUDIT_OFFICER)**
- Read-only access to all audit logs
- Export audit trails and compliance reports
- View historical transaction details
- Generate audit-certified reports for regulators
- **Cannot**: Modify any system state, approve transactions

#### Authorization Enforcement Points
- Every API endpoint decorated with `@RolesAllowed("ROLE_NAME")` annotation
- Every sensitive operation (investment, payment, fee approval) gated by role check
- Failed authorization attempt logged with user ID, attempted resource, timestamp

### 2.2 Attribute-Based Access Control (ABAC)

Supplementary rules beyond roles:

1. **Fund-Level Access**
   - User can only view/trade funds explicitly assigned to their investor account
   - Fund manager can only manage assigned fund(s)
   - Multi-fund managers require explicit assignment per fund

2. **Quota Holder Isolation**
   - Institutional investors can only access authorized representative accounts
   - Authorized reps verified via delegation table (`representative_delegation`)
   - Cross-quota-holder access logged and requires documented business justification

3. **Amount-Based Thresholds**
   - Investment > R$ 500,000 → Fund manager approval required
   - Investment > R$ 1,000,000 → Compliance officer approval also required
   - Payment > R$ 250,000 → Fund manager approval required
   - Payment > R$ 500,000 → Compliance officer approval required
   - These thresholds may vary by fund type (configurable)

4. **Time-Based Access**
   - Fund-specific trading hours enforced:
     - Normal funds: T-11:00 AM to T-4:00 PM (São Paulo time)
     - Institutional funds: T-7:00 AM to T-6:00 PM
     - Out-of-hours submissions queued for next business day
   - End-of-month lock period: Last 2 business days, no new investments accepted

### 2.3 Segregation of Duties (SOD)

Critical segregation rules enforced:

| Operation | Initiator | Approver | Exception |
|-----------|-----------|----------|-----------|
| Investment Initiation | Investor | Fund Manager | ≤ R$ 100k: auto-approved |
| Investment Approval | Fund Manager | Compliance Officer | ≤ R$ 500k: FM approval only |
| Payment Initiation | Investor | Fund Manager | ≤ R$ 50k: auto-approved |
| Payment Approval | Fund Manager | Compliance Officer | ≤ R$ 250k: FM approval only |
| Fee Schedule Change | Fund Manager | Compliance + Admin | 2-of-3 approval |
| AML Rule Changes | Compliance | Admin + Audit Officer | 2-of-3 approval |
| System Admin Action | System Admin | N/A | Logged, cannot self-approve |

**Conflict Detection**: System prevents the same user from initiating AND approving related transactions.

---

## 3. Credential & Secret Management

### 3.1 Token Issuance & Validation

#### JWT Token Structure
```
Header:   { "alg": "RS256", "typ": "JWT", "kid": "key-id-v1" }
Payload:  {
  "sub": "user-uuid",
  "username": "investor@example.com",
  "roles": ["INVESTOR_RETAIL"],
  "fund_ids": ["FUND001", "FUND002"],
  "iat": 1718000000,
  "exp": 1718001800,
  "iss": "https://atomant-auth.example.com",
  "aud": "atomant-api"
}
Signature: HMAC-SHA256(base64url(header) + '.' + base64url(payload), private-key)
```

#### Token Validation Rules
- Signature verification mandatory on every request
- Issuer validation: Must match configured issuer
- Audience validation: Must include expected service
- Expiration check: Token must not be expired
- Algorithm check: Must be RS256 (or configured secure algorithm)
- If validation fails: Reject request with `401 Unauthorized`

#### Token Revocation List
- Tokens added to revocation list (Redis-backed) when:
  - User password changed
  - Account disabled/locked
  - Session explicitly terminated
  - User role modified
- TTL for revocation list entry = token expiration time + 5 minutes
- Revocation check cached (30-second TTL) for performance

### 3.2 API Key Management (for Service-to-Service)

#### API Key Issuance
- Generated for integration partners and internal microservices
- Format: `api_key_` + 64-character random hex string
- Stored hashed in database (bcrypt with 12 rounds)
- Associated with fixed scopes (e.g., `audit:read`, `payment:write`)

#### API Key Security
- Never logged in plaintext
- Can only be viewed once at generation time
- Rotation recommended every 90 days
- Revocation immediately disables key
- Rate limiting applied per API key: 1000 requests per minute

#### API Key Validation
- Header: `X-API-Key: <api_key>`
- Lookup in key store, verify hash, check expiration and scopes
- Failed validation logged and monitored

### 3.3 OAuth2/OpenID Connect Integration

#### External Identity Provider (future-ready)
- Support for Keycloak or other OIDC providers
- Federated login via Keycloak (see `angular/auth-keycloak` for UI)
- Claim mapping:
  - `sub` → user UUID
  - `preferred_username` → username
  - `email` → email address
  - Custom claim `fund_access` → array of fund IDs

#### Token Exchange
- No credentials stored locally for federated users
- All token validation delegated to OIDC provider
- Periodic token refresh using refresh tokens
- Session management independent of OIDC token lifetime

---

## 4. Audit & Compliance for Authentication

### 4.1 Authentication Event Logging

Every authentication event persisted to immutable audit log:

```json
{
  "event_id": "uuid",
  "timestamp": "2026-06-08T14:30:00Z",
  "event_type": "LOGIN_SUCCESS | LOGIN_FAILURE | MFA_CHALLENGE | PASSWORD_RESET | TOKEN_REFRESH",
  "user_id": "uuid",
  "username": "investor@example.com",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "device_fingerprint": "hash",
  "mfa_method_used": "TOTP | SMS | EMAIL | PUSH | NONE",
  "location": "São Paulo, Brazil",
  "risk_score": 25,
  "status": "SUCCESS | FAILED_INVALID_PASSWORD | FAILED_ACCOUNT_LOCKED | FAILED_MFA",
  "reason_code": "string",
  "session_token_id": "token-hash"
}
```

**Retention Policy**: 10 years minimum (regulatory requirement)

### 4.2 Account Security Events

Triggers automatic alerts to user and compliance:

- **Password Changed**: User notified, 24-hour reversal window
- **Account Locked**: Lock reason, unlock time, manual unlock required after threshold
- **MFA Disabled**: Compliance notified; 48-hour re-enable grace period
- **Unauthorized Access Attempt**: Multiple failed logins, geographic anomalies
- **Permission Changed**: Notification of role/scope modifications

### 4.3 Regulatory Compliance Audits

- **CVM (Securities Commission)**: Authority to audit all investor login records, transaction approvals
- **BCB (Central Bank)**: Authority to audit payment authorization flows
- **COAF (Financial Intelligence Unit)**: Authority to audit AML/sanctions screening logs
- All queries logged with accessing officer ID and justification

---

## 5. Permission Management for Investment & Payment Operations

### 5.1 Investment Operation Permissions

| Operation | INVESTOR_RETAIL | INVESTOR_INST | FUND_MGR | COMPLIANCE | ADMIN |
|-----------|:---:|:---:|:---:|:---:|:---:|
| View own investments | ✓ | ✓ | - | - | ✓ |
| Initiate investment | ✓ | ✓ | - | - | ✓ |
| Approve investment | - | - | ✓ | (threshold) | ✓ |
| Reject investment | - | - | ✓ | (threshold) | ✓ |
| View all investments | - | - | ✓ | ✓ | ✓ |
| Reverse investment | - | - | ✓ | ✓ | ✓ |

### 5.2 Payment Operation Permissions

| Operation | INVESTOR_RETAIL | INVESTOR_INST | FUND_MGR | COMPLIANCE | ADMIN |
|-----------|:---:|:---:|:---:|:---:|:---:|
| View own payments | ✓ | ✓ | - | - | ✓ |
| Initiate payment | ✓ | ✓ | - | - | ✓ |
| Approve payment | - | - | ✓ | (threshold) | ✓ |
| Reject payment | - | - | ✓ | (threshold) | ✓ |
| View all payments | - | - | ✓ | ✓ | ✓ |
| Reconcile payment | - | - | - | ✓ | ✓ |

---

## 6. Error Handling & Security Responses

### 6.1 Authentication Failure Responses

**Invalid Credentials**:
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid username or password. Attempt 1 of 5.",
  "attemptsRemaining": 4,
  "accountLockedAfterAttempts": 5
}
```

**Account Locked**:
```json
{
  "code": "ACCOUNT_LOCKED",
  "message": "Account locked due to failed login attempts.",
  "unlockTime": "2026-06-08T15:15:00Z"
}
```

**MFA Required**:
```json
{
  "code": "MFA_REQUIRED",
  "message": "Multi-factor authentication required.",
  "mfaMethods": ["TOTP", "SMS"],
  "sessionToken": "temp-session-uuid"
}
```

### 6.2 Authorization Failure Responses

**Insufficient Permissions**:
```json
{
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "User lacks required role: FUND_MANAGER",
  "requiredRole": "FUND_MANAGER",
  "userRoles": ["INVESTOR_RETAIL"]
}
```

**Threshold Exceeded**:
```json
{
  "code": "THRESHOLD_EXCEEDED",
  "message": "Investment amount exceeds user approval authority.",
  "requestedAmount": 750000,
  "userAuthority": 500000,
  "requiredApprover": "COMPLIANCE_OFFICER"
}
```

---

## 7. Performance & Scalability Considerations

### 7.1 Token Validation Caching
- JWT validation result cached for 5 minutes per token
- Cache invalidated on:
  - Role change event
  - Account disable event
  - Token revocation
- Cache backend: Redis (distributed cache for horizontal scaling)

### 7.2 Rate Limiting
- Login attempts: 5 per 15 minutes per IP address
- API requests: 1000 per minute per authenticated user
- API key requests: 1000 per minute per key
- Unauthenticated endpoints: 100 per minute per IP address

### 7.3 Session Scalability
- Session tokens stored in Redis (not in-memory JVM store)
- Refresh tokens stored in PostgreSQL with TTL index
- Device fingerprints cached with 24-hour TTL
- Supports stateless, horizontally scalable deployment

---

## 8. Integration Points & Dependencies

### 8.1 Dependencies
- **KYC/AML System**: Integration for sanctions screening (OFAC, EU lists, BCB)
- **Central Bank APIs**: CPF/CNPJ validation, deceased person registry
- **Email Service**: OTP delivery, password reset links (delegated to `atomant-integration`)
- **SMS Service**: OTP delivery for SMS-based MFA
- **Audit Module** (`atomant-audit`): All authentication events logged to audit trail

### 8.2 Dependent Modules
- **Investment Module** (`atomant-investment`): Authorization checks enforced before investment processing
- **Payment Module** (`atomant-payment`): Authorization checks enforced before payment approval
- **User Interface** (`angular/auth-keycloak`): Consumes authentication endpoints for login/logout
- **Mobile Apps**: Consume authentication APIs for device-based MFA

---

## 9. Testing & Quality Assurance

### 9.1 Test Coverage Requirements
- **Authentication endpoints**: 100% coverage of all authentication flows
- **Authorization checks**: 100% coverage of all role/permission combinations
- **MFA flows**: All MFA methods tested
- **Error scenarios**: All error codes and messages tested
- **Token validation**: Edge cases (expired, invalid signature, wrong issuer)
- **Rate limiting**: Burst traffic, concurrent requests
- **Session management**: Timeout, token refresh, concurrent sessions

### 9.2 Security Testing
- Brute force attack simulation
- SQL injection attempts on login fields
- CSRF token validation
- XSS payload filtering
- JWT signature bypass attempts
- Token tampering detection

