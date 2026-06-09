# Business Rules: Atomant-Integration Module

**System**: Investment & Payment Processing Platform
**Module**: atomant-integration (Integration Module)
**Purpose**: Outbound accounting file generation, inbound webhook reconciliation, cross-module notifications, and external service orchestration
**Regulatory Context**: CVM accounting disclosure, BACEN reporting requirements, tax authority file exports

---

## 1. Module Overview & Responsibilities

The **Integration Module** serves as the distributed communication hub for the atomant financial system:

1. **Outbound Accounting File Export**: Generates standardized CSV/TXT files containing aggregated fee data, NAV calculations, and positions for external accounting systems (ERP, GL systems).
2. **Inbound Webhook Reconciliation**: Exposes secured callback endpoints to receive asynchronous confirmations from external ledgers, reconciliation systems, and payment processors.
3. **Cross-Module Event Distribution**: Subscribes to message queues (Kafka/RabbitMQ) to consume events from atomant-audit, atomant-calculator, atomant-file-processor, atomant-payment, and atomant-auth.
4. **Email & SMS Notifications**: Triggers email/SMS notifications based on business events (investment confirmations, redemption approvals, compliance alerts).
5. **External Service Orchestration**: Manages orchestration of third-party integrations (email providers, SMS gateways, payment processors, audit log submitters).
6. **Data Transformation & Mapping**: Transforms domain models into external system formats (accounting standards, regulatory reporting templates).

---

## 2. Authorized Data Sources & Outbound Destinations

### Inbound Message Queues (Event Subscription)

| Module | Event Topics | Subscription Model | Priority |
|--------|-------------|------------------|----------|
| atomant-audit | AUDIT_RECORD_CREATED, FEE_CALCULATION_LOGGED, DATA_CORRECTION_RECORDED | Async; ~1-10s latency acceptable | Medium |
| atomant-calculator | DAILY_FEE_CALCULATED, QUOTA_APPORTIONMENT_COMPLETED, REDEMPTION_PROCESSED | Async; <100ms latency preferred | High |
| atomant-file-processor | FILE_PROCESSED, VALIDATION_FAILED, POSITIONS_LOADED | Async; <500ms latency acceptable | Medium |
| atomant-payment | PAYMENT_INITIATED, PAYMENT_CONFIRMED, PAYMENT_FAILED, RECONCILIATION_NEEDED | Async; <100ms latency critical | Critical |
| atomant-auth | USER_LOGIN_ATTEMPT, MFA_CHALLENGE_SENT, AUTH_FAILURE_DETECTED | Async; <200ms latency acceptable | Medium |
| atomant-investment | INVESTMENT_CREATED, INVESTMENT_APPROVED, SETTLEMENT_CONFIRMED | Async; <100ms latency preferred | High |

### Outbound Integrations

| Destination | Type | Purpose | Frequency | Auth Method |
|-----------|------|---------|-----------|------------|
| External Accounting ERP | File Export | Daily fee consolidation, GL journal entries | Daily 6:00 PM | API Key + mTLS |
| External GL System | File Export | Real-time transaction posting | On-demand | OAuth 2.0 |
| Email Provider (SendGrid/AWS SES) | Notification | Investment confirmations, redemption approvals, alerts | Real-time | API Key |
| SMS Gateway (Twilio/AWS SNS) | Notification | OTP delivery, account alerts, critical notifications | Real-time | API Key |
| Payment Processor (Bank/B3) | Webhook Callback | Reconciliation status, settlement confirmation | Asynchronous | HMAC-SHA256 signature |
| Compliance System | File Export | AML/KYC audit logs, transaction reports | Daily 7:00 PM | mTLS certificate |
| CVM Reporting System | File Export | Monthly NAV aggregates, fee disclosures | Monthly 8:00 AM on 1st | Digital signature (ICP-Brasil) |
| Tax Authority System | File Export | Withholding tax details, IPCA adjustments | Quarterly | Digital signature |

---

## 3. Outbound Accounting File Generation

### Daily Accounting Export (`/api/v1/integration/export/accounting`)

**Trigger**: Scheduled job 6:00 PM daily, or on-demand via REST endpoint with ACCOUNTING_EXPORT role

**Input Data Source**: Aggregated daily fees from atomant-audit (via cache or direct query to atomant-audit database)

**File Format**: Comma-separated values (CSV) with UTF-8 encoding

**CSV Structure**:
```
branch_code,agency_id,calculation_date,total_fees_cents,investor_count,quota_transactions,nav_value_cents,data_quality_flag
AG001,AG001_001,2026-06-08,150000000,2500,12500,105000000,LIVE
AG002,AG002_001,2026-06-08,125000000,1800,10200,95000000,LIVE
...
```

**Column Definitions**:
- `branch_code`: 4-5 digit agency identifier (uppercase alphanumeric)
- `agency_id`: Full agency identifier (15 chars max)
- `calculation_date`: ISO 8601 format YYYY-MM-DD
- `total_fees_cents`: Aggregate daily fees in centavos (no decimals; Integer)
- `investor_count`: Count of unique investors in agency
- `quota_transactions`: Count of quota buy/sell transactions
- `nav_value_cents`: Aggregate NAV in centavos (no decimals; Integer)
- `data_quality_flag`: LIVE, CACHED, 1_DAY_LAG, ESTIMATED, FALLBACK

**File Naming Convention**: `accounting-fees-{YYYY-MM-DD}.csv`

**File Retention & Archival**:
- Keep current month in hot storage (fast access)
- Archive to S3 after 30 days (compressed .gz format)
- Retain for 10 years minimum (regulatory requirement)
- Auto-delete after 20 years

**Error Handling**:
- If atomant-audit service unreachable: Retry 3x with exponential backoff (1s, 2s, 4s)
- If no data available: Generate empty CSV with headers only; log warning; alert operations
- If file system full: Alert operations; fail gracefully without corrupting existing exports

**Data Validation**:
- All numeric fields must be ≥ 0
- Branch code must exist in master data
- Calculation date must be business day (or work-around available)
- Total row count must match expected agency count ±5% (sanity check)

**Performance Target**: Generate 1000+ agencies in < 5 seconds

---

### GL Journal Entry Export (`/api/v1/integration/export/journal-entries`)

**Trigger**: On-demand via REST endpoint (ACCOUNTING_EXPORT role) or scheduled daily 6:15 PM

**Purpose**: Export daily fee calculations as GL journal entries for external ERP (SAP, NetSuite, etc.)

**Output Format**: JSON array or CSV per accounting system requirements

**GL Entry Structure** (JSON):
```json
{
  "entryId": "uuid",
  "entryDate": "2026-06-08",
  "description": "Daily fund management fees - AG001",
  "entries": [
    {
      "account": "4150",  // Fee revenue account
      "debit": 15000000,  // in cents
      "credit": 0,
      "costCenter": "AG001",
      "description": "Daily fee - Fund ABC (6/8/2026)"
    },
    {
      "account": "1050",  // Cash/receivable account
      "debit": 0,
      "credit": 15000000,  // in cents
      "costCenter": "AG001",
      "description": "Daily fee receivable - Fund ABC (6/8/2026)"
    }
  ]
}
```

**GL Account Mapping**:
| Account | Type | Description |
|---------|------|-------------|
| 4150 | Revenue | Fund management fees (income) |
| 1050 | Asset | Fees receivable (current assets) |
| 1200 | Asset | Cash/bank accounts |
| 2050 | Liability | Fees payable to administrators |
| 5100 | Expense | Operating expenses (allocated) |

**Data Validation**:
- Debit total must equal credit total (balanced entries)
- Account codes must exist in GL chart of accounts
- Amount precision: 2 decimal places (centavos)
- Entry date must be valid business day

**Performance Target**: Export 100k+ entries in < 10 seconds

---

### Monthly Regulatory Export (`/api/v1/integration/export/regulatory`)

**Trigger**: Scheduled on 1st business day of month at 8:00 AM

**Purpose**: Export aggregated NAV, fee data, and investor metrics to CVM reporting system

**Output Format**: XML or structured CSV per CVM specification

**Data Included**:
- Fund-level NAV (daily for month)
- Aggregate investor positions (by fund)
- Fee percentages and amounts (by fund)
- Investor count (by fund, by investor type)
- Compliance metrics (anti-money laundering reports, sanctions screening results)

**File Naming**: `nav-monthly-{YYYY-MM}.xml` or `nav-monthly-{YYYY-MM}.csv`

**Data Validation**:
- NAV values must be positive and within 5% of prior month
- Fee percentages must match published prospectus
- Investor count must be >= daily count for any day in month
- Digital signature required (X.509 certificate, ICP-Brasil)

**Signing & Encryption**:
- Sign XML with private key (kept in secure vault)
- Encrypt with recipient's public certificate
- Include timestamp and signer certificate chain

**Delivery Method**: SFTP or encrypted HTTPS POST

**Performance Target**: Generate monthly report in < 30 seconds

---

## 4. Inbound Webhook Reconciliation

### Webhook Reception Endpoint (`POST /api/v1/integration/reconciliation`)

**Purpose**: Receive asynchronous callbacks from payment processors, accounting systems, and external ledgers confirming batch ingestion or reconciliation status

**Authentication**: 
- HMAC-SHA256 signature verification (shared secret key)
- Signature header: `X-Signature: sha256={hmac_hex}`
- Verify: HMAC-SHA256(payload, secret) == provided signature

**Request Validation**:
- Signature must be valid (reject 401 UNAUTHORIZED if invalid)
- Payload must be well-formed JSON (reject 400 BAD REQUEST if malformed)
- Required fields: `batchId`, `status`, `timestamp`
- Timestamp must be within 5 minutes of current time (prevent replay attacks)

**Payload Structure**:
```json
{
  "batchId": "uuid",                    // Batch ID from outbound export
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
  "processingTime": 2500,  // milliseconds
  "ledgerBatchId": "ext-batch-98765"    // External system batch ID
}
```

**Response**:
- **202 Accepted**: Webhook received and queued for processing
- **400 Bad Request**: Payload validation failed (malformed JSON, missing fields)
- **401 Unauthorized**: Signature verification failed
- **409 Conflict**: Duplicate batch ID (idempotent processing)
- **500 Internal Server Error**: Processing failed; client should retry with exponential backoff

**Idempotent Processing**:
- Store received `batchId` + `ledgerBatchId` combination in database with timestamp
- If duplicate received within 24 hours: Return 409 Conflict (do not reprocess)
- After 24 hours: Treat as new request (allow reprocessing)
- Deduplicate based on `batchId` only (primary key)

**Asynchronous Processing**:
- Webhook handler receives payload and immediately returns 202 Accepted
- Queue reconciliation task to background processor (Virtual Thread or async processor)
- Update reconciliation status in atomant-audit module asynchronously
- Publish RECONCILIATION_COMPLETED event to message queue

**Error Classification**:
- **Validation Error** (INVALID_FORMAT, MISSING_FIELD, OUT_OF_RANGE): Log detailed error; flag record as failed; allow retry
- **Not Found Error** (BRANCH_NOT_FOUND, ACCOUNT_NOT_FOUND): Log warning; mark as unreconcilable; escalate to operations
- **Duplicate Error** (DUPLICATE_TRANSACTION, ALREADY_PROCESSED): Log info; suppress duplicate; continue processing
- **Fatal Error** (SYSTEM_ERROR, UNEXPECTED_ERROR): Log error; stop processing; notify operations team

**Performance Target**: Webhook reception < 100ms; background processing < 5 seconds

---

## 5. Email & SMS Notification System

### Notification Categories

| Category | Trigger | Recipients | Template |
|----------|---------|-----------|----------|
| Investment Confirmation | Investment order approved | Investor email | investment-confirmation.html |
| Redemption Approval | Redemption request approved | Investor email | redemption-approval.html |
| Redemption Executed | Redemption amount transferred | Investor email/SMS | redemption-executed.txt |
| NAV Published | Daily NAV calculated | Admin email | nav-daily-report.html |
| Compliance Alert | Sanctions match detected | Compliance officer email | compliance-alert.html |
| System Alert | Service degradation | Operations SMS | system-alert-critical.txt |
| MFA Challenge | Login attempt | Investor SMS/Email | mfa-challenge-{type}.txt |
| Account Statement | Monthly (scheduled) | Investor email | statement-monthly.html |

### Email Notification Service (`EmailNotificationService`)

**Provider**: SendGrid API or AWS SES

**Template Engine**: Freemarker or Velocity for variable substitution

**Template Variables**:
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
${unsubscribeUrl}        // URL to unsubscribe from notifications
```

**Email Sending Rules**:
- **Send Immediately**: Investment confirmations (< 5 seconds)
- **Send with Delay**: Account statements (batch processing, midnight job)
- **Send Conditionally**: Redemption executed (only if investor opted in)

**Retry Policy**:
- Failed send: Retry up to 3 times with exponential backoff (1s, 2s, 4s)
- After 3 failures: Queue for manual resend; alert operations
- Maximum retry window: 24 hours

**Email Address Validation**:
- Format validation (RFC 5322 basic checks)
- Domain validation (MX record lookup)
- Bounce handling: Remove from mailing list after 2 permanent bounces
- Complaint handling: Remove from mailing list if marked as spam

**Email Authentication**:
- SPF record: Verify sending domain
- DKIM signature: Sign all outbound emails
- DMARC policy: Enforce strict alignment

**Performance Target**: Send < 50ms per email; batch 1000 emails < 5 seconds

---

### SMS Notification Service (`SmsNotificationService`)

**Provider**: Twilio or AWS SNS

**Supported Message Types**:
- **OTP (One-Time Password)**: 6-digit code for MFA (valid 5 minutes)
- **Account Alert**: Critical account activity (login from new device, large transaction)
- **Redemption Executed**: Quick notification of fund redemption completion
- **System Alert**: Service maintenance window, outage notification

**Message Templates**:
```
OTP: ${code} - Válido por 5 minutos. Não compartilhe este código.

Alerta: Nova tentativa de acesso à sua conta. Clique para confirmar: ${confirmUrl}

Sua solicitação de resgate de R$ ${amount} foi processada. Previsão: ${deliveryDate}. Dúvidas: ${supportPhone}
```

**SMS Rules**:
- Maximum 160 characters (single SMS)
- Use Portuguese language (PT-BR)
- Include opt-out instructions (reply STOP to unsubscribe)
- Never send SMS between 9:00 PM and 8:00 AM (local time)

**Delivery Status Tracking**:
- Track delivery status from SMS provider (SENT, DELIVERED, FAILED, BOUNCED)
- Log delivery failures; attempt retry for transient failures
- Alert operations if sustained delivery failures (> 5% failure rate)

**Rate Limiting**:
- Maximum 3 SMS per investor per day (except OTP, which is unlimited but rate-limited to 5 per day)
- Maximum 100k SMS per day total
- Batch processing: Group SMS by provider; send in batches of 1000

**Performance Target**: Send < 100ms per SMS; batch 1000 SMS < 10 seconds

---

## 6. Message Queue Integration

### Event Subscription & Processing

**Message Broker**: Kafka or RabbitMQ

**Consumer Group**: `atomant-integration-consumer-1` (auto-scaling: 1-3 instances)

**Subscribed Topics**:

| Topic | Source Module | Event Type | Processing |
|-------|---------------|-----------|-----------|
| DAILY_FEE_CALCULATED | atomant-calculator | Fee calculation complete | Send investor email notification; log to atomant-audit |
| INVESTMENT_CREATED | atomant-investment | Investment order placed | Send confirmation email; prepare accounting entry |
| PAYMENT_CONFIRMED | atomant-payment | Payment processed successfully | Send SMS notification; reconcile with bank |
| AUDIT_RECORD_CREATED | atomant-audit | Fee logged | Aggregate for daily export file |
| FILE_PROCESSED | atomant-file-processor | Position file processed | Send confirmation to fund manager |
| DATA_CORRECTION | atomant-audit | Data correction recorded | Trigger recalculation email to admin |

**Message Format** (Avro or JSON):
```json
{
  "eventId": "uuid",
  "eventType": "DAILY_FEE_CALCULATED",
  "timestamp": "2026-06-08T16:30:25Z",
  "sourceModule": "atomant-calculator",
  "data": {
    "fundId": "FUND001",
    "calculationDate": "2026-06-08",
    "totalFee": 150000000,  // in cents
    "investorCount": 2500
  }
}
```

**Consumer Processing Rules**:
- **At-Least-Once Delivery**: Messages may be delivered multiple times; implement idempotency
- **Idempotent Key**: Use `eventId` to deduplicate (store processed IDs in local cache, 24-hour TTL)
- **Processing Timeout**: Max 30 seconds per message
- **Dead Letter Queue**: Route messages that fail 3 retries to DLQ for manual investigation

**Error Handling**:
- **Transient Error** (network timeout, temporary service unavailable): Retry immediately; then exponential backoff
- **Persistent Error** (malformed JSON, invalid data): Log error; send to DLQ; do NOT retry
- **Processing Error** (email send failed, database error): Retry up to 3 times; if persistent, alert operations

---

## 7. External Service Orchestration

### Service Mesh & Circuit Breaker

**Resilience Patterns**:
- **Circuit Breaker**: 50% failure rate threshold; open for 30s before half-open test
- **Retry**: 3 attempts with exponential backoff (1s, 2s, 4s) + jitter (±200ms)
- **Timeout**: 5s connection, 10s read, 30s total per request
- **Fallback**: Use cached response or skip notification if service unavailable

**Third-Party Service Configuration**:

| Service | Type | Endpoint | Rate Limit | Timeout | Fallback |
|---------|------|----------|-----------|---------|----------|
| SendGrid | Email API | api.sendgrid.com | 600/min | 10s | Retry queue (24h) |
| Twilio | SMS API | api.twilio.com | 100/sec | 10s | Retry queue (24h) |
| Bank Payment API | Payment | pix.banco.com.br | 1000/min | 30s | Manual reconciliation |
| CVM File Upload | Upload | cvm.gov.br | 10/day | 60s | Manual upload |
| GCP Cloud Storage | File Storage | storage.googleapis.com | 1000/min | 30s | Local file storage |

**Service Health Monitoring**:
- Probe each external service every 30 seconds
- Track success rate, latency, and error types
- Alert operations if success rate < 95% for 5 minutes
- Auto-disable notifications if service unavailable > 1 hour (batch and retry later)

---

## 8. Data Transformation & Mapping

### Domain to External Format Mapping

**BigDecimal Handling**:
- All financial amounts converted to centavos (cents) for file export
- Scale 2 for currency amounts in JSON/CSV
- Example: R$ 1,234.56 → 123456 (in file)

**Date/Time Handling**:
- All timestamps in ISO 8601 format: `2026-06-08T18:30:25Z`
- For file exports: Date as `YYYY-MM-DD`; Time as `HH:MM:SS`
- Timezone: Always Brazil/São Paulo (BRT/BRST with DST)

**CPF/CNPJ Formatting**:
- File export: No formatting (11-14 digits, no separators)
- Email display: Mask to `XXX.XXX.XXX-XX` (CPF) or `XX.XXX.XXX/0001-XX` (CNPJ)

**Fund Code Normalization**:
- File export: Uppercase (e.g., `ABC123`)
- Display: Original case preservation (e.g., `Abc123`)

---

## 9. Webhook Signature Verification & Security

### HMAC-SHA256 Signature Verification

**Secret Key Storage**:
- Store webhook secrets in secure vault (HashiCorp Vault or AWS Secrets Manager)
- Rotate keys every 6 months
- Support multiple keys during rotation (old + new)

**Verification Algorithm**:
```
1. Extract payload body (raw JSON string)
2. Extract signature header: X-Signature: sha256={hex_hash}
3. Compute: HMAC-SHA256(payload, secret) = computed_hash
4. Compare: computed_hash == provided_hash (constant-time comparison)
5. If mismatch: Reject with 401 UNAUTHORIZED
```

**Replay Attack Prevention**:
- Extract `timestamp` field from payload
- Verify timestamp is within 5 minutes of current time (±5 min tolerance)
- Reject if timestamp outside window

**Idempotent Retry Handling**:
- Client should retry with same signature if webhook fails
- Server: Deduplicate based on `batchId` (primary key)
- Store: `batchId`, `received_timestamp`, `processing_status` in database
- Return 409 Conflict if same `batchId` received within 24 hours

---

## 10. Data Persistence & Audit Trail

### Reconciliation Record Storage

**Table**: `webhook_reconciliations`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| batch_id | UUID | Batch ID from outbound export |
| ledger_batch_id | String | External system batch ID |
| status | Enum | ACCEPTED, REJECTED, PARTIAL, PROCESSING |
| received_timestamp | Timestamp | When webhook was received |
| processed_timestamp | Timestamp | When webhook was processed |
| error_count | Integer | Number of failed records |
| message | Text | Status message or error details |
| payload_hash | String | SHA256 of received payload (for audit) |
| retry_count | Integer | Number of processing retries |
| created_at | Timestamp | Record creation time |
| updated_at | Timestamp | Last update time |

**Retention Policy**:
- Keep all reconciliation records for 10 years (regulatory requirement)
- Archive to S3 after 2 years (compress, then delete locally)
- Index on `batch_id`, `received_timestamp` for quick lookup

### Notification Log Storage

**Table**: `notification_events`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_type | Enum | EMAIL, SMS, PUSH, WEBHOOK |
| investor_id | String | CPF or investor ID |
| recipient | String | Email or phone number |
| template_name | String | Template used (investment-confirmation.html) |
| status | Enum | QUEUED, SENT, FAILED, BOUNCED |
| send_timestamp | Timestamp | When sent |
| delivery_timestamp | Timestamp | When delivered (if available) |
| retry_count | Integer | Number of retries |
| error_message | Text | Error details if failed |
| created_at | Timestamp | Record creation time |

**Retention Policy**:
- Keep for 2 years (sufficient for audit and dispute resolution)
- Archive after 2 years; delete after 7 years

---

## 11. Performance & Scalability

### Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Webhook reception & validation | < 100ms | Return 202 immediately |
| Background reconciliation processing | < 5s per batch | Async; up to 1000 records |
| Email send (per email) | < 50ms | Includes retry queuing |
| SMS send (per SMS) | < 100ms | Includes retry queuing |
| Daily accounting export (1000+ agencies) | < 5s | Streaming NIO writes |
| Monthly regulatory export | < 30s | Digital signature computation |
| GL entry export (100k+ entries) | < 10s | Bulk data transformation |
| Batch message processing (1000 events) | < 30s | Idempotent consumption |

### Concurrency & Resource Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Webhook receiver threads | 10 (Virtual Threads) | Each receives 1 webhook; async processing |
| Message consumer threads | 3 | Kafka consumer group; auto-scaling 1-3 |
| Email sender thread pool | 20 | Core 5, Max 20, Queue 100 |
| SMS sender thread pool | 20 | Core 5, Max 20, Queue 100 |
| File writer threads | 5 | One per export type; prevent concurrent writes |
| External API client connections | 50 | Connection pool per service |

### Memory & Storage

- **Notification Queue**: In-memory buffer (max 10k messages; overflow to database queue)
- **Webhook Buffer**: In-memory buffer (max 5k pending; overflow to message queue)
- **File Storage**: Hot storage (S3 standard for 30 days), Cold storage (S3 Glacier after 30d)
- **Database**: 100GB initial; monthly growth ~5GB (projected 5-year total: 400GB)

---

## 12. Error Classification & Recovery

### Transient Errors (Retry)

| Error | Cause | Action | Max Retries |
|-------|-------|--------|------------|
| Connection Timeout | Network latency | Exponential backoff | 3 |
| Service Unavailable (5xx) | Temporary outage | Exponential backoff | 3 |
| Rate Limit Exceeded (429) | Too many requests | Exponential backoff + jitter | 5 |
| Database Lock Timeout | Concurrent access | Exponential backoff | 3 |

### Persistent Errors (No Retry)

| Error | Cause | Action |
|-------|-------|--------|
| Malformed JSON (400) | Invalid payload | Log error; send to DLQ; alert ops |
| Authentication Failed (401) | Invalid signature | Log security event; block sender; escalate |
| Not Found (404) | Resource deleted | Log warning; skip processing; continue |
| Conflict (409) | Duplicate processing | Return 409; do not reprocess |

### Fatal Errors (Escalate)

| Error | Cause | Action |
|-------|-------|--------|
| Database Connection Failed | DB down | Circuit breaker OPEN; page on-call DBA |
| File System Full | Disk space | Page storage team; stop exports |
| Vault Access Denied | Secrets unavailable | Page security team; disable webhooks |

---

## 13. Compliance & Regulatory Requirements

### CVM Compliance
- Daily NAV export by 8:00 PM (after calculator finishes at 7:30 PM)
- Monthly consolidated report by 1st business day of month, 10:00 AM
- 20-year audit trail of all exports and reconciliations
- Digital signature on all files submitted to CVM

### BACEN Compliance
- Holiday calendar embedded in all business day calculations
- SELIC/CDI rate tracking for index-linked fees
- Monthly reporting of macro-economic indicator usage

### Tax Authority Compliance
- Withholding tax details exported quarterly
- IPCA-adjusted amounts tracked for tax reporting
- Interest calculation compliance (CDI+spread formulas)

### Data Protection (LGPD)
- Investor PII encrypted in transit (TLS 1.3)
- Email/SMS content sanitized (no PII in message body for generic notifications)
- Secure deletion of cached data after 30 days
- Right to be forgotten: Support investor data deletion requests (90-day processing)

---

## 14. Testing Requirements

### Unit Tests
- **Scope**: Notification service, email template rendering, SMS formatting, data transformation
- **Coverage**: 100% of business logic
- **Mocking**: Mock external services (SendGrid, Twilio, payment processors)
- **Test Cases**: Valid inputs, invalid inputs, edge cases, error handling

### Integration Tests
- **Scope**: End-to-end workflow (event → notification → delivery)
- **Setup**: Docker Compose with test databases, test email/SMS endpoints
- **Test Cases**: 
  - Successful workflow (event → notification sent)
  - Retry workflow (initial failure → retry → success)
  - Idempotent webhook reception (duplicate → rejected)
  - Circuit breaker transition (service unavailable → OPEN → HALF_OPEN → CLOSED)

### Performance Tests
- **Load**: 1000 concurrent webhooks; 10k emails/min; 1k SMS/min
- **Latency**: Webhook < 100ms P99; email < 50ms P95; SMS < 100ms P95
- **Memory**: Monitor for memory leaks; heap profile under sustained load

### Resilience Tests
- **Failure Scenarios**: 
  - Email provider down (test fallback to queue)
  - SMS provider down (test retry policy)
  - Bank API timeout (test circuit breaker)
  - Database unavailable (test graceful degradation)

### Security Tests
- **Authentication**: Verify webhook signature validation
- **Authorization**: Verify role-based access to export endpoints
- **Data Protection**: Verify TLS encryption; verify data not logged unencrypted
- **Audit Trail**: Verify all actions logged with timestamps

---

## 15. API Endpoint Specifications

### Export Accounting File
```
GET /api/v1/integration/export/accounting?date=2026-06-08
Authorization: Bearer {jwt_token}
X-Role: ACCOUNTING_EXPORT

Response (200 OK):
Content-Type: text/csv
Content-Disposition: attachment; filename="accounting-fees-2026-06-08.csv"

branch_code,agency_id,calculation_date,total_fees_cents,...
AG001,AG001_001,2026-06-08,150000000,...
```

### Export Journal Entries
```
POST /api/v1/integration/export/journal-entries
Authorization: Bearer {jwt_token}
X-Role: ACCOUNTING_EXPORT
Content-Type: application/json

Request:
{
  "startDate": "2026-06-01",
  "endDate": "2026-06-08",
  "exportFormat": "JSON|CSV",
  "targetSystem": "SAP|NETSUITE|ORACLE"
}

Response (200 OK):
{
  "entryCount": 5000,
  "totalDebit": 75000000000,
  "totalCredit": 75000000000,
  "entries": [...]
}
```

### Export Regulatory Data
```
POST /api/v1/integration/export/regulatory
Authorization: Bearer {jwt_token}
X-Role: COMPLIANCE_OFFICER
Content-Type: application/json

Request:
{
  "exportMonth": "2026-06",
  "includeSignature": true,
  "deliveryMethod": "SFTP|HTTPS_POST",
  "targetSystem": "CVM|TAX_AUTHORITY"
}

Response (202 Accepted):
{
  "jobId": "uuid",
  "status": "PROCESSING",
  "estimatedCompletionTime": "30s",
  "willSignWith": "ICP-BRASIL-CERT-001"
}
```

### Webhook Reception
```
POST /api/v1/integration/reconciliation
X-Signature: sha256={hmac_hex}
Content-Type: application/json

Request:
{
  "batchId": "uuid",
  "status": "ACCEPTED",
  "timestamp": "2026-06-08T18:30:25Z",
  "message": "Batch processed successfully",
  "recordCount": 1250
}

Response (202 Accepted):
{
  "status": "RECEIVED_FOR_PROCESSING",
  "batchId": "uuid"
}
```

### Query Reconciliation Status
```
GET /api/v1/integration/reconciliation/{batchId}
Authorization: Bearer {jwt_token}
X-Role: ACCOUNTING_EXPORT

Response (200 OK):
{
  "batchId": "uuid",
  "status": "ACCEPTED|REJECTED|PARTIAL",
  "receivedTimestamp": "2026-06-08T18:30:25Z",
  "processedTimestamp": "2026-06-08T18:30:28Z",
  "recordCount": 1250,
  "errorCount": 0,
  "message": "All records accepted"
}
```

### Trigger Email Notification
```
POST /api/v1/integration/notify/email
Authorization: Bearer {jwt_token}
X-Role: NOTIFICATIONS_ADMIN
Content-Type: application/json

Request:
{
  "recipientEmail": "investor@example.com",
  "templateName": "investment-confirmation",
  "variables": {
    "investorName": "João Silva",
    "fundName": "ABC Fund Plus",
    "amount": "10,000.00"
  },
  "priority": "HIGH|NORMAL|LOW"
}

Response (202 Accepted):
{
  "notificationId": "uuid",
  "status": "QUEUED",
  "estimatedDeliveryTime": "5s"
}
```

---

## 16. Integration Timeline & Implementation Priorities

### Phase 1 (Weeks 1-2): Core File Export
1. Implement daily accounting CSV export
2. Implement webhook reconciliation endpoint
3. Add signature validation

### Phase 2 (Weeks 3-4): Notification System
1. Implement email notification service
2. Implement SMS notification service
3. Add retry queuing and fallback

### Phase 3 (Weeks 5-6): Message Queue Integration
1. Subscribe to Kafka topics from other modules
2. Implement event-driven notification triggering
3. Add idempotent message processing

### Phase 4 (Weeks 7-8): External Service Orchestration
1. Integrate with payment processors
2. Implement circuit breaker patterns
3. Add monitoring and alerting

### Phase 5 (Weeks 9-10): Compliance & Reporting
1. Implement regulatory export (CVM, tax authority)
2. Add digital signature support
3. Implement audit trail logging

### Phase 6 (Weeks 11-12): Testing & Optimization
1. Comprehensive test coverage
2. Performance tuning
3. Security audit
4. Production readiness

---

## 17. Monitoring & Alerting

### Key Metrics

| Metric | Alert Threshold | Check Interval |
|--------|-----------------|-----------------|
| Webhook success rate | < 95% | Every 5 minutes |
| Webhook latency P95 | > 500ms | Every 5 minutes |
| Email send success rate | < 95% | Every 5 minutes |
| SMS send success rate | < 95% | Every 5 minutes |
| Reconciliation processing lag | > 5 seconds | Every 5 minutes |
| External service availability | < 95% | Every 5 minutes |
| Database queue depth | > 1000 messages | Every 5 minutes |
| File export success rate | < 100% for daily | Every 1 minute |
| Signature verification failures | > 5 per minute | Every 1 minute |

### Alert Destinations

- **Critical**: PagerDuty (on-call engineer)
- **High**: Slack #alerts channel
- **Medium**: Email to operations
- **Low**: CloudWatch logs only

---

## 18. Disaster Recovery & Backup

### Backup Strategy

- **Database**: Daily backups (incremental); 30-day retention
- **Exported Files**: Auto-replicated to S3; 10-year retention
- **Secrets**: Encrypted in vault; daily backup with 90-day retention
- **Configuration**: Version controlled in Git; reviewed before changes

### Recovery Procedures

- **Webhook Replay**: Resend failed webhooks from database queue
- **Missing Notifications**: Replay from message queue (24-hour retention)
- **Failed Exports**: Re-generate from source data in atomant-audit
- **Database Corruption**: Restore from most recent backup; replay transaction logs

---

## Summary

The **Integration Module** is the critical bridge connecting the atomant financial system to external partners (accounting systems, payment processors, compliance systems). It ensures:

1. **Reliable Data Export**: Daily accounting files with 99.9% accuracy
2. **Resilient Notifications**: Email/SMS delivery with robust retry and fallback
3. **Secure Webhooks**: HMAC-SHA256 signature verification and idempotent processing
4. **Compliance**: CVM, BACEN, tax authority reporting with digital signatures
5. **Performance**: Sub-second webhook processing; sub-5-second batch operations
6. **Scalability**: Handle 1000s of concurrent webhooks; 10k emails/min; 1k SMS/min

This specification ensures atomant's data flows reliably to external systems while maintaining security, compliance, and performance standards.
