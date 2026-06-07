# Technical Specification: `atomant-audit` (Audit & Aggregation Module)

This document specifies the database schemas, Hibernate entities, custom repository queries, and REST endpoints for the Audit and Aggregation Module.

---

## 1. OpenAPI API Contract

Exposes endpoints for auditing batch transactions and fetching municipal tax (ISS) aggregations.

```yaml
openapi: 3.0.3
info:
  title: Audit and Aggregation Module API
  version: 1.0.0
  description: Technical specification for persisting calculation memories and aggregating municipal tax bases.
paths:
  /api/v1/audit/memory:
    post:
      summary: Persist massive calculation memory audit log
      description: Receives a massive batch list of calculated daily prorated fees per holder and persists them using transactional batching.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/CalculationMemoryAudit'
      responses:
        '201':
          description: Batch audit log persisted successfully.
        '400':
          description: Invalid payload list.

  /api/v1/audit/aggregation/agency/{date}:
    get:
      summary: Fetch daily fee aggregations by banking branch/agency code
      description: Groups daily prorated fees by agency (branch code) for a specific date to compute municipal tax (ISS) bases.
      parameters:
        - name: date
          in: path
          required: true
          schema:
            type: string
            format: date
            example: "2026-06-06"
      responses:
        '200':
          description: Tax aggregation list fetched.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/BranchAggregation'
        '400':
          description: Invalid date format.

components:
  schemas:
    CalculationMemoryAudit:
      type: object
      properties:
        cnpj:
          type: string
        calculationDate:
          type: string
          format: date
        quotaHolderId:
          type: string
        branchCode:
          type: string
        netAssetValue:
          type: number
        annualFeeRate:
          type: number
        holderQuotas:
          type: number
        totalFundQuotas:
          type: number
        dailyFundFee:
          type: number
        representationRatio:
          type: number
        proratedFee:
          type: number
    BranchAggregation:
      type: object
      properties:
        branchCode:
          type: string
        calculationDate:
          type: string
          format: date
        totalAggregatedFee:
          type: number
```

---

## 2. Hibernate Panache Entity (`CalculationMemoryEntity.java`)

JPA database mapping designed to store immutable calculation logs.

```java
package org.acme.audit.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "calculation_memory", indexes = {
    @Index(name = "idx_calc_date_branch", columnList = "calculation_date, branch_code"),
    @Index(name = "idx_calc_date_cnpj", columnList = "calculation_date, cnpj")
})
public class CalculationMemoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 14)
    public String cnpj;

    @Column(name = "calculation_date", nullable = false)
    public LocalDate calculationDate;

    @Column(name = "quota_holder_id", nullable = false, length = 50)
    public String quotaHolderId;

    @Column(name = "branch_code", nullable = false, length = 10)
    public String branchCode;

    @Column(name = "net_asset_value", nullable = false, precision = 18, scale = 4)
    public BigDecimal netAssetValue;

    @Column(name = "annual_fee_rate", nullable = false, precision = 6, scale = 4)
    public BigDecimal annualFeeRate;

    @Column(name = "holder_quotas", nullable = false, precision = 20, scale = 8)
    public BigDecimal holderQuotas;

    @Column(name = "total_fund_quotas", nullable = false, precision = 20, scale = 8)
    public BigDecimal totalFundQuotas;

    @Column(name = "daily_fund_fee", nullable = false, precision = 18, scale = 4)
    public BigDecimal dailyFundFee;

    @Column(name = "representation_ratio", nullable = false, precision = 10, scale = 8)
    public BigDecimal representationRatio;

    @Column(name = "prorated_fee", nullable = false, precision = 18, scale = 4)
    public BigDecimal proratedFee;
}
```

---

## 3. Panache Repository & Projection Query (`PanacheCalculationMemoryRepository.java`)

Implements the repository pattern using JPQL constructor expression projections to aggregate fee values by branch code.

```java
package org.acme.audit.infrastructure.persistence;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.audit.domain.model.BranchAggregation;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class PanacheCalculationMemoryRepository implements PanacheRepositoryBase<CalculationMemoryEntity, Long> {

    /**
     * Executes aggregated query grouping prorated fees by banking branch agency code.
     */
    public List<BranchAggregation> aggregateFeesByBranch(LocalDate date) {
        return getEntityManager().createQuery(
                "SELECT new org.acme.audit.domain.model.BranchAggregation(" +
                "  e.branchCode, " +
                "  e.calculationDate, " +
                "  SUM(e.proratedFee)" +
                ") " +
                "FROM CalculationMemoryEntity e " +
                "WHERE e.calculationDate = :date " +
                "GROUP BY e.branchCode, e.calculationDate", BranchAggregation.class)
                .setParameter("date", date)
                .getResultList();
    }
}
```

---

## 4. Quarkus API Endpoints (`AuditController.java`)

REST Resource executing audit persists and tax groupings using Java 21 Virtual Threads.

```java
package org.acme.audit.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.audit.domain.model.AuditRecord;
import org.acme.audit.domain.service.AuditPersisterService;
import java.time.LocalDate;
import java.util.List;

@Path("/api/v1/audit")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuditController {

    @Inject
    AuditPersisterService persisterService;

    @POST
    @Path("/memory")
    @RunOnVirtualThread
    public Response saveCalculationMemoryBatch(List<AuditRecord> batchList) {
        if (batchList == null || batchList.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Payload cannot be empty").build();
        }
        
        // Triggers transactional batch insertion with periodic JDBC flushes
        persisterService.persistBatch(batchList);
        
        return Response.status(Response.Status.CREATED).build();
    }

    @GET
    @Path("/aggregation/agency/{date}")
    @RunOnVirtualThread
    public Response getAggregationByBranch(@PathParam("date") String dateString) {
        try {
            LocalDate date = LocalDate.parse(dateString);
            var result = persisterService.aggregateFees(date);
            return Response.ok(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid date parameter format.").build();
        }
    }
}
```
