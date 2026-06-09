<!-- SPECKIT START -->

# Atomant-Integration Specification Kit

This project contains the **Integration Module** serving as the distributed communication hub for outbound accounting file generation, inbound webhook reconciliation, cross-module notifications, and external service orchestration.

## Specification Files

For complete context about this module, project structure, engineering principles, and business requirements, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Core architectural rules for distributed communication microservice
   - Microservice responsibilities: Accounting file export, webhook reconciliation, notification distribution
   - Java NIO file operations for memory-efficient large report generation
   - Webhook security: Stateless processing, signature verification, asynchronous handling
   - Virtual Thread (@RunOnVirtualThread) for non-blocking webhook reception
   - Structural layers: API, domain, infrastructure packages

2. **[spec.md](./.specify/memory/spec.md)**
   - OpenAPI 3.0 contract for export and webhook endpoints
   - Java NIO file generation service (AccountingExportService)
   - Java Records for immutable webhook payload structures
   - JAX-RS controller implementations with Virtual Threads
   - Example request/response payloads

3. **[business-rules.md](./.specify/memory/business-rules.md)**
   - Outbound integrations: Accounting ERP, GL systems, compliance systems, CVM, tax authorities
   - Daily accounting export: CSV format, file naming, retention, validation, < 5s target
   - GL journal entry export: Debit/credit formatting, account mapping, balanced entry validation
   - Monthly regulatory export: CVM XML/CSV, digital signature (ICP-Brasil), monthly schedule
   - Email notification service: SendGrid/AWS SES, template variables, retry policy (3x backoff), bounce handling
   - SMS notification service: Twilio/AWS SNS, 160-char limit, OTP/alert categories, rate limiting (3/day max)
   - Message queue integration: Kafka/RabbitMQ subscriptions from 6 source modules (calculator, investment, payment, auth, audit, file-processor)
   - Event topics: DAILY_FEE_CALCULATED, INVESTMENT_CREATED, PAYMENT_CONFIRMED, AUDIT_RECORD_CREATED, FILE_PROCESSED, DATA_CORRECTION
   - Webhook reconciliation endpoint: HMAC-SHA256 signature verification, 202 Accepted response, async background processing
   - Webhook payload: batchId, status (ACCEPTED/REJECTED/PARTIAL), timestamp, error details with field-level diagnostics
   - Idempotent webhook processing: Deduplicate by batchId; allow retry within 24h window
   - External service orchestration: Circuit breaker (50% threshold, 30s open), retry (3x exponential), timeout (5s conn, 10s read, 30s total)
   - Data transformation: BigDecimal → centavos, ISO 8601 dates, CPF/CNPJ normalization, fund code uppercase
   - Graceful degradation: Service unavailable → retry queue (24h), then manual intervention
   - Notification categories: Investment confirmation, redemption approval/executed, NAV published, compliance alert, system alert, MFA challenge, account statement
   - Performance targets: Webhook < 100ms, email < 50ms, SMS < 100ms, daily export < 5s, regulatory export < 30s
   - Concurrency: 10 webhook threads (Virtual), 3 message consumers, 20-thread pools (email/SMS), 5 file writers
   - Rate limiting: Email 600/min (SendGrid), SMS 100/sec (Twilio), external APIs 1000-100/min per service
   - Data validation: Type validation, business logic checks (NAV > 0, quotas > 0), sanity checks (NAV change < 10%)
   - Error classification: Transient (retry), persistent (log+DLQ), fatal (escalate)
   - Compliance: CVM (20-year audit trail, daily export by 8 PM, monthly report 1st business day), BACEN (holidays, SELIC/CDI rates), tax authority (quarterly withholding), LGPD (encryption, data deletion)
   - Webhook signature verification: HMAC-SHA256(payload, secret), constant-time comparison, 5-min timestamp window for replay prevention
   - Reconciliation storage: Table with batch_id (PK), status, error_count, payload_hash, 10-year retention, S3 archive after 2y
   - Notification logging: Table with event_type, status (QUEUED/SENT/FAILED/BOUNCED), delivery timestamp, 2-year retention then archive
   - API endpoint specifications: Export accounting, journal entries, regulatory data, webhook reception, query status, trigger email notifications
   - Testing requirements: Unit (100% coverage), integration (end-to-end), performance (1000 concurrent webhooks, 10k emails/min), resilience (service failures, circuit breaker)
   - Monitoring: Success rates >98%, latency P95/P99, fallback usage <5%, cache hit >90%, circuit breaker state, signature verification failures

## Technology Stack

- **Language**: Java 25
- **Framework**: Quarkus with CDI
- **Build**: Maven
- **REST**: JAX-RS with Virtual Threads (@RunOnVirtualThread)
- **File I/O**: Java NIO (Files API, BufferedWriter, FileChannel)
- **Messaging**: Kafka or RabbitMQ for event subscription
- **Email**: SendGrid or AWS SES
- **SMS**: Twilio or AWS SNS
- **Resilience**: MicroProfile (CircuitBreaker, Retry, Timeout, Fallback)
- **Testing**: JUnit 5, Quarkus Test Framework, REST Assured
- **Caching**: In-Memory (Caffeine) for idempotency tracking
- **Database**: PostgreSQL for reconciliation and notification audit logs
- **Security**: HMAC-SHA256 signature verification, TLS 1.3
- **File Storage**: AWS S3 or equivalent (hot/cold archival)

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build Docker image
docker build -t atomant-integration:latest .

# Push to Docker Hub
docker push joelmaykon/atomant-integration:latest
```

## Architecture Overview

The Integration Module serves four primary functions:

### 1. Outbound File Export
- Generates daily CSV accounting files (1000+ agencies in <5s)
- Creates GL journal entry exports for external ERP systems
- Produces monthly regulatory reports for CVM/tax authorities with digital signatures
- Uses Java NIO for memory-efficient streaming writes
- Implements file naming conventions and retention policies

### 2. Inbound Webhook Reconciliation
- Exposes secured callback endpoints for payment processors and accounting systems
- Validates HMAC-SHA256 signatures and timestamps (replay protection)
- Processes webhooks asynchronously (return 202 immediately)
- Implements idempotent processing (deduplicate by batchId)
- Stores reconciliation records for audit trail (10-year retention)

### 3. Cross-Module Notification Distribution
- Subscribes to Kafka/RabbitMQ events from 6 source modules
- Triggers email notifications via SendGrid/AWS SES (delivery <50ms)
- Triggers SMS notifications via Twilio/AWS SNS (delivery <100ms)
- Implements retry policies with exponential backoff
- Supports bounce/complaint handling for email list maintenance

### 4. External Service Orchestration
- Manages connections to payment processors, email providers, SMS gateways, CVM systems
- Implements circuit breaker pattern (50% failure threshold, 30s open)
- Retry logic with exponential backoff (1s, 2s, 4s) + jitter
- Graceful degradation (queue messages for later delivery if service unavailable)
- Health monitoring with automated alerts

## Authorized Outbound Integrations

| Destination | Type | Purpose | Auth Method | Rate Limit |
|-----------|------|---------|------------|-----------|
| External Accounting ERP | File Export | Daily fee consolidation, GL entries | API Key + mTLS | 1000/day |
| Email Provider (SendGrid) | Notification | Investment/redemption confirmations, alerts | API Key | 600/min |
| SMS Gateway (Twilio) | Notification | OTP, account alerts, redemption notifications | API Key | 100/sec |
| Payment Processor | Webhook Callback | Reconciliation status, settlement confirmation | HMAC-SHA256 | - |
| CVM Reporting System | File Export | Monthly NAV aggregates, fee disclosures | Digital signature | 1/day |
| Tax Authority System | File Export | Quarterly withholding tax details | Digital signature | 4/year |
| Compliance System | File Export | AML/KYC audit logs, transaction reports | mTLS | 1/day |
| GL System | File Export | Real-time journal entry posting | OAuth 2.0 | 1000/day |

## Event Subscriptions (Inbound Message Queue)

| Source Module | Event Topics | Consumption | Use Case |
|---------------|-------------|-----------|----------|
| atomant-calculator | DAILY_FEE_CALCULATED | Async, <100ms latency preferred | Trigger investor email notification; log to audit |
| atomant-investment | INVESTMENT_CREATED, INVESTMENT_APPROVED, SETTLEMENT_CONFIRMED | Async, <100ms latency preferred | Send investment confirmation email; prepare GL entry |
| atomant-payment | PAYMENT_INITIATED, PAYMENT_CONFIRMED, PAYMENT_FAILED, RECONCILIATION_NEEDED | Async, <100ms latency critical | Send SMS notification; reconcile with bank; trigger webhook |
| atomant-audit | AUDIT_RECORD_CREATED, FEE_CALCULATION_LOGGED, DATA_CORRECTION_RECORDED | Async, ~1-10s latency acceptable | Aggregate for daily export; update audit trail |
| atomant-file-processor | FILE_PROCESSED, VALIDATION_FAILED, POSITIONS_LOADED | Async, <500ms latency acceptable | Send confirmation to fund manager; flag issues |
| atomant-auth | USER_LOGIN_ATTEMPT, MFA_CHALLENGE_SENT, AUTH_FAILURE_DETECTED | Async, <200ms latency acceptable | Send MFA OTP via SMS; alert on suspicious activity |

## Daily Accounting File Export

### Output Format: CSV (Comma-Separated Values)

```
branch_code,agency_id,calculation_date,total_fees_cents,investor_count,quota_transactions,nav_value_cents,data_quality_flag
AG001,AG001_001,2026-06-08,150000000,2500,12500,105000000,LIVE
AG002,AG002_001,2026-06-08,125000000,1800,10200,95000000,LIVE
AG003,AG003_001,2026-06-08,100000000,1200,8500,85000000,CACHED
```

### Column Definitions

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| branch_code | String(5) | Agency identifier (uppercase) | AG001 |
| agency_id | String(15) | Full agency identifier | AG001_001 |
| calculation_date | Date | ISO 8601 format | 2026-06-08 |
| total_fees_cents | Integer | Centavos (no decimals) | 150000000 |
| investor_count | Integer | Unique investors | 2500 |
| quota_transactions | Integer | Buy/sell transactions | 12500 |
| nav_value_cents | Integer | Aggregate NAV (centavos) | 105000000 |
| data_quality_flag | Enum | LIVE, CACHED, 1_DAY_LAG, ESTIMATED, FALLBACK | LIVE |

### File Lifecycle

- **Generation Time**: Daily 6:00 PM (after calculator finishes at 5:30 PM)
- **File Name**: `accounting-fees-{YYYY-MM-DD}.csv`
- **Encoding**: UTF-8
- **Storage**: AWS S3 (hot storage 30 days, cold storage after 30d)
- **Retention**: 10 years minimum (regulatory requirement)
- **Deletion**: Auto-delete after 20 years

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Fetch data from atomant-audit | < 2s | Streaming reads, avoid OOM |
| Parse & transform data | < 1s | BigDecimal to centavos conversion |
| Write to file (NIO streaming) | < 1s | BufferedWriter with 8KB buffer |
| Upload to S3 | < 2s | Multipart upload for reliability |
| Total pipeline | < 5s | End-to-end |

---

## GL Journal Entry Export

### Purpose
Generate GL journal entries for external ERP systems (SAP, NetSuite, Oracle) from daily fee calculations

### Output Format: JSON Array

```json
{
  "entryId": "uuid",
  "entryDate": "2026-06-08",
  "description": "Daily fund management fees - AG001",
  "entries": [
    {
      "account": "4150",
      "debit": 15000000,
      "credit": 0,
      "costCenter": "AG001",
      "description": "Daily fee - Fund ABC (6/8/2026)"
    },
    {
      "account": "1050",
      "debit": 0,
      "credit": 15000000,
      "costCenter": "AG001",
      "description": "Daily fee receivable - Fund ABC (6/8/2026)"
    }
  ]
}
```

### GL Account Mapping

| Account | Type | Description |
|---------|------|-------------|
| 4150 | Revenue | Fund management fees (income) |
| 1050 | Asset | Fees receivable (current assets) |
| 1200 | Asset | Cash/bank accounts |
| 2050 | Liability | Fees payable to administrators |
| 5100 | Expense | Operating expenses (allocated) |

### Validation Rules

- Total debit = Total credit (balanced entries)
- Account codes exist in GL chart of accounts
- Amount precision: 2 decimal places (centavos)
- Entry date is valid business day (per BACEN calendar)

### Performance Target
Export 100k+ entries in <10 seconds

---

## Email Notification Service

### Supported Templates

| Template | Trigger | Recipients | Priority |
|----------|---------|-----------|----------|
| investment-confirmation | Investment order approved | Investor email | High |
| redemption-approval | Redemption request approved | Investor email | High |
| redemption-executed | Redemption amount transferred | Investor email | High |
| nav-daily-report | Daily NAV calculated | Admin email | Medium |
| compliance-alert | Sanctions match detected | Compliance officer | Critical |
| statement-monthly | Scheduled monthly | Investor email | Medium |

### Template Variables

```
${investorName}          // "João Silva"
${fundName}              // "ABC Fund Plus"
${transactionAmount}     // "10,000.00"
${transactionDate}       // "2026-06-08"
${quotaQuantity}         // "952.38"
${quotaPrice}            // "10.50"
${processingId}          // "TRX-20260608-001234"
${estimatedDelivery}     // "2026-06-10"
${fallbackContact}       // "support@atomant.com.br"
${unsubscribeUrl}        // "https://atomant.com.br/unsubscribe?token=..."
```

### Retry Policy

| Attempt | Delay | Condition |
|---------|-------|-----------|
| 1st | Immediate | Initial send |
| 2nd | 1 second | Transient failure (timeout, 5xx) |
| 3rd | 2 seconds | Continued failure |
| 4th | 4 seconds | Continued failure |
| Final | Queue for manual | After 4 failures; retry via scheduled job |

### Bounce Handling

- **Permanent Bounce** (invalid email): Remove from mailing list after 2 occurrences
- **Complaint** (marked as spam): Remove from mailing list immediately
- **Soft Bounce** (temporary): Retry up to 3 times; flag if repeated

### Performance Target
Send <50ms per email; batch 1000 emails in <5 seconds

---

## SMS Notification Service

### Supported Message Types

| Type | Content | Validity | Rate Limit |
|------|---------|----------|-----------|
| OTP | 6-digit code | 5 minutes | 5 per day |
| Account Alert | New device login, large transaction | N/A | 3 per day |
| Redemption Executed | Fund redemption completion | N/A | 3 per day |
| System Alert | Maintenance, outage notification | N/A | 1 per event |

### Message Template Examples

```
OTP: ${code} - Válido por 5 minutos. Não compartilhe este código.

Alerta: Nova tentativa de acesso à sua conta. Clique: ${confirmUrl}

Seu resgate de R$ ${amount} foi processado. Previsão: ${deliveryDate}.
```

### SMS Rules

- **Character Limit**: 160 characters (single SMS)
- **Language**: Portuguese (PT-BR)
- **Opt-Out**: Support "reply STOP" to unsubscribe
- **Quiet Hours**: No SMS between 9:00 PM - 8:00 AM (local time)
- **Rate Limits**: Max 3 per investor per day (OTP: 5/day, unlimited critical alerts)

### Delivery Status Tracking

- Track status: SENT, DELIVERED, FAILED, BOUNCED
- Log delivery failures; retry for transient errors
- Alert operations if failure rate > 5%

### Performance Target
Send <100ms per SMS; batch 1000 SMS in <10 seconds

---

## Webhook Reconciliation Endpoint

### Signature Verification (HMAC-SHA256)

**Process**:
1. Extract raw JSON payload body
2. Extract signature header: `X-Signature: sha256={hex_hash}`
3. Compute: `HMAC-SHA256(payload, secret) = computed_hash`
4. Compare: `constant_time_comparison(computed_hash, provided_hash)`
5. **Reject (401 UNAUTHORIZED)** if mismatch

**Replay Attack Prevention**:
- Extract `timestamp` from payload
- Verify within ±5 minutes of current time
- Reject if outside window (avoid replay)

### Idempotent Processing

- **Deduplication Key**: `batchId` (primary key)
- **Storage**: Reconciliation database with (batch_id, ledger_batch_id, timestamp)
- **Response**:
  - **202 Accepted**: New batch; process asynchronously
  - **409 Conflict**: Duplicate within 24h window; do not reprocess
  - After 24h: Treat as new request; allow reprocessing

### Payload Structure

```json
{
  "batchId": "uuid",
  "status": "ACCEPTED|REJECTED|PARTIAL",
  "timestamp": "2026-06-08T18:30:25Z",
  "message": "Batch processed successfully",
  "recordCount": 1250,
  "errors": [
    {
      "recordIndex": 5,
      "field": "branch_code",
      "reason": "INVALID_FORMAT",
      "value": "XXXXX"
    }
  ],
  "processingTime": 2500,
  "ledgerBatchId": "ext-batch-98765"
}
```

### Background Processing Flow

```
1. Webhook received (HTTP handler)
   ↓ (202 Accepted returned immediately)
2. Validate signature & timestamp
   ↓
3. Check for duplicate (batchId in cache/DB)
   ↓ (if duplicate: skip, return 409)
4. Queue to async processor
   ↓
5. Background: Parse errors, update reconciliation status
   ↓
6. Update atomant-audit with reconciliation result
   ↓
7. Publish RECONCILIATION_COMPLETED event to message queue
```

### Performance Target
- Reception & validation: <100ms
- Background processing: <5 seconds per batch (up to 1000 records)

---

## Circuit Breaker & Resilience Patterns

### Circuit Breaker Configuration

| State | Condition | Behavior | Transition |
|-------|-----------|----------|-----------|
| **CLOSED** | Service healthy | Pass requests through | OPEN if ≥50% failures in 10s window |
| **OPEN** | Service unhealthy | Fail fast (reject immediately) | HALF_OPEN after 30s delay |
| **HALF_OPEN** | Testing recovery | Allow 1 test request | CLOSED if success; OPEN if failure |

### Retry Policy

| Scenario | Retries | Backoff | Max Duration |
|----------|---------|---------|--------------|
| Transient error (timeout, 5xx) | 3 | 1s, 2s, 4s + jitter ±200ms | 7s total |
| Rate limit (429) | 5 | Exponential | 30s total |
| Database lock timeout | 3 | 1s, 2s, 4s | 7s total |

### Fallback Strategy

- **Email send failure**: Queue message for retry (24h window); fallback to SMS if configured
- **SMS send failure**: Queue message for retry (24h window); no fallback
- **Service unavailable**: Circuit OPEN → use cached response or skip notification
- **All retries exhausted**: Alert operations; manual intervention required

---

## External Service Configuration

| Service | Endpoint | Timeout | Rate Limit | Circuit Breaker |
|---------|----------|---------|-----------|-----------------|
| SendGrid | api.sendgrid.com | 10s | 600/min | 50% threshold, 30s open |
| Twilio | api.twilio.com | 10s | 100/sec | 50% threshold, 30s open |
| Payment API | pix.banco.com.br | 30s | 1000/min | 50% threshold, 30s open |
| CVM Upload | cvm.gov.br | 60s | 10/day | 50% threshold, 30s open |

---

## Notification Audit Log

### Database Table: `notification_events`

```sql
CREATE TABLE notification_events (
  id UUID PRIMARY KEY,
  event_type ENUM ('EMAIL', 'SMS', 'PUSH', 'WEBHOOK'),
  investor_id VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  template_name VARCHAR(100),
  status ENUM ('QUEUED', 'SENT', 'FAILED', 'BOUNCED'),
  send_timestamp TIMESTAMP,
  delivery_timestamp TIMESTAMP,
  retry_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX (investor_id, created_at),
  INDEX (status, created_at)
);
```

**Retention Policy**:
- Keep: 2 years
- Archive: After 2 years (compress to S3)
- Delete: After 7 years

---

## Reconciliation Audit Log

### Database Table: `webhook_reconciliations`

```sql
CREATE TABLE webhook_reconciliations (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL UNIQUE,
  ledger_batch_id VARCHAR(100),
  status ENUM ('ACCEPTED', 'REJECTED', 'PARTIAL', 'PROCESSING'),
  received_timestamp TIMESTAMP NOT NULL,
  processed_timestamp TIMESTAMP,
  error_count INTEGER DEFAULT 0,
  message TEXT,
  payload_hash CHAR(64),  -- SHA256 hex
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX (batch_id),
  INDEX (received_timestamp)
);
```

**Retention Policy**:
- Keep: 10 years (regulatory requirement)
- Archive: After 2 years (compress to S3)
- Delete: After 20 years

---

## Data Transformation Examples

### BigDecimal to Centavos Conversion

```
Input:  1234.56 (BigDecimal, scale 2)
Output: 123456 (Integer, centavos)

Input:  0.01 (BigDecimal, scale 2)
Output: 1 (Integer, centavos)

Input:  0.001 (BigDecimal, scale 3)
Output: 0 (Integer, rounded down per HALF_EVEN)
```

### Date Normalization

```
Input:  "08/06/2026" (DD/MM/YYYY)
Output: "2026-06-08" (ISO 8601)

Input:  "20260608" (YYYYMMDD)
Output: "2026-06-08" (ISO 8601)

Input:  "2026-06-08" (Already ISO)
Output: "2026-06-08" (No change)
```

### CPF/CNPJ Formatting

**File Export** (no formatting):
- CPF: `12345678901` (11 digits)
- CNPJ: `00000000000100` (14 digits)

**Display** (formatted):
- CPF: `123.456.789-01`
- CNPJ: `00.000.000/0001-00`

---

## API Endpoints Summary

| Method | Path | Purpose | Role | Response |
|--------|------|---------|------|----------|
| GET | `/api/v1/integration/export/accounting` | Daily CSV export | ACCOUNTING_EXPORT | 200 CSV |
| POST | `/api/v1/integration/export/journal-entries` | GL entries export | ACCOUNTING_EXPORT | 200 JSON |
| POST | `/api/v1/integration/export/regulatory` | CVM/tax export | COMPLIANCE_OFFICER | 202 Job |
| POST | `/api/v1/integration/reconciliation` | Webhook callback | Public (signature auth) | 202 Accepted |
| GET | `/api/v1/integration/reconciliation/{batchId}` | Query status | ACCOUNTING_EXPORT | 200 JSON |
| POST | `/api/v1/integration/notify/email` | Trigger email | NOTIFICATIONS_ADMIN | 202 Accepted |

---

## Concurrency & Resource Allocation

| Resource | Configuration | Notes |
|----------|---------------|-------|
| Webhook receiver threads | 10 (Virtual Threads) | Each receives 1 webhook; async processing |
| Message consumer threads | 3 | Kafka/RabbitMQ consumer group; auto-scaling 1-3 |
| Email sender thread pool | Core 5, Max 20, Queue 100 | Batch processing; fallback to queue if full |
| SMS sender thread pool | Core 5, Max 20, Queue 100 | Batch processing; fallback to queue if full |
| File writer threads | 5 | One per export type; prevent concurrent writes |
| External API client pool | 50 | Connection pool per service; reuse connections |

---

## Monitoring & Alerting

### Key Metrics & Thresholds

| Metric | Target | Alert | Check Interval |
|--------|--------|-------|-----------------|
| Webhook success rate | >95% | <95% | 5 min |
| Webhook latency P95 | <500ms | >500ms | 5 min |
| Email send success | >95% | <95% | 5 min |
| SMS send success | >95% | <95% | 5 min |
| Reconciliation lag | <5s | >5s | 5 min |
| External service availability | >95% | <95% | 5 min |
| Daily export success | 100% | Any failure | 1 min |
| Signature verification failures | <5/min | >5/min | 1 min |

---

## Testing Coverage

### Unit Tests (Target: 100% coverage)
- Notification service (email/SMS template rendering)
- Data transformation (BigDecimal conversion, date parsing, CPF/CNPJ formatting)
- Webhook signature verification
- Idempotent processing logic
- Error classification and retry logic

### Integration Tests
- End-to-end email delivery (mock SendGrid API)
- End-to-end SMS delivery (mock Twilio API)
- Webhook reception and background processing
- Message queue consumption and event handling
- File export with data validation

### Performance Tests
- 1000 concurrent webhooks
- 10k emails/minute throughput
- 1k SMS/minute throughput
- File export with 1000+ agencies
- Latency profiling (P95, P99)

### Resilience Tests
- Email provider down (test queue fallback)
- SMS provider down (test retry policy)
- External API timeout (test circuit breaker)
- Database unavailable (test graceful degradation)
- Signature validation failure (test 401 rejection)

---

## Security & Data Protection

- **Webhook Authentication**: HMAC-SHA256 signature with 5-min timestamp window
- **Transport Security**: TLS 1.3 for all outbound requests
- **Secret Management**: Secrets stored in vault (HashiCorp Vault or AWS Secrets Manager)
- **Secret Rotation**: Every 6 months; support old+new during rotation
- **Access Control**: Role-based access (ACCOUNTING_EXPORT, COMPLIANCE_OFFICER, NOTIFICATIONS_ADMIN)
- **Audit Trail**: All webhook receptions, exports, and notifications logged for 2-10 years
- **Data Encryption**: Notification content encrypted at rest; exported files encrypted in transit
- **LGPD Compliance**: Support data deletion requests (90-day SLA); PII not logged in message bodies

---

## Disaster Recovery

| Scenario | Recovery Method | RTO | RPO |
|----------|-----------------|-----|-----|
| Webhook replay | Resend from database queue | <1h | 0 |
| Missing notifications | Replay from message queue (24h retention) | <1h | 24h |
| Failed exports | Re-generate from atomant-audit source data | <2h | <1h |
| Database corruption | Restore from daily backup; replay logs | <4h | <1h |

---

## Key Design Patterns

- **Asynchronous Webhook Reception**: Return 202 immediately; process in background (Virtual Threads)
- **Circuit Breaker**: Protect against cascading failures from external services
- **Retry with Backoff**: Exponential backoff + jitter for transient failures
- **Fallback**: Queue messages for later delivery; graceful degradation
- **Idempotent Processing**: Deduplicate by batch ID; safe to replay requests
- **Saga Pattern**: Async event distribution across modules via message queue
- **Java NIO Streaming**: Memory-efficient file writes (avoid OOM on large exports)

---

## Implementation Roadmap

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Weeks 1-2 | Core file export, webhook reconciliation, signature validation |
| Phase 2 | Weeks 3-4 | Email/SMS notification services, retry queuing |
| Phase 3 | Weeks 5-6 | Message queue integration, event-driven triggers |
| Phase 4 | Weeks 7-8 | External service orchestration, circuit breaker |
| Phase 5 | Weeks 9-10 | Compliance & regulatory exports (CVM, tax authority) |
| Phase 6 | Weeks 11-12 | Testing, optimization, security audit, production readiness |

---

## Summary

The **Integration Module** is the critical outbound connector enabling atomant to reliably distribute data to external systems (accounting, banking, compliance, CVM/tax authorities) while reliably receiving webhook callbacks for reconciliation. Key guarantees:

1. **Reliable Data Export**: Daily accounting files with 99.9% accuracy; regulatory reports with digital signatures
2. **Secure Webhooks**: HMAC-SHA256 signature verification; idempotent processing; replay attack prevention
3. **Resilient Notifications**: Email/SMS delivery with retry queuing and graceful fallback
4. **Compliance**: CVM, BACEN, tax authority reporting; 10-20 year audit trails
5. **Performance**: <100ms webhook, <50ms email, <100ms SMS, <5s daily export
6. **Scalability**: Handle 1000s of concurrent webhooks; 10k emails/min; 1k SMS/min

<!-- SPECKIT END -->
