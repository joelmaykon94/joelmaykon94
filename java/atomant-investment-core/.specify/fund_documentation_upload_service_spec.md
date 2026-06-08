# Feature Specification: Fund Documentation Upload Service

**Feature Branch**: `fund-documentation-upload-service`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Create the 'Fund Documentation Upload Service' specification. Define a REST API that accepts multipart/form-data file uploads (supporting drag-and-drop clients). Enforce strict business rules: maximum of 5 documents per fund, maximum file size of 10MB per document, and strict MIME-type validation allowing ONLY PDF and Word (.doc/.docx) files. Reject invalid attempts with specific error messages. Map the persistence layer to store metadata in PostgreSQL and files in an S3-compatible object storage. Stack: Quarkus RESTEasy Multipart."

---

## 1. User Scenarios & Testing

### User Story 1 - Upload Single Document (Priority: P1)
As a Fund Administrator, I want to upload a compliance PDF or Word document for a fund so that it is associated with the fund's master record.

* **Why this priority**: Core functionality needed to document and legalize the fund constitution process.
* **Independent Test**: Send a `POST` request with `multipart/form-data` containing a `file` field with a 1MB PDF file to `/funds/{fundId}/documents`. Verify HTTP `201 Created` is returned, metadata is saved in PostgreSQL, and the binary is stored in S3.
* **Acceptance Scenarios**:
  1. **Given** an existing fund demand, **When** a user uploads a valid PDF (`fileSize < 10MB`), **Then** the system returns `201 Created` along with the document's metadata (UUID, filename, upload timestamp).
  2. **Given** a successful file transfer to the S3 bucket, **When** the transaction commits, **Then** a query to `GET /funds/{fundId}/documents` lists the new file.

---

### User Story 2 - Enforce Upload Limits (Priority: P1)
As a Compliance Officer, I want the system to limit uploads to 5 documents per fund to prevent system abuse and bloated repositories.

* **Why this priority**: Prevents storage resource exhaustion.
* **Independent Test**: Upload 5 distinct files sequentially to `/funds/{fundId}/documents`. Attempt to upload a 6th file. Verify that the 6th upload returns `400 Bad Request` with message "Maximum of 5 documents allowed per fund."
* **Acceptance Scenarios**:
  1. **Given** a fund that already has 5 documents registered, **When** a client tries to upload another file, **Then** the upload is blocked and database remains unchanged.

---

### User Story 3 - Enforce Size Constraints (Priority: P2)
As a DevOps Engineer, I want the service to reject uploads exceeding 10MB to maintain network performance.

* **Why this priority**: Avoids thread blockages and memory pressure on virtual threads by rejecting large payloads early.
* **Independent Test**: Attempt to upload a 11MB Word document. Verify that the request is rejected with `413 Payload Too Large` and error message "File size exceeds maximum limit of 10MB."
* **Acceptance Scenarios**:
  1. **Given** a file upload stream, **When** the content-length or bytes read exceeds 10,485,760 bytes, **Then** the connection is interrupted and the server returns `413`.

---

### User Story 4 - Strict MIME-Type Checking (Priority: P1)
As a Security Architect, I want the system to inspect the uploaded file's headers and magic numbers so that executable or malicious files cannot be uploaded under false extensions.

* **Why this priority**: Critical security defense against malware distribution and remote code execution vulnerabilities.
* **Independent Test**: Rename an `.exe` file to `.pdf` and attempt upload. Verify the request is rejected with `415 Unsupported Media Type` and message "Only PDF and Word (.doc, .docx) formats are supported."
* **Acceptance Scenarios**:
  1. **Given** an upload request, **When** the MIME-type (via binary signature/magic numbers) is not `application/pdf`, `application/msword`, or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, **Then** the request is rejected immediately with a `415` status code.

---

## 2. Edge Cases

- **Transaction Rollback Integration**: What happens if database metadata storage fails after the file is already written to S3?
  * *Resolution*: The S3 client must execute a delete operation for the file key if the subsequent database commit fails (S3 operates outside of database JTA transaction context).
- **Path Traversal Attacks**: A client sends a filename like `../../etc/passwd`.
  * *Resolution*: The backend must strip all directory traversal sequences and randomize the S3 file key (e.g. `document-uuid.pdf`) while keeping the sanitized original name in the metadata record.
- **Empty File Uploads**: Uploading a zero-byte file.
  * *Resolution*: Reject with `400 Bad Request` and error message "Empty file uploads are not allowed."

---

## 3. Requirements

### Functional Requirements
- **FR-001 (REST Endpoint)**: The service MUST expose `POST /funds/{fundId}/documents` accepting `multipart/form-data`.
- **FR-002 (Size Validation)**: The service MUST block uploads exceeding 10MB (10,485,760 bytes).
- **FR-003 (MIME Check)**: The service MUST validate magic numbers of the file stream to restrict extensions strictly to:
  * `.pdf` (`application/pdf`)
  * `.doc` (`application/msword`)
  * `.docx` (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- **FR-004 (Quota Enforcement)**: The service MUST query PostgreSQL to ensure total documents count per `fundId` does not exceed 5 before accepting the upload stream.
- **FR-005 (Hybrid Storage)**: The service MUST store the binary payload in S3-compatible object storage and write the mapping metadata (document UUID, file size, content-type, original filename) to PostgreSQL.

### Key Entities

- **FundDocument**:
  * `id`: UUID (Primary Key).
  * `fundId`: Long (Foreign Key to Funds table).
  * `fileName`: String (Sanitized original name, max 255 chars).
  * `fileKey`: String (Unique S3 Object Key).
  * `mimeType`: String (Checked MIME value).
  * `fileSizeInBytes`: Long.
  * `uploadedAt`: OffsetDateTime.

---

## 4. Success Criteria

### Measurable Outcomes
- **SC-001**: Malicious files with altered extensions are detected and blocked with 100% accuracy.
- **SC-002**: Database integrity is preserved; S3 orphan files are garbage-collected or deleted on database transactional rollback.
- **SC-003**: The maximum API response time for rejection cases remains under 50ms (since rejections happen before full stream download).
