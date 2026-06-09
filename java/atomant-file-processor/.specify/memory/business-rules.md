# Business Rules: File Processor Module for Investment & Payment Operations

## Overview

This document defines the business rules governing file upload, validation, parsing, and processing within the `atomant-file-processor` module. This module serves as a central intake point for financial documents and data files supporting investment and payment processing workflows.

---

## 1. File Upload & Acceptance Rules

### 1.1 Supported File Formats

| Format | Extension | Mime Type | Max Size | Use Case |
|--------|-----------|-----------|----------|----------|
| PDF | .pdf | application/pdf | 50 MB | Prospectuses, offering documents, fund fact sheets |
| CSV | .csv | text/csv | 500 MB | Position files, transaction history, batch reconciliation |
| Excel | .xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | 100 MB | Fund allocations, performance reports, position exports |
| XML | .xml | application/xml | 200 MB | Bank transfer files (ISO 20022), SWIFT messages |
| JSON | .json | application/json | 100 MB | API-based data exchanges, structured position data |
| Text | .txt | text/plain | 50 MB | Legacy bank formats, comma-separated legacy files |

### 1.2 File Upload Constraints

#### Size & Rate Limiting
- **Maximum Single File**: 500 MB (configurable per file type)
- **Maximum Batch Upload**: 1 GB total per 24-hour period per quota holder
- **Rate Limiting**:
  - Retail investor: 10 files per day maximum
  - Institutional investor: 100 files per day maximum
  - Fund manager: Unlimited (internally managed)
- **Upload Timeout**: 30 minutes (before connection closed)
- **Concurrent Uploads per User**: Max 3 simultaneous uploads

#### File Naming & Metadata
- **Filename Requirements**:
  - Maximum 255 characters
  - Allowed characters: A-Z, a-z, 0-9, hyphen (-), underscore (_), period (.)
  - Must include file type prefix: `POSITIONS_`, `PAYMENTS_`, `PROSPECTUS_`, `RECONCILIATION_`, `STATEMENTS_`
  - Recommended format: `{PREFIX}_{DATE}_{SEQUENCE}.{EXTENSION}`
  - Example: `POSITIONS_20260608_001.csv`

- **Metadata Requirements** (submitted with upload):
  - File description (free text, max 500 chars)
  - Upload date (captured server-side; for audit)
  - Intended processing date (may differ from upload date)
  - Fund ID or account ID (which entity this file relates to)
  - Optional: Checksum (SHA-256) for integrity verification

#### Magic Number Validation
Files validated by magic number (first N bytes), NOT by extension:
- **PDF**: `%PDF-` (hex: 25 50 44 46 2D)
- **CSV/TXT**: Validated by content parsing (no specific magic number; character encoding checked)
- **Excel**: `PK\x03\x04` (hex: 50 4B 03 04) for .zip-based XLSX format
- **XML**: `<?xml` or `<` (after optional BOM) (hex: 3C 3F 78 6D 6C)
- **JSON**: `{` or `[` (after whitespace) (hex: 7B or 5B)

**Rejection Rule**: If magic number does not match declared file type, reject with error `INVALID_FILE_FORMAT`.

### 1.3 Upload Security

#### Virus & Malware Scanning
- All uploads scanned by ClamAV antivirus before acceptance
- Files quarantined if virus detected; user notified; file marked as `INFECTED`
- Infected files retained for 30 days, then deleted
- Antivirus scan logged in audit trail

#### Authentication & Authorization
- Upload requires valid JWT token (from `atomant-auth`)
- User must have `INVESTOR_RETAIL`, `INVESTOR_INSTITUTIONAL`, `FUND_MANAGER`, or `ADMIN` role
- Quota holders can only upload files for their own accounts/funds
- Fund managers can upload files for their assigned funds
- Admins can upload files for any entity

#### HTTPS & Transport Security
- All uploads over HTTPS (TLS 1.3 minimum)
- Client certificate validation optional (configurable per institution)
- IP whitelisting available for institutional investors (configurable)

---

## 2. File Validation Rules

### 2.1 Universal Validation

#### Encoding Validation
- **Supported Encodings**: UTF-8, UTF-16, ASCII, ISO-8859-1 (Latin-1)
- **Enforcement**: File automatically detected and converted to UTF-8; if detection fails, reject
- **BOM Handling**: UTF-8 BOM stripped if present

#### Integrity Checks
- **Checksum Verification** (if provided by client):
  - Client submits SHA-256 hash with upload
  - Server computes hash of stored file
  - If mismatch, reject with error `CHECKSUM_MISMATCH`
  - File quarantined for investigation

- **Corruption Detection**:
  - Incomplete file (partial transfer): Reject if file size < expected size (if known)
  - Unreadable bytes (binary garbage in text file): Reject with `ENCODING_ERROR`

#### Empty File Validation
- Reject files with 0 bytes
- Reject files with only whitespace or BOM (no actual content)
- Error code: `EMPTY_FILE`

### 2.2 Format-Specific Validation

#### PDF Validation
- **Header Check**: Verify `%PDF-` header (version 1.0 to 2.0 supported)
- **Structure Check**: Verify presence of xref/trailer (valid PDF structure)
- **Encryption Check**: Flag if PDF is password-protected (note in audit trail; may reject depending on policy)
- **Content Extraction**: Verify at least 100 bytes of readable text content
- **Size Limits**:
  - Minimum: 1 KB (after header validation)
  - Maximum: 50 MB
  - Page count limit: Max 10,000 pages

#### CSV Validation
- **Header Row Requirement**: First row contains column headers (required)
- **Delimiter Detection**: Auto-detect delimiter (comma, semicolon, tab); support configurable override
- **Consistent Columns**: Every row must have same number of columns as header
- **Quote Handling**: Support RFC 4180 quoted fields (double-quote escaping)
- **Row Count Limits**:
  - Minimum: 2 rows (header + 1 data row)
  - Maximum: 1,000,000 rows
- **Column Count**: Maximum 1000 columns per row

#### Excel (.xlsx) Validation
- **Sheet Detection**: Auto-detect primary sheet (first sheet, or named sheet if metadata provided)
- **Cell Limits**:
  - Max 1,000,000 rows per sheet
  - Max 16,384 columns per sheet
- **Data Type Validation**: Detect column data types (text, number, date, boolean)
- **Formula Handling**: Extract formula results, not formulas themselves (for safety)
- **Encrypted Sheet Protection**: Flag if sheet is password-protected (may reject per policy)

#### XML Validation
- **XML Schema Validation** (if schema provided):
  - Validate against provided XSD or WSDL schema
  - Reject if validation fails; return schema validation errors
- **Well-Formedness Check**: Verify XML is well-formed (proper nesting, valid encoding)
- **Namespace Handling**: Support XML namespaces; extract accordingly
- **DTD Processing**: Disabled for security (prevent XXE attacks)
- **Maximum Document Size**: 200 MB

#### JSON Validation
- **Syntax Check**: Verify valid JSON structure (no trailing commas, proper quotes, etc.)
- **Schema Validation** (if schema provided):
  - Validate against provided JSON Schema
  - Reject if validation fails; return schema validation errors
- **Nested Structure Limits**:
  - Maximum nesting depth: 100 levels
  - Maximum array length: 1,000,000 items
  - Maximum object properties: 10,000 per object

### 2.3 Business Logic Validation

#### Required Fields
Depending on file type and purpose:

**POSITIONS CSV**:
- Required columns: `fundCode`, `quotaHolderId`, `quotaCount`, `asOfDate`
- Optional columns: `currency`, `notes`

**PAYMENTS XML/JSON**:
- Required fields: `paymentId`, `amount`, `currency`, `destinationBank`, `destinationAccount`, `paymentDate`
- Optional fields: `description`, `reference`, `urgency`

**RECONCILIATION CSV**:
- Required columns: `transactionId`, `amount`, `date`, `status`
- Must reference existing transactions in system database

#### Data Type Validation
- **Numeric Fields**: Valid decimal numbers (supports scientific notation)
  - Example: `1000.50`, `1.5E+3` (=1500)
  - Negative values allowed where applicable (e.g., reversals)
- **Date Fields**: ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
  - Validation: Date must be ≤ today (no future dates unless explicitly allowed)
- **Currency Fields**: Valid ISO 4217 code (e.g., BRL, USD, EUR)
- **Identifiers**: Format validation per entity type (CPF, CNPJ, fund code, account number)

#### Business Rule Validation
- **Fund Existence**: Referenced fund codes must exist in system
- **Quota Holder Validation**: CPF/CNPJ must match authenticated user (prevent cross-holder uploads)
- **Date Consistency**: 
  - `asOfDate` or `transactionDate` must be ≤ today
  - Batch date ranges must be contiguous (no gaps for daily position files)
- **Amount Validation**:
  - Positive amounts for investments, negative for redemptions
  - Amount ranges per investor type (min/max constraints)
  - Aggregate daily limit validation (prevent bulk overfunding)

### 2.4 Validation Error Handling

#### Error Classification

| Error Code | Severity | Action |
|-----------|----------|--------|
| `INVALID_FILE_FORMAT` | Critical | Reject; quarantine file |
| `FILE_CORRUPTED` | Critical | Reject; quarantine file |
| `ENCODING_ERROR` | Critical | Reject; suggest re-export with UTF-8 |
| `SCHEMA_VALIDATION_FAILED` | High | Reject; provide detailed validation errors |
| `BUSINESS_RULE_VIOLATION` | Medium | Accept file; mark rows/records as error; report in processing summary |
| `FILE_TOO_LARGE` | High | Reject; suggest splitting file |
| `UNSUPPORTED_FORMAT` | Critical | Reject; provide list of supported formats |

#### Error Response Format
```json
{
  "code": "SCHEMA_VALIDATION_FAILED",
  "message": "File validation failed with 5 errors",
  "details": [
    {
      "row": 15,
      "field": "quotaCount",
      "issue": "must be a positive number; found negative value: -100"
    },
    {
      "row": 22,
      "field": "asOfDate",
      "issue": "invalid date format; expected YYYY-MM-DD, found: 08/06/2026"
    }
  ]
}
```

#### User Notification
- **Critical Errors**: Immediate notification to user (email + in-app notification)
- **High Errors**: Notification within 1 hour
- **Medium Errors**: Notification within 24 hours (included in processing summary)
- Retry guidance provided (e.g., "Fix row 15 and resubmit")

---

## 3. File Processing Workflows

### 3.1 File Processing States

```
UPLOADED → VALIDATING → VALIDATED → QUEUED → PROCESSING → PROCESSED
              ↓                                    ↓
           REJECTED                            PARTIALLY_PROCESSED
                                                    ↓
                                              PROCESSING_FAILED
```

#### State Definitions
- **UPLOADED**: File received and scanned; awaiting validation
- **VALIDATING**: Validation checks in progress
- **VALIDATED**: Passed all validation checks; ready for processing
- **REJECTED**: Failed validation; marked for user correction
- **QUEUED**: Validated; waiting for processing slot (rate-limited)
- **PROCESSING**: Currently being processed (parsing, data extraction)
- **PROCESSED**: Successfully processed; data extracted and routed
- **PARTIALLY_PROCESSED**: Some records processed, some failed (e.g., CSV with errors on rows 5, 10)
- **PROCESSING_FAILED**: Processing aborted due to error; investigation required

#### State Transition Rules
- State transitions logged with timestamp, actor, and reason
- Transitions only move forward (except retries: REJECTED → VALIDATING)
- Timeout if in PROCESSING for > 1 hour (mark as PROCESSING_FAILED; alert ops)

### 3.2 File Routing by Type

#### Investment-Related Files

**POSITIONS_{DATE}_*.csv**
- Contains quota holder positions (daily snapshot)
- Flow: VALIDATE → EXTRACT → RECONCILE → PERSIST to position database
- Triggers: Position reconciliation job (daily), portfolio reporting
- Downstream: `atomant-investment-core`, `atomant-audit`

**PROSPECTUS_*.pdf** or **FACT_SHEET_*.pdf**
- Fund regulatory documents
- Flow: VALIDATE → EXTRACT METADATA → STORE → NOTIFY investors
- Triggers: Document distribution to portfolio holders
- Downstream: Email service, document repository

#### Payment-Related Files

**PAYMENTS_{DATE}_*.xml** or **PAYMENTS_{DATE}_*.json**
- Batch payment instructions (bank transfer files)
- Flow: VALIDATE → PARSE → ROUTE TO PAYMENT MODULE → EXECUTE
- Validation: ISO 20022 (XML) format for bank transfers
- Triggers: Payment execution in `atomant-payment` module
- Downstream: `atomant-payment`, banking system

**RECONCILIATION_{DATE}_*.csv**
- Bank statement reconciliation data
- Flow: VALIDATE → MATCH TO PENDING PAYMENTS → RECONCILE → REPORT
- Validation: Each transaction must reference existing payment record
- Triggers: Daily reconciliation job
- Downstream: `atomant-audit`, reconciliation reports

#### Administrative Files

**STATEMENTS_*.pdf** or **STATEMENTS_*.xlsx**
- Investor statements, account confirmations
- Flow: VALIDATE → STORE → DISTRIBUTE
- Triggers: Email to investors, secure download portal
- Downstream: Email service, secure document repository

**TAX_REPORTING_*.csv**
- Tax withholding and reporting data
- Flow: VALIDATE → EXTRACT → GENERATE INFO FORMS → SUBMIT TO TAX AUTHORITY
- Triggers: Monthly/quarterly tax reporting
- Downstream: Tax reporting system, COAF (if AML-related)

### 3.3 Processing Guarantees

#### Idempotency
- File processing must be idempotent (processing same file twice = same result)
- Implementation: File hash (SHA-256) used as unique identifier; re-processing rejected if hash already processed
- Window: 30-day idempotency window (can reprocess within 30 days if failed)
- After 30 days: Manual override required (with compliance approval)

#### Delivery Semantics
- **At-Least-Once**: If processing partially succeeds, mark as PARTIALLY_PROCESSED and allow retry
- **Exactly-Once**: For payment files, enforce exactly-once delivery via `paymentId` deduplication
  - If same `paymentId` resubmitted, idempotency key prevents duplicate payment execution

#### Transaction Boundaries
- **Atomic Processing**: Either entire file processes successfully, or entire transaction rolled back (for ACID compliance)
- **Exception**: CSV files with row-level errors processed as PARTIALLY_PROCESSED (rows succeed/fail independently)
- **Rollback Trigger**: Critical error (database unavailable, network failure) rolls back entire transaction; file marked PROCESSING_FAILED

### 3.4 Streaming & Memory-Efficient Processing

#### Chunked Processing Strategy
- **CSV/Text Files**: Process row-by-row (not loading entire file into memory)
  - Example: For 500 MB CSV (1M rows), process in chunks of 10,000 rows
  - Memory usage: Constant regardless of file size
  
- **XML Files**: Use streaming XML parser (e.g., Woodstox SAX parser)
  - Do not load entire XML tree into DOM (causes OOM on large files)
  - Namespace-aware streaming preferred
  
- **PDF Files**: Extract content via streaming API (e.g., Apache PDFBox streaming mode)
  - Avoid loading entire PDF into memory
  - Extract text/metadata incrementally

- **Excel Files**: Use streaming reader for large .xlsx files (e.g., Apache POI streaming API)
  - Formula results extracted; formulas not re-calculated

#### Resource Cleanup
- All file handles, streams, connections closed in try-with-resources or finally block
- Temporary files deleted immediately after processing (even if processing fails)
- Database connections returned to pool after each batch commit
- Memory released after processing (force GC if memory > 80% usage)

#### Backpressure Handling
- If downstream system cannot accept records (queue full), slow down upload processing
- Example: Payment executor rate-limited to 100/sec; file processor waits if queue > 1000
- Timeout: If backpressure for > 10 minutes, mark as PROCESSING_FAILED; alert operator

---

## 4. Data Extraction & Transformation Rules

### 4.1 CSV Parsing

#### Delimiter & Encoding Detection
- **Delimiter Detection**: Attempt comma, semicolon, tab in order; use first successful delimiter
- **Encoding Detection**: Attempt UTF-8 → UTF-16 → ISO-8859-1; reject if none successful
- **Quote Handling**: Support RFC 4180 quoted fields; double-quote escaping (`""` → `"`)

#### Column Mapping
- Map CSV columns to domain model fields using header row
- Support case-insensitive header matching (e.g., `quotacount`, `Quota Count`, `QUOTA_COUNT` all match `quotaCount`)
- Unknown columns logged as warnings; processing continues
- Missing required columns cause row rejection

#### Data Type Conversion
- **Numeric Strings**: Parse as BigDecimal (preserve precision; no Float/Double)
- **Date Strings**: Parse ISO 8601 format; convert to `LocalDate` or `LocalDateTime`
- **Boolean Strings**: Accept `true`/`false`, `yes`/`no`, `1`/`0` (case-insensitive)
- **Currency/Amounts**: Strip currency symbols; parse as BigDecimal
- **Whitespace**: Trim leading/trailing whitespace from all fields

#### Error Handling per Row
- If row fails validation: Record error with row number and reason; continue processing subsequent rows
- Partial success: Rows 1-100 process; row 105 fails; rows 101-104, 106+ continue
- Summary: Return count of successful and failed rows; list first 10 errors

### 4.2 PDF Content Extraction

#### Text Extraction
- Extract all readable text using PDFBox or similar library
- Preserve paragraph structure (line breaks, spacing)
- Tables: Extract as delimited text (attempt to identify column boundaries)
- Ignore images, graphics (extract metadata only)

#### Metadata Extraction
- Title, Author, Subject, Keywords from PDF document properties
- Creation date, modification date
- Page count

#### Layout Analysis (optional)
- For structured PDFs (forms, statements), attempt to extract as structured data
- Example: Statement PDF → extract account number, balance, transaction list
- Fallback to raw text if layout analysis fails

#### Encryption Handling
- Reject password-protected PDFs (cannot validate content)
- Flag in audit trail; user notified

### 4.3 XML Parsing

#### Namespace Handling
- Preserve XML namespaces; extract with qualified names
- Support default namespaces
- XPath queries respect namespaces

#### Schema Validation
- If XSD schema provided with upload metadata, validate XML against schema
- Extract validation errors with line/column information
- Reject if schema validation fails

#### Element Extraction
- Extract root element and child elements recursively
- Convert to domain model records
- Handle attributes and nested elements

#### Entity Reference Protection
- Disable external entity resolution (XXE attack prevention)
- Disable DTD processing entirely
- Only allow well-formed XML with internal entities

### 4.4 JSON Parsing

#### Structure Validation
- Parse JSON and validate structure against expected schema (if provided)
- Support nested objects and arrays
- Detect invalid JSON syntax early

#### Schema Validation
- If JSON Schema provided, validate against schema
- Return detailed validation errors with path information
- Reject if schema validation fails

#### Null Handling
- JSON `null` values treated as missing fields (optional fields)
- Required fields with `null` values cause record rejection

#### Type Coercion
- Strings → Dates: Parse ISO 8601 format only
- Strings → Numbers: Reject if not valid number
- Number → String: Coerce (e.g., account number)
- No implicit type coercion beyond standard conversions

---

## 5. Error Handling & Quarantine Procedures

### 5.1 Error Classification

| Category | Examples | Action |
|----------|----------|--------|
| **Critical** | Virus detected, file corrupted, unreadable | Reject; quarantine; notify immediately |
| **Schema** | Invalid CSV header, wrong column count | Reject; provide detailed errors; allow retry |
| **Business** | Fund code doesn't exist, negative quota count | Accept file; mark rows as failed; generate report |
| **Recoverable** | Network timeout during processing | Retry automatically (up to 3 times); mark as PROCESSING_FAILED if exhausted |
| **Operator** | Insufficient disk space, database unavailable | Retry with exponential backoff; alert operator after 30 minutes |

### 5.2 Quarantine Procedures

#### Quarantine Triggers
- Virus detected by antivirus scan
- File hash matches known malicious file
- Corruption detected (unrecoverable read error)
- Repeated processing failures (> 3 retry attempts)

#### Quarantine Storage
- Move to segregated quarantine directory (not accessible to normal processing)
- Retain for 90 days (configurable)
- Encrypt in storage (AES-256)
- Log access to quarantine files (audit trail)

#### Quarantine Release
- Requires explicit approval from compliance officer or administrator
- Approval logged with timestamp, approver ID, justification
- File re-validated before reprocessing

#### Quarantine Cleanup
- Automatic deletion after 90-day retention period
- Manual deletion available for compliance officers
- Deletion logged in audit trail

### 5.3 Retry Strategy

#### Automatic Retries
- **Transient Failures**: Network errors, timeouts, temporary database unavailability
  - Retry up to 3 times with exponential backoff: 1s, 2s, 4s
  - After 3 failures: Mark as PROCESSING_FAILED; alert operator
  
- **Non-Transient Failures**: Schema errors, business logic errors, invalid data
  - No automatic retry
  - User notified; file marked as REJECTED (recoverable)
  - User must fix and resubmit

#### Manual Retry
- Operator or user can manually trigger retry from UI/API
- Retry requires approval if previous attempts > 2
- Retry count incremented; tracked in audit trail

### 5.4 Partial Success Handling

For CSV files with row-level errors:

#### Processing Continues on Row Errors
```
POSITIONS_20260608_001.csv
- Row 1: Header ✓
- Row 2: Valid ✓
- Row 3: Invalid (quotaCount=-100) ✗ [recorded]
- Row 4: Valid ✓
- Row 5: Invalid (asOfDate=future) ✗ [recorded]
- Row 6-1000: Valid ✓

Result: 998 rows processed, 2 rows failed
File status: PARTIALLY_PROCESSED
```

#### Error Reporting
```json
{
  "fileId": "file-uuid-123",
  "fileStatus": "PARTIALLY_PROCESSED",
  "summary": {
    "totalRows": 1000,
    "successRows": 998,
    "failedRows": 2,
    "successPercentage": 99.8
  },
  "errors": [
    {
      "row": 3,
      "data": { "quotaCount": "-100" },
      "issue": "quotaCount must be positive"
    },
    {
      "row": 5,
      "data": { "asOfDate": "2026-06-15" },
      "issue": "asOfDate cannot be in the future (today: 2026-06-08)"
    }
  ]
}
```

#### User Actions
- **Accept Partial Results**: User confirms that 998 rows are acceptable; 2 rows discarded
- **Retry with Corrections**: User corrects 2 rows; resubmits file
- **Reject Entire File**: User decides to discard file; reprocess later

---

## 6. Audit & Compliance Requirements

### 6.1 Audit Trail

Every file upload and processing event logged immutably:

```json
{
  "eventId": "uuid",
  "timestamp": "2026-06-08T14:30:00Z",
  "eventType": "FILE_UPLOADED | FILE_VALIDATED | FILE_PROCESSING_STARTED | FILE_PROCESSED | FILE_REJECTED | FILE_QUARANTINED",
  "fileId": "uuid",
  "fileName": "POSITIONS_20260608_001.csv",
  "fileSizeBytes": 52428800,
  "fileSha256": "hash",
  "userId": "investor-uuid",
  "userRole": "INVESTOR_RETAIL",
  "fundId": "fund-uuid",
  "fileStatus": "PROCESSED",
  "processingTimeMs": 1250,
  "recordsProcessed": 10000,
  "recordsFailed": 0,
  "virusScanStatus": "CLEAN",
  "validationErrors": [],
  "processingErrors": []
}
```

**Retention Policy**: 20 years (same as `atomant-audit` module)

### 6.2 Regulatory Compliance

#### CVM (Securities Commission) Requirements
- All investor position files must be audit-logged
- File processing audit trail must be available for regulatory inspection
- Ability to reconstruct investor holdings from position file audit trail

#### COAF (Financial Intelligence Unit) Requirements
- All payment files scanned for AML-relevant patterns
- Files processed with payment sanctions screening
- High-value files (> R$ 100k) flagged for potential SAR (Suspicious Activity Report)

#### Tax Authority Requirements
- Tax reporting files processed with cryptographic signature validation
- Processing audit trail available for tax authority requests
- Tax data retention for 10 years minimum

### 6.3 Data Privacy & Security

#### PII Handling
- Files may contain personally identifiable information (name, CPF, bank account)
- Temporary files encrypted while in-flight; deleted after processing
- PII not logged to application logs (redacted in audit trail)
- PII visible only to authorized users (investor viewing their own data)

#### Access Control
- Users can only upload/view files for their own accounts or assigned funds
- Admins can upload/view any file (audited)
- Fund managers can upload/view files for assigned funds only

#### Encryption at Rest
- Uploaded files encrypted before storage (AES-256)
- Encryption key managed by HSM (Hardware Security Module)
- Key rotation every 90 days

---

## 7. Performance & Scalability Rules

### 7.1 Processing Performance

| Operation | Target Latency | Constraints |
|-----------|---------------|-------------|
| File Upload | < 10s | For 50 MB file over 10 Mbps connection |
| File Validation | < 5s | For 500 MB CSV file |
| CSV Parsing (1M rows) | < 30s | Row-by-row streaming; chunked at 10k rows |
| XML Parsing (200 MB) | < 10s | Streaming XML parser |
| PDF Extraction (1000 pages) | < 15s | Streaming PDFBox; skips images |
| File Processing (start to finish) | < 60s | For typical 50 MB file |

### 7.2 Concurrency & Queueing

#### Processing Queue
- Queued files processed in FIFO order
- Max 10 concurrent file processors (configurable)
- If queue > 100 files, new uploads queued with estimated wait time
- Priority queue for payment files (processed ahead of position files)

#### Rate Limiting
- Per-user: 10 files/day (retail), 100 files/day (institutional), unlimited (fund manager)
- Per-type: CSV files max 5/hour, XML files max 2/hour (to prevent spam)
- Burst capacity: 20% above sustained rate for peak hours

#### Resource Pooling
- Connection pool: Min 10, Max 50 database connections
- File I/O thread pool: 20 threads for concurrent file operations
- Temporary file quota: Max 100 GB total; oldest files deleted when exceeded

### 7.3 Storage & Retention

#### File Storage
- Original uploaded files retained for audit trail (20 years)
- Compressed after 30 days (gzip compression, reduces size 80%)
- Archived to cold storage (S3 Glacier) after 7 years

#### Processed Data Storage
- Extracted data persisted to database (20-year retention)
- Indexes on commonly-queried fields (fileId, userId, processingDate)
- Partitioned by month for query performance

#### Temporary File Management
- Temp files stored in `/tmp` or configurable temp directory
- Automatic cleanup after 24 hours (or immediately after processing)
- Disk space monitoring; alert if > 90% usage

---

## 8. Integration Points & Dependencies

### 8.1 Upstream Dependencies
- **Authentication**: JWT tokens from `atomant-auth` (for access control)
- **User Registry**: User profiles from `atomant-auth` (for role verification)
- **Fund Master Data**: Fund definitions from `atomant-investment-core`

### 8.2 Downstream Dependencies
- **Investment Module** (`atomant-investment-core`): Position files feed investment processing
- **Payment Module** (`atomant-payment`): Payment files routed to payment execution
- **Audit Module** (`atomant-audit`): All file processing events logged
- **Integration Module** (`atomant-integration`): Email notifications for file completion
- **Calculator Module** (`atomant-calculator`): Validation against fee schedules (if applicable)

### 8.3 External Services
- **Antivirus Service**: ClamAV for malware scanning
- **Email Service**: SMTP for notifications
- **Object Storage**: S3/MinIO for file archive
- **Database**: PostgreSQL for file metadata and audit trail

---

## 9. Testing & Validation Requirements

### 9.1 Unit Test Coverage

- **File Validation**: 100% coverage of validation rules
  - Valid files: PDF, CSV, XML, JSON
  - Invalid files: Corrupted, wrong format, encoding errors
  - Edge cases: Empty files, maximum size files, unusual delimiters
  
- **CSV Parsing**: 100% coverage
  - Headers, row parsing, delimiter detection
  - Quoted fields, escaped characters
  - Data type conversion (numeric, date, boolean)
  
- **Error Handling**: 100% coverage
  - Retry logic, backpressure, timeout handling
  - Partial success scenarios
  - Quarantine procedures

### 9.2 Integration Tests

- **End-to-End File Processing**:
  - Upload file → Validate → Process → Verify output
  - Test with real file types (PDF, CSV, XML, JSON)
  - Test with realistic data volumes (1M+ rows)
  
- **Downstream Integration**:
  - File processed → Data persisted to database → Verified in audit trail
  - Payment file → Processed → Routed to payment module → Payment executed
  
- **Error Scenarios**:
  - Network failures during upload
  - Database unavailable during processing
  - Storage full during file save
  - Antivirus timeout

### 9.3 Performance Tests

- **Upload Performance**: Test 500 MB file upload over slow connection (1 Mbps)
- **Parsing Performance**: CSV with 1M rows; XML with 200 MB; PDF with 10k pages
- **Concurrency**: 100 concurrent file uploads; 10 concurrent processing operations
- **Memory Usage**: Monitor heap usage during large file processing; target < 500 MB peak

### 9.4 Security Tests

- **Virus Scanning**: Upload known test virus signature (EICAR); verify quarantine
- **File Format Spoofing**: PDF file with .xlsx extension; verify magic number validation
- **XXE Prevention**: XML file with external entity declaration; verify rejection
- **Path Traversal**: Filename with `../` traversal attempt; verify sanitization
- **Large File DOS**: Upload multiple 500 MB files rapidly; verify rate limiting

---

## 10. Monitoring & Alerting

### 10.1 Key Metrics

- **File Upload Rate**: Files/minute (alert if > 2x baseline)
- **Validation Failure Rate**: % of files failing validation (alert if > 5%)
- **Processing Success Rate**: % of files processed successfully (alert if < 95%)
- **Processing Latency**: P50, P95, P99 percentiles (alert if P95 > 30s)
- **Queue Depth**: Number of files waiting for processing (alert if > 1000)
- **Disk Usage**: Total storage usage (alert if > 90% capacity)

### 10.2 Alerting Thresholds

| Condition | Severity | Action |
|-----------|----------|--------|
| Processing latency P95 > 30s | Medium | Alert ops; investigate bottleneck |
| File processing failure rate > 10% | High | Alert ops; check for data quality issues |
| Disk usage > 95% | Critical | Alert ops immediately; trigger archive/cleanup |
| Antivirus scan timeout > 1 minute | High | Alert ops; restart antivirus service |
| Queue depth > 5000 files | High | Alert ops; scale up processing workers |
| Payment file processing > 2 hours | Critical | Alert ops; escalate to payment team |

---

## 11. API Endpoints & Contract

### 11.1 File Upload Endpoint

```
POST /api/v1/files/upload

Request:
- Headers: Authorization: Bearer {JWT}
- Content-Type: multipart/form-data
- Body:
  - file: Binary file data
  - fileType: POSITIONS | PAYMENTS | PROSPECTUS | RECONCILIATION | STATEMENTS | TAX_REPORTING
  - description: String (optional, max 500 chars)
  - fundId: UUID (required for fund-specific files)

Response (201 Created):
{
  "fileId": "uuid",
  "fileName": "POSITIONS_20260608_001.csv",
  "fileSize": 52428800,
  "uploadTime": "2026-06-08T14:30:00Z",
  "status": "VALIDATING",
  "estimatedProcessingTime": "30s"
}
```

### 11.2 File Status Endpoint

```
GET /api/v1/files/{fileId}/status

Response (200 OK):
{
  "fileId": "uuid",
  "fileName": "POSITIONS_20260608_001.csv",
  "status": "PROCESSED",
  "uploadTime": "2026-06-08T14:30:00Z",
  "processingTime": 1250,
  "recordsProcessed": 10000,
  "recordsFailed": 0,
  "validationErrors": [],
  "processingErrors": []
}
```

### 11.3 File Download Endpoint

```
GET /api/v1/files/{fileId}/download

Response (200 OK):
- Content-Type: (original file MIME type)
- Content-Disposition: attachment; filename="..."
- Body: Original file binary data
```

