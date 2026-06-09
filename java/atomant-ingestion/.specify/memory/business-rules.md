# Business Rules: Ingestion Module for Investment & Payment Data Processing

## Overview

This document defines the business rules governing external data ingestion, normalization, caching, and distribution within the `atomant-ingestion` module. The ingestion module serves as the trusted gateway for public financial data from Brazilian regulatory authorities and financial institutions, ensuring consistency and reliability across the investment and payment processing system.

---

## 1. External Data Source Rules

### 1.1 Authorized Data Sources

| Source | Organization | Data Type | Update Frequency | Priority |
|--------|--------------|-----------|------------------|----------|
| CVM Daily NAV | Comissão de Valores Mobiliários | Fund NAV, quotas | Daily (4:00 PM) | P0 Critical |
| BACEN Holidays | Banco Central do Brasil | Bank calendar | Monthly | P1 High |
| BACEN SELIC | Central Bank (SGS Series 11) | Interest rate | Daily | P1 High |
| BACEN CDI | Central Bank (SGS Series 12) | Interbank rate | Daily | P1 High |
| Ipeadata IPCA | Brazilian Statistics Bureau | Inflation index | Monthly | P2 Medium |
| Ipeadata IGPM | Brazilian Statistics Bureau | Wholesale price index | Monthly | P2 Medium |
| B3 Trading Calendar | B3 (stock exchange) | Market days | Monthly | P1 High |

### 1.2 Data Source Credentials & Authentication

#### CVM Open Data
- **Endpoint**: `https://dados.cvm.gov.br/api/v1/` (public; no authentication required)
- **Rate Limit**: 1000 requests per hour per IP
- **Data Format**: JSON with UTF-8 encoding
- **Availability**: 24/7 with SLA 99.5%

#### BACEN SGS
- **Endpoint**: `https://www.bcb.gov.br/api/v1/dados/serie/` (public; no authentication)
- **Rate Limit**: No explicit limit; recommended max 10 concurrent connections
- **Data Format**: JSON
- **Availability**: Business days 8:00 AM - 6:00 PM (São Paulo time)

#### Ipeadata
- **Endpoint**: `https://www.ipeadata.gov.br/api/v1/` (public; no authentication)
- **Rate Limit**: 100 requests per hour per IP (soft limit)
- **Data Format**: JSON/CSV
- **Availability**: 24/7; updated monthly (typically 11th of following month)

#### B3 Calendar
- **Source**: B3 website or FTP endpoint (requires documentation verification)
- **Rate Limit**: 1 request per day recommended
- **Data Format**: HTML/CSV
- **Availability**: Updated monthly

### 1.3 Data Freshness Requirements

#### Critical Data (P0 - Used Daily)
- **CVM NAV**: Must be ingested within 2 hours of publication (by 6:00 PM)
  - If not available by 8:00 PM, mark calculation as "DELAYED" and notify users
  - Use prior day NAV as fallback after 8:00 PM (with flag)
- **BACEN Holidays**: Must be ingested by 8:00 AM (before market open)
  - If missing, assume all days are business days (conservative)

#### High Priority Data (P1 - Daily)
- **BACEN SELIC**: Must be ingested by 8:00 AM on publication date
- **BACEN CDI**: Must be ingested by 8:00 AM on publication date
- If not ingested by 11:00 AM, use prior day rate with 1-day lag flag

#### Medium Priority Data (P2 - Monthly)
- **IPCA**: Must be ingested by 12:00 PM on publication date (11th of month)
  - If missed, use prior month rate until current month published
  - Retroactively apply correction once data available
- **IGPM**: Same as IPCA

---

## 2. Data Ingestion Schedules

### 2.1 Scheduled Ingestion Jobs

#### Daily Jobs (Recurring Every Business Day)

**Job 1: CVM NAV Ingest (4:15 PM - 8:00 PM)**
```
Schedule: Every business day at 4:15 PM
Trigger: Automatic after market close (CVM publishes at 4:00 PM)
Retry Policy:
  - Attempt 1: 4:15 PM
  - Attempt 2: 5:00 PM (if attempt 1 failed)
  - Attempt 3: 6:00 PM (if attempt 2 failed)
  - Alert: If all 3 attempts fail by 6:30 PM
  - Fallback: Use prior day NAV; mark as DELAYED
```

**Job 2: BACEN Calendar Sync (8:00 AM - 8:30 AM)**
```
Schedule: Every business day at 8:00 AM
Purpose: Ensure current day classified correctly as business/holiday
Timeout: 5 minutes maximum
Fallback: If failed, assume business day (conservative)
```

**Job 3: BACEN SELIC & CDI Ingest (8:00 AM - 8:30 AM)**
```
Schedule: Every business day at 8:00 AM
Purpose: Fetch overnight and previous day rates
Timeout: 5 minutes
Fallback: Use prior day rate (with 1-day lag flag)
```

#### Monthly Jobs (First Business Day of Month)

**Job 4: Ipeadata IPCA/IGPM Ingest (12:00 PM)**
```
Schedule: 11th of each month at 12:00 PM
Purpose: Fetch previous month's inflation index (published 11th)
Timeout: 10 minutes
Fallback: Use prior month rate until current month available
Retroactive Correction: Once available, recalculate affected fees
```

**Job 5: B3 Trading Calendar Sync (Last Business Day of Month)**
```
Schedule: Last business day of month at 4:00 PM
Purpose: Ingest next month's market calendar
Timeout: 5 minutes
Fallback: Mark next month as having standard market days
```

### 2.2 Manual Ingestion Triggers

#### On-Demand Ingestion Endpoints
- **POST /api/v1/ingest/cvm/funds** — Manually trigger CVM NAV ingestion
  - Requires `FUND_MANAGER` or `ADMIN` role
  - Returns job ID for async tracking
  - Rate limited: Max 5 requests per hour per user
  
- **POST /api/v1/ingest/bacen/holidays** — Manually sync BACEN calendar
  - Requires `ADMIN` role
  - Returns updated holiday list
  
- **POST /api/v1/ingest/indices** — Manually fetch economic indices (SELIC, CDI, IPCA, IGPM)
  - Requires `ADMIN` role
  - Accepts optional date parameter for historical data
  - Retroactively updates calculations if date is in the past

#### Manual Override Endpoints
- **PUT /api/v1/ingest/overrides/nav/{fundId}/{date}** — Manually set NAV for specific date/fund
  - Requires `COMPLIANCE_OFFICER` + `FUND_MANAGER` approval (2 signatures)
  - Triggers automatic recalculation of affected fees/investments
  - Creates audit log entry with justification
  
- **PUT /api/v1/ingest/overrides/index/{indexType}/{date}** — Manually set index value
  - Requires `COMPLIANCE_OFFICER` approval
  - Triggers retroactive fee recalculation if date in the past
  - Audit logged with approval chain

---

## 3. Data Normalization Rules

### 3.1 Date Normalization

#### Input Date Formats Accepted
- ISO 8601: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS` (preferred)
- Brazilian format: `DD/MM/YYYY`
- Unix timestamp: `1686225600` (milliseconds since epoch)
- CVM format: `YYYYMMDD` (no separators)

#### Normalization Process
1. **Detect Format**: Attempt detection in order: ISO 8601 → Unix → CVM → Brazilian
2. **Parse**: Convert to `LocalDate` (no time component preserved)
3. **Validate**: Ensure date ≤ today (reject future dates)
4. **Output**: Standardize to ISO 8601 `YYYY-MM-DD` format

#### Edge Cases
- **Leap Year**: Correctly handle Feb 29 (invalid in non-leap years)
- **Invalid Dates**: Reject Feb 30, etc.; flag in error log
- **Timezone Ambiguity**: Assume São Paulo timezone (GMT-3 in winter, GMT-2 in summer)

### 3.2 Numeric Normalization

#### Currency & NAV (Net Asset Value)
- **Input Formats**: Comma decimal (1.000,50), period decimal (1000.50), scientific notation (1E+3)
- **Normalization**: Convert to BigDecimal with scale 4 (e.g., 1000.5000)
- **Validation**: Must be > 0.0001 (reject zero or negative NAV unless flag set)
- **Rounding**: Use `RoundingMode.HALF_EVEN` (Banker's rounding)

#### Quota Quantities
- **Input Formats**: Integer (1000), decimal (1000.12345678), scientific (1E+6)
- **Normalization**: Convert to BigDecimal with scale 8 (e.g., 1000.12345678)
- **Validation**: Must be > 0 (reject zero or negative quotas)
- **Rounding**: `RoundingMode.HALF_EVEN`

#### Interest Rates
- **Input Formats**: Percentage (0.15 for 15%), decimal (0.0015 for 0.15%), basis points (15 for 0.15%)
- **Normalization Rule**: Default to decimal input; if value > 1, treat as percentage; if value > 100, treat as basis points
  - Example: Input `15` → Interpret as 1500 basis points or 15%? Require explicit format indicator
  - Better: Specify format in API: `15_PERCENT`, `0.15_DECIMAL`, `1500_BASIS_POINTS`
- **Output**: Standardize to decimal (0.15 for 15%), scale 6

#### Currency Exchange Rates
- **Input Format**: Typically decimal (e.g., 5.25 BRL per USD)
- **Normalization**: Convert to BigDecimal, scale 4
- **Source**: Reuters/ECB midpoint rate; published daily at 2:00 PM São Paulo time
- **Validation**: Rate must be > 0; reject if change > 10% from prior day (investigate)

### 3.3 String Normalization

#### CPF Normalization
- **Input Formats**: With dashes (123.456.789-01), without (12345678901), with dots/dashes
- **Normalization**: Remove all non-numeric characters; validate format
- **Validation**: 11 digits total; apply CPF validation algorithm (check digits)
- **Output**: `12345678901` (11 digits, no formatting)

#### CNPJ Normalization
- **Input Formats**: With separators (00.000.000/0001-00), without (00000000000100), mixed
- **Normalization**: Remove all non-numeric characters; validate format
- **Validation**: 14 digits total; apply CNPJ validation algorithm (check digits)
- **Output**: `00000000000100` (14 digits, no formatting)

#### Fund Code Normalization
- **Input Format**: Alphanumeric, variable length
- **Normalization**: Uppercase; trim whitespace
- **Validation**: Must match regex `^[A-Z0-9]{3,10}$`
- **Output**: Uppercase alphanumeric (e.g., `FND001`)

#### Bank Account Normalization
- **Input Format**: Varies by bank (agency, account, check digit)
- **Normalization**: Remove spaces, dashes, slashes
- **Validation**: Depends on bank; apply bank-specific check digit algorithm if available
- **Output**: Standardized format per bank

### 3.4 Data Completeness & Missing Value Handling

#### Required Fields (Cannot be null/empty)
- Fund CNPJ, Fund name, Fund NAV (for NAV record)
- Holiday date (for calendar record)
- Index code, index date, index value (for economic indicator)

#### Optional Fields with Defaults
| Field | Default Value | Condition |
|-------|---------------|-----------|
| Fund category | `RENDA_FIXA` | If missing from CVM data |
| Fund status | `ACTIVE` | If missing; verify against CVM registry |
| Quota holder name | `(Unknown)` | If CVM does not provide |
| Transaction description | `(No description)` | If missing from input |
| Risk rating | `NOT_RATED` | If no rating agency data |

#### Missing Data Imputation
- **Historical NAV**: If prior day unavailable, use 5-day moving average (if available)
- **Economic Index**: If monthly index delayed, use prior month's rate with "DELAYED" flag
- **Holiday Calendar**: If current day unknown, assume business day (conservative approach)
- **Exchange Rate**: If FX rate missing, use prior day's rate (with 1-day lag flag)

#### Null Handling Rules
```
If field is null:
1. Is field required? → Reject record; log error
2. Is field optional? → Apply default value; log warning
3. Is field estimable? → Impute; mark record as "ESTIMATED"
```

---

## 4. Caching Strategy

### 4.1 Cache Types & TTLs

| Data Type | Cache | TTL | Invalidation |
|-----------|-------|-----|--------------|
| CVM NAV | In-Memory + Redis | 24 hours | Daily job + manual override |
| BACEN Holidays | In-Memory + Redis | 30 days | Monthly sync + manual override |
| BACEN SELIC | In-Memory + Redis | 24 hours | Daily job + manual override |
| BACEN CDI | In-Memory + Redis | 24 hours | Daily job + manual override |
| Ipeadata IPCA | In-Memory + Redis | 30 days | Monthly job + manual override |
| Exchange Rates | In-Memory + Redis | 24 hours | Daily update + manual override |
| Working Days Calendar | In-Memory | 365 days | Annual refresh |

### 4.2 Cache Lookup & Fallback

#### Cache Miss Handling
```
On cache miss:
1. Query Redis (distributed cache)
2. If Redis miss, query database (persisted ingestion records)
3. If database miss, query external API with circuit breaker
4. If API fails, use fallback value (prior day/month)
5. If no fallback available, fail with detailed error
```

#### Cache Consistency
- **Write-Through**: Write to database immediately; invalidate cache
- **Cache Invalidation**: On manual override or new ingestion, invalidate in-memory + Redis
- **TTL Expiration**: Automatic cleanup; when expired, next query triggers refresh

#### Multi-Tenant Caching
- **Cache Key Format**: `{moduleId}:{dataType}:{date}:{fundId?}` (Redis)
- **Isolation**: Fund A's NAV not cached with Fund B's data
- **Broadcast Invalidation**: When admin overrides NAV, invalidate cache for that fund/date

### 4.3 Cache Performance & Monitoring

#### Cache Hit Rate Targets
- CVM NAV: > 95% (most queries for current or recent days)
- BACEN Holidays: > 99% (stable data; rarely changes)
- Economic Indices: > 90% (monthly updates; some historical queries)

#### Cache Metrics to Track
- Hit ratio (cache hits / total lookups)
- Miss rate and reason (expired, invalidated, not yet ingested)
- Cache size (memory usage in MB)
- Eviction rate (if cache at capacity limit)

#### Monitoring & Alerting
- Alert if hit rate drops below 85% (potential issue)
- Alert if cache size exceeds 80% of allocated memory
- Alert if eviction rate > 5% (cache too small for workload)

---

## 5. Fallback & Imputation Rules

### 5.1 Graceful Degradation Strategy

When external API fails and cached data unavailable:

#### Tier 1: Use Most Recent Data
- If today's CVM NAV unavailable, use yesterday's NAV
- If current month IPCA unavailable, use prior month IPCA
- Mark calculation as "DELAYED" or "ESTIMATED" (transparent to user)

#### Tier 2: Use Historical Average
- If SELIC rate missing for 3+ days, calculate 30-day moving average
- Use moving average until live data available
- Mark as "ESTIMATED_MOVING_AVG"

#### Tier 3: Use Conservative Default
- If holiday calendar unavailable, assume all days are business days (conservative)
- If NAV missing for > 5 days, use zero-fee day; notify fund manager
- Never reject user investment/payment due to missing data; always have fallback

#### Tier 4: Manual Override
- Compliance officer can manually input data
- Override triggers automatic recalculation
- Logged in audit trail with justification

### 5.2 Data Quality Flags

Every ingested record tagged with quality indicator:

| Flag | Meaning | Recalculation Trigger |
|------|---------|----------------------|
| `LIVE` | Data from primary source; current date | No |
| `CACHED` | Data from cache; still valid | No |
| `1_DAY_LAG` | Data from prior day (index not published yet) | Yes, when current published |
| `DELAYED` | Data ingested late (after cutoff); calculation delayed | Yes, once latest ingested |
| `ESTIMATED` | Data imputed (missing from source) | Yes, when actual data arrives |
| `FALLBACK` | Data from prior period (source unavailable) | Yes, when source restored |
| `MANUAL_OVERRIDE` | Data manually set by operator | No (audit logged) |

### 5.3 Reconciliation & Correction Window

#### Correction Window Policy
- **NAV Corrections**: 24 hours after publication
  - If CVM corrects NAV within 24 hours, automatic recalculation of fees/investments
  - If correction after 24 hours, manual approval required (compliance officer)
  
- **Index Corrections**: 5 business days after publication
  - IPCA index final release date: 15th of following month
  - If CVM/IBGE corrects index, retroactive recalculation for prior month's fees
  - User notified of recalculation and new fee amounts

#### User Notification
- **Critical Corrections** (> 1% NAV change, > 0.5% fee impact):
  - Email + in-app notification within 1 hour
  - Include: Old value, new value, reason, impact on portfolio
  
- **Non-Critical Corrections**:
  - Notification in monthly statement
  - Available in transaction history

---

## 6. Error Handling & Resilience

### 6.1 API Failure Scenarios

#### Circuit Breaker States

| State | Condition | Behavior |
|-------|-----------|----------|
| **CLOSED** | API healthy (< 50% failures in last 10 calls) | Pass requests through; use fallback if individual call fails |
| **OPEN** | API unhealthy (≥ 50% failures) | Fail fast; use fallback without attempting API call |
| **HALF_OPEN** | Testing recovery (after 10s delay) | Allow 1 test request; if succeeds → CLOSED; if fails → OPEN |

#### Retry Policy
- **Max Retries**: 3 attempts total
- **Backoff**: Exponential (1s, 2s, 4s) with jitter (±200ms)
- **Idempotency**: Retries safe for GET requests; not repeated for POST/PUT

#### Timeout Policy
- **Connection Timeout**: 5 seconds (fail fast if server unreachable)
- **Read Timeout**: 10 seconds (allow time for data transfer)
- **Total Timeout**: 30 seconds (max time for entire request, including retries)

### 6.2 Data Validation on Ingestion

#### Type Validation
- Date must be valid calendar date
- Numeric values must be parseable as BigDecimal
- CNPJ/CPF must be 14/11 digits respectively

#### Business Logic Validation
- NAV must be > 0.0001
- Quota count must be integer or valid decimal
- Fund CNPJ must exist in fund master database
- Holiday date must be ≤ today

#### Sanity Checks
- NAV change < 10% from prior day (flag if exceeds)
- Interest rate change < 2% from prior day (flag if exceeds)
- Total quotas cannot decrease (only increase via reinvestment)
- Fund assets cannot decrease > 5% in one day (flag for manual review)

### 6.3 Error Classification & Response

| Error Type | Example | Action |
|-----------|---------|--------|
| **Transient** | Network timeout, 503 Service Unavailable | Retry automatically (3x); use fallback |
| **Validation** | Invalid date format, missing CNPJ | Reject record; log error; notify support |
| **Not Found** | CVM returns 404 for fund | Log warning; check fund code validity |
| **Unauthorized** | API returns 401 (credentials invalid) | Alert ops; verify credentials; escalate |
| **Rate Limited** | API returns 429 (too many requests) | Backoff 5 minutes; retry later |
| **Parse Error** | Response body malformed JSON | Quarantine response; manual investigation |

### 6.4 Fallback Strategy by Data Type

#### CVM NAV Unavailable
- Use prior business day NAV
- Mark as `DELAYED`
- If unavailable > 5 days: Stop accepting investments (manual override required)

#### BACEN Holiday Calendar Unavailable
- Assume all days are business days (safe default)
- Continue fund operations without impact
- Retry daily

#### Economic Index (SELIC/CDI/IPCA) Unavailable
- Use prior day/month value with 1-day/month lag flag
- Fees calculated with marked-as-estimated flag
- User notified

#### Exchange Rate Unavailable
- Use prior day's FX rate
- Mark record as `1_DAY_LAG`
- Reconcile when live rate available

---

## 7. Data Persistence & Audit Trail

### 7.1 Ingestion Record Storage

All ingested data persisted to database (PostgreSQL) with audit metadata:

```json
{
  "recordId": "uuid",
  "ingestionTimestamp": "2026-06-08T16:30:00Z",
  "dataType": "CVM_NAV" | "BACEN_SELIC" | "IPEADATA_IPCA",
  "dataSourceUrl": "https://dados.cvm.gov.br/api/v1/fund-daily-report?date=2026-06-08",
  "rawData": "{ ... raw JSON/CSV from source ... }",
  "normalizedData": {
    "fundCNPJ": "00000000000100",
    "fundName": "Fund Name",
    "navDate": "2026-06-08",
    "navValue": 10.5250,
    "totalQuotas": 1000000.00000000
  },
  "dataQualityFlag": "LIVE" | "CACHED" | "DELAYED" | "ESTIMATED",
  "validationStatus": "PASSED" | "FAILED_VALIDATION" | "CORRECTED",
  "validationErrors": [],
  "httpStatusCode": 200,
  "responseTimeMs": 1250,
  "circuitBreakerState": "CLOSED" | "OPEN" | "HALF_OPEN",
  "fallbackUsed": false,
  "manualOverride": false,
  "operatorId": null,
  "retryCount": 0,
  "notes": ""
}
```

**Retention Policy**: 10 years (same as audit-log retention; supports regulatory inquiries)

### 7.2 Audit Trail Integration

- Every ingestion event logged to `atomant-audit` module (via message queue)
- Audit includes: Source, timestamp, raw data hash, normalized output, validation status, warnings
- Operator overrides: Logged with approver ID, justification, timestamp
- Corrections: Logged with original vs. corrected values, impact on downstream calculations

### 7.3 Data Lineage Tracking

For each calculation (fee, investment, payment):
- Track which ingestion records were used
- Include data quality flags in calculation result
- Provide data lineage trace: Source → Ingestion → Normalization → Calculation

---

## 8. Integration with Downstream Modules

### 8.1 Data Distribution Pipeline

```
Ingestion Module
├── Normalizes data
├── Persists to database
├── Updates caches
└── Publishes to message queue
    ├── Topic: FUND_NAV_UPDATED → Investment Module
    ├── Topic: ECONOMIC_INDEX_UPDATED → Calculator Module
    ├── Topic: INGESTION_COMPLETED → Audit Module
    └── Topic: DATA_CORRECTION → Affected modules (recalculate)
```

### 8.2 NAV Update Integration

**Scenario**: CVM publishes new NAV at 4:00 PM

1. **Ingestion Module**: Fetches NAV, normalizes, validates
2. **Database**: Persists NAV record with quality flag `LIVE`
3. **Cache**: Updates Redis cache (TTL 24 hours)
4. **Message Queue**: Publishes `FUND_NAV_UPDATED` event
5. **Investment Module**: Subscribes to event; updates fund pricing
6. **Calculator Module**: Subscribes to event; triggers daily fee calculation
7. **Audit Module**: Logs ingestion event
8. **Users**: Investment orders queued for settlement at new NAV

### 8.3 Index Update Integration

**Scenario**: BACEN publishes SELIC rate at 8:30 AM

1. **Ingestion Module**: Fetches SELIC, normalizes
2. **Database**: Persists with quality flag `LIVE`
3. **Cache**: Updates Redis (TTL 24 hours)
4. **Message Queue**: Publishes `ECONOMIC_INDEX_UPDATED` event
5. **Calculator Module**: Updates index-linked fees (e.g., funds with SELIC + spread)
6. **Investment Module**: Updates variable-rate fund pricing
7. **Payment Module**: Recalculates interest on holdback amounts
8. **Audit Module**: Logs index update

### 8.4 Correction & Recalculation Flow

**Scenario**: CVM corrects previous day's NAV (within 24-hour window)

1. **Ingestion Module**: Fetches corrected NAV
2. **Validation**: Detects variance > 1% from cached value
3. **Alert**: Notifies compliance officer
4. **Database**: Inserts correction record; links to original
5. **Cache**: Invalidates Redis entry
6. **Message Queue**: Publishes `NAV_CORRECTION` event with impact info
7. **Affected Modules**:
   - **Investment Module**: Recalculate investments from yesterday
   - **Calculator Module**: Recalculate fees using corrected NAV
   - **Audit Module**: Log correction event
8. **Users**: Notified of recalculation if fees/investments impacted

---

## 9. Performance & Scalability Rules

### 9.1 Ingestion Latency Targets

| Operation | Target | Constraint |
|-----------|--------|-----------|
| Fetch CVM NAV (1000+ funds) | < 10s | Streaming parser; max 10 concurrent |
| Parse & normalize NAV data | < 5s | Batch processing 10k records |
| Persist to database | < 5s | Bulk insert; batch size 1000 |
| Cache update | < 1s | Redis distributed cache |
| Total ingestion pipeline | < 30s | End-to-end |
| API response (manual trigger) | < 2s | Return job ID; async processing |

### 9.2 Data Volume Capacity

| Metric | Capacity | Target |
|--------|----------|--------|
| CVM Funds | 10,000+ daily records | < 30s ingestion |
| Quota Holders | 1M+ position records | Streaming processing |
| Economic Indices | 50+ active indices | Batch processing |
| Cache entries | 100k+ | Memory < 2 GB |
| Concurrent ingestion jobs | 5 max | Rate limit to prevent overload |

### 9.3 Concurrency & Queueing

#### Job Queue
- Scheduled jobs (6 daily) processed serially to avoid conflicts
- Manual ingestion requests queued; max 5 concurrent
- If queue > 10 items, reject new requests with 503 (temporary)
- Priority: Manual ADMIN requests > scheduled jobs > retries

#### Thread Pool
- Core threads: 5
- Max threads: 20
- Queue size: 100
- Rejection policy: Reject (return 503 if queue full)

### 9.4 API Rate Limiting (Per Source)

| Source | Rate Limit | Backoff Strategy |
|--------|-----------|------------------|
| CVM | 1000 req/hour | Wait 60s; retry after |
| BACEN | 100 req/hour | Wait 60s; use fallback |
| Ipeadata | 100 req/hour | Wait 300s; use fallback |
| B3 | Ad hoc (1x/month) | No rate limit |

**Burst Handling**: If approaching limit, delay subsequent requests until hour resets

---

## 10. Monitoring & Alerting

### 10.1 Key Metrics

- **Ingestion Success Rate**: % of successful ingestions (target > 98%)
- **Data Freshness**: Hours since last successful ingestion per data type
- **Fallback Usage Rate**: % of queries served from fallback (target < 5%)
- **API Response Time**: P50, P95, P99 latency (target P95 < 5s)
- **Circuit Breaker State**: Time in OPEN state per API endpoint
- **Cache Hit Rate**: % cache hits vs. total lookups (target > 90%)
- **Validation Failure Rate**: % of records failing validation (alert if > 1%)

### 10.2 Alerting Thresholds

| Condition | Severity | Action |
|-----------|----------|--------|
| Ingestion failure rate > 5% | Critical | Page on-call engineer |
| Data freshness > 24 hours | Critical | Alert ops immediately |
| Circuit breaker OPEN > 30 min | High | Investigate API availability |
| Cache hit rate < 80% | Medium | Check cache size/TTL |
| Validation failure > 2% | Medium | Investigate data quality |
| API response time P95 > 10s | Medium | Check network/API status |
| Fallback usage > 20% | Low | Monitor; may indicate API issues |

### 10.3 Monitoring Implementation

- **Metrics Collection**: Prometheus scrape endpoint at `/q/metrics`
- **Dashboards**: Grafana with ingestion module KPIs
- **Alerting**: PagerDuty integration for critical alerts
- **Logging**: Structured JSON logs to ELK stack
- **Distributed Tracing**: Jaeger for request flow visualization

---

## 11. Testing & Validation Requirements

### 11.1 Unit Tests

- **Data Normalization**: 100% coverage of date/numeric/string conversion
- **Validation Rules**: All edge cases (invalid dates, out-of-range values, missing fields)
- **Fallback Logic**: Verify correct tier selection when data unavailable
- **Cache Logic**: Hit/miss scenarios, TTL expiration, invalidation

### 11.2 Integration Tests

- **End-to-End Ingestion**: Mock external APIs; verify complete pipeline
- **Failure Scenarios**: Network timeouts, 5xx errors, malformed responses
- **Downstream Integration**: Message publishing to queues; verify payload format
- **Reconciliation**: Corrections propagated to affected modules

### 11.3 Performance Tests

- **Large Payload**: CVM with 10,000+ fund records; measure latency
- **Concurrent Requests**: 100 concurrent ingestion triggers; verify queue behavior
- **Memory Profiling**: Peak heap usage during large data processing
- **Cache Performance**: Hit rate at various load levels

### 11.4 Resilience Tests

- **Circuit Breaker**: Verify open/closed state transitions
- **Retry Backoff**: Confirm exponential backoff timing
- **Fallback Verification**: Ensure fallback values used when primary unavailable
- **Data Quality Flags**: Verify correct flags assigned based on data source

---

## 12. Regulatory & Compliance Requirements

### 12.1 CVM Compliance

- CVM daily NAV ingestion audited (20-year retention)
- Ability to trace NAV from CVM publication to calculation
- Correction procedures comply with CVM guidelines
- Fund data validated against CVM registry

### 12.2 BACEN Compliance

- Working calendar used for 252-day calculations
- SELIC rate used for baseline interest calculations
- CDI rate available for variable-rate fund calculations
- All index-linked calculations auditable

### 12.3 Tax Authority Compliance

- IPCA used for inflation-linked returns calculation
- Tax withholding calculations based on applicable indices
- Withholding audit trail maintained for 10 years

---

## 13. Dependencies & Integration Points

### 13.1 Upstream Dependencies
- **CVM Public APIs** (for NAV, fund master data)
- **BACEN SGS** (for SELIC, CDI, holiday calendar)
- **Ipeadata Public APIs** (for IPCA, IGPM)
- **B3 Website** (for trading calendar)
- **External FX Rate Source** (Reuters/ECB for exchange rates)

### 13.2 Downstream Dependencies
- **Investment Module** (`atomant-investment-core`): Consumes NAV updates
- **Calculator Module** (`atomant-calculator`): Consumes economic indices
- **Payment Module** (`atomant-payment`): Consumes exchange rates, interest indices
- **Audit Module** (`atomant-audit`): Receives ingestion event logs
- **Message Queue**: Kafka/RabbitMQ for event distribution

### 13.3 External Services
- **Redis**: Distributed cache for ingested data
- **PostgreSQL**: Persistent storage of ingestion records
- **Message Broker**: Kafka or RabbitMQ for asynchronous event distribution

---

## 14. Operations & Troubleshooting

### 14.1 Common Issues & Resolution

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| CVM NAV not ingested | Check API status; review circuit breaker state | Manual trigger; fallback to prior day |
| BACEN timeout | Network latency or API overload | Increase timeout; retry with backoff |
| Cache not refreshing | TTL expired; manual override not propagated | Clear Redis cache; re-ingest |
| Validation failures spike | Data quality issue at source | Review raw data; manual override if needed |

### 14.2 Manual Recovery Procedures

**If CVM NAV unavailable for > 2 hours:**
1. Check CVM public status page
2. Attempt manual ingestion via API endpoint
3. If still failed, compliance officer reviews prior day NAV
4. Compliance officer approves prior day NAV for current day (via manual override)
5. System recalculates fees/investments with corrected NAV
6. Users notified of late NAV publication

**If BACEN holiday calendar missing:**
1. Check BACEN website; verify date status
2. Assume business day (conservative default)
3. Escalate to ops if missing > 1 day
4. Manual entry of holiday by admin if confirmed

**If index (SELIC/CDI/IPCA) delayed > 24 hours:**
1. Publish market notice of index delay
2. Delay fund operations that depend on index
3. Use prior period value with "ESTIMATED" flag
4. Automatically recalculate once index available

---

## 15. API Specification & Contracts

### 15.1 Manual Ingestion Endpoint

```
POST /api/v1/ingest/trigger

Request:
{
  "dataType": "CVM_NAV" | "BACEN_SELIC" | "BACEN_CDI" | "IPEADATA_IPCA",
  "targetDate": "2026-06-08",
  "fundIds": ["FUND001", "FUND002"],  // optional; if empty, ingest all funds
  "priorityLevel": "HIGH" | "NORMAL"
}

Response (202 Accepted):
{
  "jobId": "uuid-1234",
  "status": "QUEUED",
  "dataType": "CVM_NAV",
  "targetDate": "2026-06-08",
  "estimatedCompletionTime": "30s",
  "statusCheckUrl": "/api/v1/ingest/job/uuid-1234"
}
```

### 15.2 Job Status Endpoint

```
GET /api/v1/ingest/job/{jobId}

Response (200 OK):
{
  "jobId": "uuid-1234",
  "status": "COMPLETED" | "PROCESSING" | "FAILED",
  "dataType": "CVM_NAV",
  "targetDate": "2026-06-08",
  "startTime": "2026-06-08T16:30:00Z",
  "completionTime": "2026-06-08T16:30:25Z",
  "recordsProcessed": 1250,
  "recordsFailed": 2,
  "errors": [
    {
      "fundId": "FUND999",
      "reason": "CNPJ_NOT_FOUND"
    }
  ]
}
```

### 15.3 Data Query Endpoint

```
GET /api/v1/ingest/nav/{fundId}/{date}

Response (200 OK):
{
  "fundId": "FUND001",
  "fundName": "Fund Name",
  "navDate": "2026-06-08",
  "navValue": 10.5250,
  "dataQualityFlag": "LIVE",
  "ingestionTimestamp": "2026-06-08T16:30:25Z",
  "sourceUrl": "https://dados.cvm.gov.br/..."
}

Response (404 Not Found):
{
  "code": "NAV_NOT_FOUND",
  "message": "NAV for fund FUND001 on 2026-06-08 not available",
  "fallbackNAV": {
    "navDate": "2026-06-07",
    "navValue": 10.5200,
    "dataQualityFlag": "1_DAY_LAG"
  }
}
```

