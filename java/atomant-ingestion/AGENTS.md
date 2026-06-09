<!-- SPECKIT START -->

# Atomant-Ingestion Specification Kit

This project contains the **Ingestion Module** serving as the trusted gateway for public financial data from Brazilian regulatory authorities and financial institutions supporting investment and payment processing.

## Specification Files

For complete context about this module, project structure, engineering principles, and business requirements, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Core architectural rules for stateless gateway microservice
   - Microservice responsibilities: Fetch, normalize, sanitize, dispatch data
   - API ingestion rules: CVM daily NAV, BACEN/Ipeadata macroeconomic indicators
   - Resilience patterns: MicroProfile Retry & Circuit Breaker with fallback
   - Data normalization pipeline: Date standardization, numeric precision, data completeness
   - Structural layers: API, domain, infrastructure client, DTO packages

2. **[spec.md](./.specify/memory/spec.md)**
   - OpenAPI 3.0 contract for ingestion endpoints
   - CVM and BACEN client implementations with fault tolerance
   - REST controller definitions
   - Example request/response payloads

3. **[business-rules.md](./.specify/memory/business-rules.md)**
   - Authorized data sources: CVM, BACEN, Ipeadata, B3 with authentication & rate limits
   - Data freshness requirements: Critical (P0), High (P1), Medium (P2) priority
   - Ingestion schedules: Daily jobs (4:15 PM CVM NAV, 8:00 AM calendar/indices), monthly jobs (IPCA, B3 calendar)
   - Manual ingestion triggers: On-demand endpoints with role-based access control
   - Date normalization: Multiple input formats → ISO 8601 standard
   - Numeric normalization: Currency (scale 4), quotas (scale 8), rates (scale 6)
   - String normalization: CPF, CNPJ, fund code, bank account formatting
   - Missing value handling: Defaults, imputation, estimation flags
   - Caching strategy: In-Memory + Redis with configurable TTLs (24h-30d)
   - Cache fallback: Multi-tier lookup (cache → database → API → fallback)
   - Data quality flags: LIVE, CACHED, 1_DAY_LAG, DELAYED, ESTIMATED, FALLBACK, MANUAL_OVERRIDE
   - Graceful degradation: Tier-based fallback (recent data → moving average → conservative default → manual override)
   - Reconciliation & correction window: 24h for NAV, 5 days for indices
   - API failure handling: Circuit breaker states, retry policy (3x exponential backoff), timeout rules
   - Data validation: Type validation, business logic checks, sanity checks
   - Fallback strategy by data type: CVM NAV, BACEN calendar, economic indices, FX rates
   - Data persistence: Ingestion records stored 10 years with audit metadata
   - Audit trail integration: All events logged to atomant-audit module
   - Data lineage tracking: Source → Ingestion → Normalization → Calculation
   - Integration pipelines: NAV updates, index updates, correction flows
   - Performance targets: Ingestion < 30s, API response < 2s, data volume capacity
   - Concurrency & queueing: 5 scheduled jobs, max 5 concurrent manual jobs
   - API rate limiting per source: CVM 1000/hr, BACEN 100/hr, Ipeadata 100/hr
   - Monitoring & alerting: Success rate, data freshness, fallback usage, response time
   - Testing requirements: Unit, integration, performance, resilience tests
   - Regulatory compliance: CVM, BACEN, tax authority requirements
   - API endpoint specifications: Manual trigger, job status, data query

## Technology Stack

- **Language**: Java 25
- **Framework**: Quarkus with CDI
- **Build**: Maven
- **Fault Tolerance**: MicroProfile (Retry, CircuitBreaker, Fallback)
- **REST Clients**: MicroProfile REST Client
- **Testing**: JUnit 5, Quarkus Test Framework, REST Assured
- **Caching**: Redis (distributed), In-Memory Guava/Caffeine
- **Database**: PostgreSQL for ingestion record persistence
- **Scheduling**: Quarkus Scheduler (cron jobs)
- **Messaging**: Kafka/RabbitMQ for event distribution

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build Docker image
docker build -t atomant-ingestion:latest .

# Push to Docker Hub
docker push joelmaykon/atomant-ingestion:latest
```

## Architecture Overview

The Ingestion Module serves four primary functions:

### 1. Data Fetching with Resilience
- Consumes public APIs from CVM, BACEN, Ipeadata, B3
- Implements MicroProfile CircuitBreaker to detect API failures
- Retry logic with exponential backoff (1s, 2s, 4s) + jitter
- Graceful fallback to cached/prior data when API unavailable

### 2. Data Normalization
- Date standardization: Multiple input formats → ISO 8601
- Numeric precision: BigDecimal with HALF_EVEN rounding
  - Currency/NAV: Scale 4
  - Quota quantities: Scale 8
  - Interest rates: Scale 6
- String normalization: CPF, CNPJ, fund codes (uppercase, validated)
- Missing value handling: Defaults, imputation, quality flags

### 3. Caching & Data Consistency
- Multi-tier cache: In-Memory (fast) → Redis (distributed) → Database (persistent)
- Configurable TTLs: NAV 24h, Holidays 30d, Indices 24-30d
- Cache invalidation on manual override or new ingestion
- Data quality flags attached (LIVE, CACHED, DELAYED, ESTIMATED)

### 4. Event Distribution
- Message queue publishing: Kafka/RabbitMQ topics
- Automatic notifications: Investment, Calculator, Payment, Audit modules
- Correction flow: NAV changes trigger recalculation in downstream modules
- Audit trail: All ingestion events logged to atomant-audit

## Authorized Data Sources

| Source | Organization | Update Frequency | Priority |
|--------|--------------|------------------|----------|
| CVM Daily NAV | Securities Commission | Daily (4:00 PM) | P0 Critical |
| BACEN Holidays | Central Bank | Monthly | P1 High |
| BACEN SELIC | Central Bank (SGS #11) | Daily | P1 High |
| BACEN CDI | Central Bank (SGS #12) | Daily | P1 High |
| Ipeadata IPCA | Statistics Bureau | Monthly (11th) | P2 Medium |
| B3 Calendar | Stock Exchange | Monthly | P1 High |

## Ingestion Schedule

| Job | Frequency | Time | Retry | Fallback |
|-----|-----------|------|-------|----------|
| CVM NAV | Daily | 4:15 PM - 8:00 PM | 3x (1s, 2s, 4s) | Prior day NAV |
| BACEN Calendar | Daily | 8:00 AM | 3x | Assume all business days |
| BACEN SELIC/CDI | Daily | 8:00 AM | 3x | Prior day rate (1-day lag) |
| Ipeadata IPCA | Monthly | 11th @ 12:00 PM | 3x | Prior month (ESTIMATED) |
| B3 Calendar | Monthly | Last bus. day @ 4:00 PM | 3x | Use standard market days |

## Data Quality Flags

Every ingested record tagged with quality indicator:

| Flag | Meaning | Triggers Recalculation |
|------|---------|----------------------|
| `LIVE` | Current data from primary source | No |
| `CACHED` | Data from cache (still valid) | No |
| `1_DAY_LAG` | Data from prior day (index not yet published) | Yes, when current available |
| `DELAYED` | Data ingested after cutoff | Yes, once latest available |
| `ESTIMATED` | Data imputed from missing source | Yes, when actual data arrives |
| `FALLBACK` | Data from prior period (source unavailable) | Yes, when source restored |
| `MANUAL_OVERRIDE` | Data manually set by operator | No (audit logged) |

## Caching Strategy

### Cache Types & TTLs
- **CVM NAV**: 24 hours (invalidate on daily job or manual override)
- **BACEN Holidays**: 30 days (invalidate on monthly job)
- **BACEN SELIC/CDI**: 24 hours (invalidate on daily job)
- **Ipeadata IPCA/IGPM**: 30 days (invalidate on monthly job)
- **Exchange Rates**: 24 hours (invalidate on daily update)

### Cache Lookup Flow
```
1. Query In-Memory Cache (fastest)
   ↓ (if miss)
2. Query Redis (distributed cache)
   ↓ (if miss)
3. Query Database (persistent storage)
   ↓ (if miss)
4. Query External API (with circuit breaker)
   ↓ (if API fails)
5. Use Fallback Value (prior day/month)
```

## Graceful Degradation Tiers

**Tier 1**: Most recent cached data
- Use yesterday's NAV if today unavailable
- Use prior month IPCA if current month delayed

**Tier 2**: Historical moving average
- 30-day moving average of SELIC if 3+ days missing
- Marked as "ESTIMATED_MOVING_AVG"

**Tier 3**: Conservative default
- Assume all days are business days (holiday calendar missing)
- Use zero fee day if NAV unavailable > 5 days

**Tier 4**: Manual override
- Compliance officer manually inputs data
- Triggers automatic recalculation
- Audit logged with justification

## Error Handling & Resilience

### Circuit Breaker Pattern
- **CLOSED**: API healthy; pass requests through
- **OPEN**: API unhealthy (≥50% failures); fail fast; use fallback
- **HALF_OPEN**: Testing recovery; allow 1 test request after 10s delay

### Retry Policy
- **Max Retries**: 3 attempts total
- **Backoff**: Exponential (1s, 2s, 4s) with jitter (±200ms)
- **Timeout**: 5s connection, 10s read, 30s total

### Data Validation
- Type validation: Date, numeric, string formats
- Business logic validation: NAV > 0, quotas > 0, CNPJ exists
- Sanity checks: NAV change < 10% from prior day, rate change < 2%

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Fetch CVM NAV (1000+ funds) | < 10s | Streaming parser |
| Parse & normalize data | < 5s | Batch processing 10k records |
| Persist to database | < 5s | Bulk insert; batch 1000 |
| Cache update | < 1s | Redis distributed cache |
| Total ingestion pipeline | < 30s | End-to-end |
| API response (manual trigger) | < 2s | Return job ID; async processing |

## Concurrent Processing

- **Scheduled jobs**: 6 daily jobs processed serially (no conflicts)
- **Manual ingestion requests**: Max 5 concurrent
- **Thread pool**: Core 5, Max 20, Queue 100
- **Rate limiting**: CVM 1000/hr, BACEN 100/hr, Ipeadata 100/hr

## Monitoring & Alerting

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Ingestion success rate | > 98% | Alert if < 95% |
| Data freshness | Current day/month | Alert if > 24h lag |
| Fallback usage | < 5% | Alert if > 20% |
| Cache hit rate | > 90% | Alert if < 80% |
| API response time P95 | < 5s | Alert if > 10s |
| Circuit breaker OPEN | Minimize | Alert if > 30 min |
| Validation failure | < 1% | Alert if > 2% |

## API Endpoints

### Manual Ingestion Trigger
```
POST /api/v1/ingest/trigger

Request:
{
  "dataType": "CVM_NAV|BACEN_SELIC|BACEN_CDI|IPEADATA_IPCA",
  "targetDate": "2026-06-08",
  "fundIds": ["FUND001"],  // optional
  "priorityLevel": "HIGH|NORMAL"
}

Response (202 Accepted):
{
  "jobId": "uuid",
  "status": "QUEUED",
  "estimatedCompletionTime": "30s"
}
```

### Job Status Check
```
GET /api/v1/ingest/job/{jobId}

Response (200 OK):
{
  "jobId": "uuid",
  "status": "COMPLETED|PROCESSING|FAILED",
  "recordsProcessed": 1250,
  "recordsFailed": 2,
  "errors": [{ "fundId": "FUND999", "reason": "CNPJ_NOT_FOUND" }]
}
```

### Data Query
```
GET /api/v1/ingest/nav/{fundId}/{date}

Response (200 OK):
{
  "fundId": "FUND001",
  "navDate": "2026-06-08",
  "navValue": 10.5250,
  "dataQualityFlag": "LIVE",
  "ingestionTimestamp": "2026-06-08T16:30:25Z"
}

Response (404 Not Found with Fallback):
{
  "code": "NAV_NOT_FOUND",
  "fallbackNAV": {
    "navDate": "2026-06-07",
    "navValue": 10.5200,
    "dataQualityFlag": "1_DAY_LAG"
  }
}
```

## Data Normalization Examples

**Date Conversion**
- Input: `08/06/2026` → Output: `2026-06-08`
- Input: `20260608` → Output: `2026-06-08`
- Input: `1686225600` → Output: `2026-06-08`

**Numeric Normalization**
- NAV: `1.000,50` → `1000.5000` (scale 4)
- Quotas: `1.000.000,12345678` → `1000000.12345678` (scale 8)
- Rate: `15%` → `0.150000` (scale 6)

**String Normalization**
- CNPJ: `00.000.000/0001-00` → `00000000000100`
- CPF: `123.456.789-01` → `12345678901`
- Fund Code: `fnd001` → `FND001`

## Integration Points

- **Upstream**: CVM, BACEN, Ipeadata, B3 public APIs
- **Downstream**: Investment module, Calculator module, Payment module, Audit module
- **Message Queue**: Kafka/RabbitMQ for event distribution
- **Cache**: Redis for distributed caching
- **Database**: PostgreSQL for ingestion record persistence

## Testing Coverage

- **Unit Tests**: 100% of normalization, validation, fallback logic
- **Integration Tests**: End-to-end with mock external APIs
- **Performance Tests**: Large payloads, concurrent requests, memory profiling
- **Resilience Tests**: Circuit breaker transitions, retry backoff, fallback verification

## Regulatory Compliance

- **CVM**: Daily NAV audit trail (20-year retention)
- **BACEN**: Working calendar for 252-day calculations
- **Tax Authority**: Index tracking for tax withholding calculations
- **Data Retention**: 10 years for all ingestion records

## Key Design Patterns

- **Circuit Breaker**: Protect against cascading failures from external APIs
- **Retry**: Exponential backoff with jitter to prevent thundering herd
- **Fallback**: Multi-tier graceful degradation (recent → average → default → manual)
- **Cache-Aside**: On-demand cache population from database/API
- **Saga**: Async event distribution for coordination with downstream modules

## Security & Data Protection

- **Public APIs**: No authentication required (all CVM/BACEN/Ipeadata data is public)
- **Transport Security**: HTTPS/TLS 1.3 for all outbound requests
- **Data Encryption**: Sensitive data encrypted at rest (if any)
- **Access Control**: Manual override requires COMPLIANCE_OFFICER role
- **Audit Trail**: All ingestion events logged immutably for 10 years

<!-- SPECKIT END -->
