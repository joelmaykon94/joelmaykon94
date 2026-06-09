<!-- SPECKIT START -->

# Atomant-Audit Specification Kit

This project contains the **Audit & Aggregation Module** for a financial system managing investment and payment processing.

## Specification Files

For complete context about this module, project structure, and business requirements, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Core architectural principles
   - Database schema design for auditability
   - 20-year retention and immutability rules
   - Municipal tax (ISS) aggregation requirements
   - High-volume database optimization guidelines

2. **[spec.md](./.specify/memory/spec.md)**
   - Technical specifications
   - OpenAPI contract for audit memory and aggregation endpoints
   - Hibernate entity mappings
   - Database partition strategy
   - REST API specifications

3. **[business-rules.md](./.specify/memory/business-rules.md)**
   - Investment transaction lifecycle
   - Payment process workflows
   - Eligibility and validation rules
   - Regulatory compliance rules (AML, sanctions, KYC)
   - Error handling and dispute resolution
   - Integration with `atomant-calculator` and `atomant-payment` modules
   - System monitoring and alerting thresholds

## Technology Stack

- **Language**: Java (Quarkus)
- **Framework**: Quarkus with Panache ORM
- **Database**: PostgreSQL (partitioned, write-optimized)
- **Build**: Maven
- **Testing**: JUnit + Quarkus Test Framework

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build Docker image
docker build -t atomant-audit:latest .
```

## Architecture Overview

The Audit & Aggregation Module serves two primary functions:

### 1. Audit Memory Persistence
- Receives massive batch lists of calculated daily prorated fees
- Persists immutable calculation records for 20-year regulatory compliance
- Uses batch inserts and session management for high-volume throughput
- Enforces append-only pattern with version numbering for corrections

### 2. Municipal Tax Aggregation
- Groups fees by banking branch code (ISS tax requirement)
- Generates daily aggregation reports for each agency
- Supports queries for tax base computation
- Maintains branch-level fee totals for audit trails

## Integration Points

- **Upstream**: Receives calculation results from `atomant-calculator`
- **Downstream**: Provides audit records and aggregated fees to `atomant-payment` and `atomant-integration`
- **Regulatory**: Exposes audit logs and aggregations to compliance and tax systems

## Package Structure

```
org.acme.audit
├── api                    # REST endpoints for audit and aggregation
├── domain                 # Core domain models (AuditRecord, BranchAggregation)
├── infrastructure.persistence  # JPA entities, repositories, custom queries
└── application            # Service layer (batching, transactional logic)
```

## Database Schema Strategy

- **Partitioning**: Monthly range partitions by `calculation_date`
- **Indices**: Minimal set: `(calculation_date, branch_code)` and `(calculation_date, cnpj)`
- **Batch Size**: Configured at 50+ for bulk inserts
- **Session Management**: Clear EntityManager every 1000 records

<!-- SPECKIT END -->
