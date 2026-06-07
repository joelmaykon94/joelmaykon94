# Project Constitution & Engineering Principles: `atomant-integration` (Integration Module)

This constitution establishes the core, non-negotiable architectural layers and guidelines for the **Integration Module** microservice, which handles outbound data export processes and inbound callback reconciliation.

---

## 1. Microservice Responsibilities & Context

The **Integration Module** acts as the outbound connector:
1. **Accounting File Generation**: Formats and exports aggregated fee data into standard CSV/TXT accounting templates.
2. **Java NIO File Operations**: Writes accounting data using NIO buffers and streaming channels to prevent OOM errors during large reports generation.
3. **Reconciliation Webhook Reception**: Exposes endpoints to receive asynchronous confirmations (callbacks) from external ledger/accounting partners.

---

## 2. File Generation & Java NIO Rules

To guarantee reliability and prevent blocking system threads during high-volume report generation:
1. **NIO Path & Files API**: Use `java.nio.file.Files` and `java.nio.file.Path` for file manipulation. Utilize `Files.newBufferedWriter` or `FileChannel` to write records line by line.
2. **Streamed Content Writing**: Do not accumulate massive text strings in memory before writing. Output lines iteratively as they are processed.
3. **Encoding & Format**: Files must be generated using `UTF-8` encoding. Formats must enforce comma-separated values (CSV) or fixed-width text formats (TXT) aligned with double-quotes for string values.

---

## 3. Webhook & Callback Security Guidelines

Exposing public POST endpoints for reconciliation callbacks requires strict rules:
1. **Stateless Webhooks**: Callback endpoints must be stateless.
2. **Input Validation**: Strictly validate payload formats (confirming batch correlation IDs, validation status enumerations, and digital signature hashes if applicable).
3. **Asynchronous Processing**: Webhook routes should execute light mapping and record updates on Virtual Threads (`@RunOnVirtualThread`) or queue the message for background processing, returning an immediate `200 OK` or `202 Accepted` to the caller.

---

## 4. Structural Layers & Packages

* **`org.acme.integration.api`**: Houses controller classes for CSV export and webhook reception.
* **`org.acme.integration.domain`**: Houses domain representations of reconciliation results.
* **`org.acme.integration.domain.service`**: Houses Java NIO writing business logic.
