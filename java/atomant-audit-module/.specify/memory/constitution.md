# Project Constitution & Engineering Principles: `atomant-audit-module` (Audit & Aggregation Module)

This constitution establishes the core, non-negotiable architectural principles, database schema design, and tax aggregation requirements for the **Audit and Aggregation Module**. All code modifications, database schemas, and queries must comply with these guidelines.

---

## 1. Long-Term Auditability & Retention Policy

The calculation memory serves as the physical proof of administrative fee calculations for regulatory auditing.
1. **20-Year Retention**: All fee calculation records must be stored physically in a PostgreSQL database for a minimum of 20 years.
2. **Immutable Append-Only Audit Trail**: No `UPDATE` or `DELETE` operations are allowed on the core calculation memory tables. Any recalculation or adjustment must be appended as a new record with a higher version number and a correction flag, referencing the original ID.
3. **Audit Log Payload**: The persisted record must store the complete calculation inputs (NAV, annual rate, total quotas, held quotas) alongside the computed outputs (daily fee, representation, pro-rata fee) to ensure calculations can be mathematically reconstructed.

---

## 2. Municipal Tax (ISS) Aggregation Rules

To comply with municipal tax requirements (Imposto Sobre Serviços - ISS) for financial institutions:
1. **Branch Code Mapping**: Every quota holder position must map to a specific banking branch/agency code (`branch_code`).
2. **Daily Aggregation**: The system must run a daily aggregation job grouping calculated quota holder fees by `branch_code` and `calculation_date`.
   $$\text{Aggregated Branch Fee} = \sum_{\text{branch}} \text{Quota Holder Prorated Fee}$$
3. **Taxable Base**: This aggregated fee represents the service value rendered by that specific physical branch/agency, serving as the basis for municipal ISS tax generation.

---

## 3. High-Volume Database Schema Guidelines

Since calculations are executed daily across thousands of funds and millions of quota holder positions, the PostgreSQL database must be optimized for write-heavy high-volume ingestion.

### 3.1 Table Partitioning
* **Rule**: The core audit table (`calculation_memory`) must be partitioned by range based on the `calculation_date`.
* **Standard Partition**: Use **monthly partitions** (e.g., `calculation_memory_y2026m06`).
* **Benefit**: Allows fast dropping of data past the 20-year window, improves write localization, and prevents index sizes from outgrowing RAM.

### 3.2 Indexing Strategy
* Keep indices to an absolute minimum on the partition tables to maximize insert throughput.
* Maintain composite index only on `(calculation_date, branch_code)` for municipal tax queries and `(calculation_date, cnpj)` for fund-level lookups.

### 3.3 Batching & Session Management
* All ingestion runs must use Quarkus / Hibernate bulk inserts.
* Configure `quarkus.hibernate-orm.jdbc.statement-batch-size=50` or higher.
* Always flush and clear the Hibernate Session/EntityManager periodically (e.g., every 1000 records) to release memory.

---

## 4. Structural Layers & Package Conventions

* **`org.acme.audit.api`**: Exposes endpoints to query audit memory or fetch municipal aggregated reports.
* **`org.acme.audit.domain`**: Houses core domain records (`AuditRecord`, `BranchAggregation`).
* **`org.acme.audit.infrastructure.persistence`**: Implements JPA entities (`CalculationMemoryEntity`) and repositories inheriting from `PanacheRepository`.
