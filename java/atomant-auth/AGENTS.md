<!-- SPECKIT START -->

# Atomant-Auth Specification Kit

This project contains the **Authentication & Authorization Microservice** for a financial system managing investment and payment processing.

## Specification Files

For complete context about this module, project structure, engineering principles, and business requirements, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Core engineering principles and code quality standards
   - Java 25, Quarkus CDI, and modern Java idioms (Records, Pattern Matching)
   - SOLID principles and clean code guidelines
   - Test-driven development requirements (80%+ line coverage)
   - REST API design conventions and HTTP status codes
   - Native compilation constraints and performance targets
   - <100ms startup time, <50MB memory footprint

2. **[business-rules.md](./.specify/memory/business-rules.md)**
   - User authentication workflows (registration, login, password management)
   - Multi-factor authentication (MFA) requirements and methods
   - Role-Based Access Control (RBAC) with 6 predefined roles
   - Attribute-Based Access Control (ABAC) for fine-grained authorization
   - Segregation of duties (SOD) for investment and payment operations
   - JWT token lifecycle, validation, and revocation
   - API key management for service-to-service integration
   - Account security events and regulatory compliance audits
   - Audit logging for all authentication events (10-year retention)
   - Rate limiting, session scalability, and caching strategies

## Technology Stack

- **Language**: Java 25
- **Framework**: Quarkus with Panache ORM
- **Build**: Maven
- **Testing**: JUnit 5, Quarkus Test Framework, REST Assured
- **Database**: PostgreSQL
- **Caching**: Redis (for token validation, session management)
- **Deployment**: Docker, Kubernetes (Knative/FaaS)
- **Testing Coverage**: Minimum 80% line coverage, 75% branch coverage

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build native executable
./mvnw package -Dnative

# Build Docker image
docker build -t joelmaykon/atomant-auth:latest .

# Push to Docker Hub
docker tag joelmaykon/atomant-auth:latest joelmaykon/atomant-auth:1.0.0
docker push joelmaykon/atomant-auth:latest

# Deploy to Kubernetes
kubectl apply -f manifest/greeting-service.yaml
```

## Architecture Overview

The Authentication & Authorization Microservice serves four primary functions:

### 1. User Authentication
- Individual investor (CPF-based) and institutional investor (CNPJ-based) registration
- Email verification and KYC/AML compliance checks
- Brute-force protection and account lockdown rules
- Password management with 12-character complexity requirements
- Multi-factor authentication (TOTP, SMS, Email, Push)

### 2. Session & Token Management
- JWT token issuance with RS256 signature
- 30-minute inactivity timeout, 8-hour absolute max for retail
- Refresh token rotation on each use (30-day validity)
- Concurrent session limits (max 3 per user)
- Device fingerprinting and geolocation anomaly detection

### 3. Authorization & Access Control
- 6 role-based access patterns (Investor Retail, Investor Institutional, Fund Manager, Compliance, Admin, Audit)
- Amount-based approval thresholds (e.g., >R$ 500k requires Fund Manager)
- Segregation of duties enforcement (initiator ≠ approver)
- Fund-level and quota-holder isolation
- Time-based trading hour enforcement

### 4. Audit & Compliance
- Immutable authentication event logging (10-year retention)
- Regulatory authority audit trails (CVM, BCB, COAF access logs)
- Account security event notifications
- Token revocation list management
- Rate limiting and abuse detection

## Integration Points

- **Upstream**: Receives credential submission from Angular frontend (`angular/auth-keycloak`)
- **Downstream**: Provides JWT tokens to `atomant-audit`, `atomant-payment`, `atomant-investment` modules
- **External**: Integrates with KYC/AML system, Central Bank APIs, Email/SMS services
- **Federated**: Ready for Keycloak OIDC integration for enterprise SSO

## Package Structure

```
org.acme.auth
├── api                          # REST endpoints (@Path) and Funqy functions
├── domain                       # Domain models (User, Role, Permission, Token)
├── application.service          # Business logic (TokenService, AuthenticationService)
├── application.dto              # Request/Response DTOs (LoginRequest, TokenResponse)
├── infrastructure.persistence   # JPA entities, repositories, custom queries
├── infrastructure.external      # External API clients (KYC, Email, SMS, Bank)
├── exception                    # Custom exceptions and ExceptionMappers
└── security                     # Token validation, crypto utilities, signature verification
```

## Database Schema Strategy

- **Users Table**: CPF/CNPJ as natural key, password hashed (bcrypt), encrypted sensitive fields
- **Sessions Table**: JWT tokens, refresh tokens, expiration time, device fingerprint
- **Roles & Permissions**: Normalized role definitions and fine-grained permission sets
- **Audit Log Table**: Immutable append-only authentication event records
- **Token Revocation Table**: Redis-backed with TTL cleanup

## Performance & Scalability

- **Token Validation**: Cached for 5 minutes (Redis)
- **Rate Limiting**: 5 logins per 15 minutes per IP, 1000 API req/min per user
- **Session Storage**: Redis (stateless, horizontally scalable)
- **Native Startup**: Target <100ms startup time for Knative serverless scaling
- **Memory Footprint**: Target <50MB RSS at startup

## Security Highlights

- **Brute Force Protection**: Account lockdown after 5 failed attempts in 15 minutes
- **MFA Enforcement**: Mandatory for institutional investors and admins; optional for retail
- **Segregation of Duties**: Different users must initiate vs. approve transactions
- **Token Security**: RS256 signature, revocation list, periodic rotation
- **Audit Trail**: Every authentication event logged immutably for 10 years
- **Regulatory Compliance**: KYC/AML screening, sanctions list checks, regulatory audit access

## Testing Requirements

- Minimum **80%** line coverage
- Minimum **75%** branch coverage
- **100%** coverage for critical business paths (token verification, permission checks)
- Native integration tests to ensure GraalVM compatibility
- Security testing: brute force, SQL injection, CSRF, XSS, JWT tampering

<!-- SPECKIT END -->
