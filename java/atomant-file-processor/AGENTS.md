<!-- SPECKIT START -->

# Atomant-File-Processor Specification Kit

This project contains the **File Processor Module** serving as a central intake point for financial documents and data files supporting investment and payment processing workflows.

## Specification Files

For complete context about this module, project structure, engineering principles, and business requirements, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Core engineering principles and code quality standards
   - Java 25, Quarkus CDI, and modern Java idioms (Records, Pattern Matching)
   - Streaming & resource safety for large file handling
   - SOLID principles and clean code guidelines
   - Test-driven development requirements (80%+ line coverage)
   - REST API design conventions and HTTP status codes
   - Native compilation constraints and performance targets
   - <100ms startup time, <50MB memory footprint
   - Stateless, immutable file processing design

2. **[business-rules.md](./.specify/memory/business-rules.md)**
   - Supported file formats: PDF, CSV, Excel, XML, JSON, TXT (with size and type validation)
   - File upload constraints: Max 500 MB per file, 1 GB per 24h per user, rate limiting (10-100 files/day)
   - Magic number validation (prevent format spoofing)
   - Antivirus scanning via ClamAV; malware quarantine procedures
   - Universal validation: Encoding detection, integrity checks, corruption detection
   - Format-specific validation: PDF structure, CSV headers, Excel sheets, XML schemas, JSON schemas
   - Business logic validation: Required fields, data types, fund/account existence, date ranges
   - File processing states and workflows: UPLOADED → VALIDATING → VALIDATED → QUEUED → PROCESSING → PROCESSED
   - File routing by type: Position files, payment files, prospectuses, reconciliation, statements, tax documents
   - Processing guarantees: Idempotency, at-least-once semantics, atomic transactions (with partial success for CSV)
   - Streaming & memory-efficient processing: Chunked processing for large files, resource cleanup, backpressure handling
   - CSV parsing: Delimiter detection, column mapping, data type conversion, row-level error handling
   - PDF/XML/JSON content extraction with error handling
   - Error classification and quarantine procedures: Critical, Schema, Business, Recoverable, Operator errors
   - Retry strategy: Automatic retries (3x exponential backoff), manual retry with approval
   - Partial success handling: CSV files continue on row errors; detailed error reporting
   - Audit trail: 20-year immutable logging of all file events
   - Regulatory compliance: CVM position file audit, COAF payment file AML screening, tax authority requirements
   - Data privacy: PII encryption, access control, user isolation
   - Performance targets: File validation < 5s, parsing 1M rows < 30s, end-to-end < 60s
   - Concurrency & queueing: Max 10 concurrent processors, FIFO queue, priority for payment files
   - Rate limiting: Per-user limits (10-100 files/day), per-type limits, burst capacity
   - Storage & retention: 20-year file retention, compression after 30 days, cold storage after 7 years
   - Integration points: Investment module, payment module, audit module, email notifications
   - API endpoints: Upload, status check, download with full contract specification
   - Testing requirements: 100% coverage for validation, parsing, error handling; integration & performance tests
   - Monitoring & alerting: Upload rate, validation failures, processing success, latency, queue depth, disk usage

## Technology Stack

- **Language**: Java 25
- **Framework**: Quarkus with CDI
- **Build**: Maven
- **Testing**: JUnit 5, Quarkus Test Framework, REST Assured
- **File Processing**: Apache PDFBox, OpenCSV, Apache POI, Woodstox XML
- **Antivirus**: ClamAV integration
- **Storage**: PostgreSQL (metadata), S3/MinIO (archive)
- **Caching**: Redis (optional, for file metadata cache)

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build Docker image
docker build -t atomant-file-processor:latest .

# Push to Docker Hub
docker push joelmaykon/atomant-file-processor:latest
```

## Architecture Overview

The File Processor Module serves four primary functions:

### 1. File Upload & Validation
- Secure file upload with size/rate limiting
- Antivirus scanning (ClamAV)
- Magic number validation (prevent format spoofing)
- Format-specific validation: PDF structure, CSV headers, Excel sheets, XML schemas, JSON schemas
- Business logic validation: Required fields, data types, constraints
- Detailed error reporting with remediation guidance

### 2. File Processing & Extraction
- Streaming, memory-efficient processing for large files (500 MB+)
- Chunked processing to keep memory footprint < 50 MB
- CSV row-by-row parsing with delimiter detection
- PDF text/metadata extraction
- XML/JSON schema validation and element extraction
- Partial success handling (CSV files continue despite row errors)

### 3. File Routing & Workflows
- Route files by type: Position files → Investment module, Payment files → Payment module, Statements → Email distribution
- State machine: UPLOADED → VALIDATING → VALIDATED → QUEUED → PROCESSING → PROCESSED
- Processing guarantees: Idempotency, at-least-once semantics, atomic transactions
- Timeout detection: Mark files as PROCESSING_FAILED if stuck > 1 hour
- Retry strategy: Automatic retries (3x) for transient failures; manual retry for recoverable errors

### 4. Audit & Compliance
- Immutable audit trail: 20-year retention of all file events
- Regulatory compliance: CVM position file auditing, COAF payment file AML screening, tax authority requirements
- Data privacy: PII encryption at rest, access control, user isolation
- Quarantine procedures: Malware & corrupted files isolated; 90-day retention; release requires approval
- Error tracking: Detailed error logs with remediation path for users

## Supported File Types

| Type | Formats | Use Case | Size Limit |
|------|---------|----------|-----------|
| Investment Positions | CSV, Excel | Daily position snapshots | 500 MB |
| Payments | XML, JSON | Batch payment instructions | 200 MB |
| Prospectuses | PDF | Fund regulatory documents | 50 MB |
| Reconciliation | CSV | Bank statement matching | 500 MB |
| Statements | PDF, Excel | Account confirmations | 100 MB |
| Tax Documents | CSV | Tax withholding reporting | 100 MB |

## File Processing Workflow

```
1. Upload (multipart/form-data) → Size & rate limit check
2. Antivirus Scan → ClamAV scan; quarantine if positive
3. Validation → Format check, schema validation, business rules
4. Queuing → Add to processing queue; estimated wait time
5. Processing → Stream-based parsing; extract data
6. Persistence → Store extracted data; update audit trail
7. Routing → Send to downstream module (Investment, Payment, Email)
8. Completion → User notified; file marked PROCESSED
```

## Error Handling Strategy

- **Critical Errors** (virus, corruption, unreadable): Reject; quarantine; immediate notification
- **Schema Errors** (invalid CSV header, XML validation fail): Reject; detailed error list; allow retry
- **Business Errors** (fund doesn't exist, negative amount): Partial success; mark failing rows; detailed report
- **Transient Errors** (network timeout, DB unavailable): Automatic retry (3x) with exponential backoff
- **Operator Errors** (disk full, insufficient resources): Alert operator; allow manual recovery

## Precision & Data Integrity

- **Numeric Fields**: BigDecimal (no Float/Double) for financial amounts
- **Dates**: ISO 8601 format validation (YYYY-MM-DD)
- **Identifiers**: CPF/CNPJ/fund code format validation
- **Checksums**: SHA-256 for file integrity verification
- **Audit Trail**: Cryptographic hashing prevents tampering

## Security Highlights

- **Transport Security**: HTTPS/TLS 1.3 minimum for uploads
- **Antivirus Protection**: ClamAV scanning; malware quarantine
- **Format Validation**: Magic number checks prevent spoofing
- **XXE Protection**: DTD processing disabled; external entities blocked
- **Access Control**: Users can only upload/view own files or assigned funds
- **Data Encryption**: AES-256 encryption at rest
- **PII Handling**: Encrypted temporary files; deleted after processing
- **Audit Trail**: 20-year immutable logging; regulatory access tracked

## Performance Targets

- **File Upload**: < 10 seconds for 50 MB file
- **File Validation**: < 5 seconds for 500 MB CSV
- **CSV Parsing (1M rows)**: < 30 seconds (10k-row chunks)
- **PDF Extraction (1000 pages)**: < 15 seconds (streaming mode)
- **End-to-End Processing**: < 60 seconds for typical 50 MB file
- **Concurrent Processors**: 10 max (configurable)
- **Memory Footprint**: < 500 MB peak for in-memory processing

## Streaming Architecture

- **Row-by-Row Processing**: CSV processed in 10k-row chunks
- **Streaming XML Parser**: Woodstox SAX parser (no DOM loading)
- **Streaming PDF**: PDFBox streaming mode (no full tree in memory)
- **Streaming Excel**: POI streaming API for large .xlsx files
- **Resource Cleanup**: All streams closed in try-with-resources
- **Backpressure Handling**: Slow down input if downstream queue > 1000 items

## API Endpoints

### File Upload
```
POST /api/v1/files/upload
- Content-Type: multipart/form-data
- Body: file, fileType, description, fundId
- Response: fileId, status, estimatedProcessingTime
```

### File Status
```
GET /api/v1/files/{fileId}/status
- Response: status, recordsProcessed, errors, processingTime
```

### File Download
```
GET /api/v1/files/{fileId}/download
- Response: Original file binary data
```

## Testing Coverage Requirements

- **Unit Tests**: 100% coverage of validation rules, parsing logic, error handling
- **Integration Tests**: End-to-end file upload → process → persistence
- **Performance Tests**: Large file processing, concurrent uploads, memory profiling
- **Security Tests**: Virus scanning, format spoofing, XXE prevention, path traversal
- **Regulatory Tests**: Audit trail integrity, data retention, access control

## Monitoring & Alerting

- **File Upload Rate**: Alert if > 2x baseline
- **Validation Failure**: Alert if > 5% failure rate
- **Processing Success**: Alert if < 95% success rate
- **Processing Latency**: Alert if P95 > 30 seconds
- **Queue Depth**: Alert if > 1000 pending files
- **Disk Usage**: Alert if > 90% capacity
- **Antivirus Timeout**: Alert if ClamAV scan > 1 minute

## Dependencies & Integration

- **Upstream**: JWT tokens from `atomant-auth`, fund master data from `atomant-investment-core`
- **Downstream**: Investment module, payment module, `atomant-audit` (file events), email notifications
- **External**: ClamAV (antivirus), PostgreSQL (metadata), S3/MinIO (archive)

## Package Structure

```
org.acme.fileprocessor
├── api                          # REST resources (@Path) for upload/download
├── domain
│   ├── model                    # Java Records for file metadata, processing state
│   └── service                  # FileProcessorService, ValidationService, ParsingService
├── infrastructure.persistence   # JPA entities, repositories
├── infrastructure.external      # ClamAV client, S3 client, Email client
├── processor                    # Format-specific processors (CSVProcessor, PDFProcessor, etc.)
├── validation                   # Validators (SchemaValidator, BusinessRuleValidator)
├── exception                    # Custom exceptions, ExceptionMappers
└── utils                        # Streaming utilities, resource cleanup helpers
```

## Key Design Patterns

- **Strategy Pattern**: Different processors for different file types (CSVProcessor, PDFProcessor, XMLProcessor)
- **Streaming Pattern**: Chunked, incremental processing to keep memory constant
- **Circuit Breaker**: Antivirus and downstream service integrations with fallback
- **Idempotency Key**: File hash used to prevent duplicate processing
- **State Machine**: File state transitions with audit logging
- **Retry Pattern**: Exponential backoff for transient failures

## Regulatory Compliance

- **CVM**: Position file audit trail for securities audits
- **COAF**: Payment file AML screening and SAR reporting
- **Tax Authority**: Tax document processing and retention (10 years minimum)
- **Data Retention**: 20-year retention aligned with `atomant-audit` module

<!-- SPECKIT END -->
