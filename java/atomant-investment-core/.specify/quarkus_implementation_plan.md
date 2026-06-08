# Technical Implementation Plan: Investment Fund Constitution

This plan outlines the concrete Quarkus implementations, Hibernate entities, OpenAPI contracts, and persistence migrations required to deploy the **Investment Fund Constitution** context.

---

## 1. Solution Building Blocks (SBBs) Mapping

The physical SBBs are configured to fulfill the logical architecture constraints (Hexagonal packaging, strict domain isolation, and non-blocking performance):

| Logical ABB | Physical SBB (Quarkus) | Architectural Intent |
| :--- | :--- | :--- |
| **HTTP Web Engine** | `quarkus-rest` (RESTEasy Reactive) | Non-blocking HTTP endpoints utilizing Java 21 Virtual Threads (`@RunOnVirtualThread`). |
| **JSON Serialization**| `quarkus-rest-jackson` | Standard, reflection-free JSON serialization via Jackson integration. |
| **ORM Framework** | `quarkus-hibernate-orm-panache` | Repository pattern to isolate the persistence layer from the domain model. |
| **Database Driver** | `quarkus-jdbc-postgresql` | Production database connector. |
| **Validation Engine** | `quarkus-hibernate-validator` | JSR-380 validation on incoming DTOs and entity mappings. |
| **Schema Migration** | `quarkus-flyway` | Sequential database versioning, disabling automated hibernate DDL updates. |
| **Resilience Engine** | `quarkus-smallrye-fault-tolerance` | Circuit breakers, retries, and timeouts for downstream legacy services. |
| **Client Integrations**| `quarkus-rest-client-jackson` | Declarative type-safe HTTP client for the legacy registry. |

---

## 2. Persistence Layer: Hibernate ORM with Panache Repositories

In accordance with the project constitution, we utilize the **Repository Pattern** rather than the Active Record pattern. This ensures domain objects remain independent of JPA annotations.

### 2.1 Database Entities

#### `FundEntity.java`
Maps the Fund aggregate root to the `funds` table:
```java
package org.acme.investment.infrastructure.persistence;

import jakarta.persistence.*;
import org.acme.investment.domain.model.FundType;
import org.acme.investment.domain.model.MasterFundType;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "funds")
public class FundEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(unique = true)
    public String cnpj;

    @Column(nullable = false, length = 300)
    public String name;

    public String requestor;
    
    @Column(name = "originating_department")
    public String originatingDepartment;

    @Column(name = "target_launch_date")
    public LocalDate targetLaunchDate;

    @Column(name = "no_forecast", nullable = false)
    public boolean noForecast;

    @Enumerated(EnumType.STRING)
    @Column(name = "fund_type", nullable = false)
    public FundType fundType;

    @Enumerated(EnumType.STRING)
    @Column(name = "master_fund_type")
    public MasterFundType masterFundType;

    @Column(name = "master_fund_id")
    public Long masterFundId;

    @Column(name = "master_fund_name", length = 300)
    public String masterFundName;

    @Column(name = "mirror_fund")
    public Boolean mirrorFund;

    @OneToMany(mappedBy = "fund", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<FundClassEntity> classes = new ArrayList<>();
}
```

#### `FundClassEntity.java`
Maps individual classes to the `fund_classes` table:
```java
package org.acme.investment.infrastructure.persistence;

import jakarta.persistence.*;
import org.acme.investment.domain.model.EconomicIndex;
import org.acme.investment.domain.model.EsgCategory;
import org.acme.investment.domain.model.TargetAudience;
import java.math.BigDecimal;

@Entity
@Table(name = "fund_classes")
public class FundClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_id", nullable = false)
    public FundEntity fund;

    @Column(nullable = false, length = 150)
    public String name;

    @Column(name = "max_custody_fee", nullable = false, precision = 8, scale = 6)
    public BigDecimal maxCustodyFee;

    @Column(name = "has_minimum_remuneration", nullable = false)
    public boolean hasMinimumRemuneration;

    @Column(name = "min_remuneration_amount", precision = 15, scale = 2)
    public BigDecimal minRemunerationAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "economic_index")
    public EconomicIndex economicIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "esg_category", nullable = false)
    public EsgCategory esgCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false)
    public TargetAudience targetAudience;
}
```

---

## 3. OpenAPI (Swagger) API Contracts

The JAX-RS Resource interfaces define the OpenAPI documentation parameters.

### 3.1 Fund Resource OpenAPI Setup
```java
package org.acme.investment.api;

import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.investment.api.dto.ClassConfigurationRequestDTO;
import org.acme.investment.api.dto.FundGeneralInfoCreateDTO;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;

@Path("/funds")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface FundApiContract {

    @POST
    @Path("/general-info")
    @Operation(summary = "Register Fund General Info", description = "Creates initial metadata for a new investment fund.")
    @APIResponse(responseCode = "201", description = "Fund general info created successfully")
    @APIResponse(responseCode = "400", description = "Invalid launch date or master/feeder rules violation")
    Response createGeneralInfo(@Valid @RequestBody FundGeneralInfoCreateDTO dto);

    @POST
    @Path("/{id}/class-configuration")
    @Operation(summary = "Configure Fund Classes", description = "Binds custody fees, ESG tags, and target audiences.")
    @APIResponse(responseCode = "200", description = "Classes configured successfully")
    @APIResponse(responseCode = "400", description = "Validation errors on custody percentage ranges")
    @APIResponse(responseCode = "444", description = "Fund ID does not exist")
    Response configureClasses(@PathParam("id") Long id, @Valid @RequestBody ClassConfigurationRequestDTO dto);
}
```

---

## 4. REST Client Configuration & Resilience Strategies

To query the legacy system for Master Funds, we implement a reactive REST client protected by a circuit breaker and retry configuration.

### 4.1 Client Interface
```java
package org.acme.investment.infrastructure.client;

import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.faulttolerance.Timeout;
import org.eclipse.microprofile.faulttolerance.Fallback;
import java.time.temporal.ChronoUnit;

@RegisterRestClient(configKey = "legacy-registry-api")
@Path("/api/v1")
public interface LegacyMasterFundClient {

    @GET
    @Path("/master-funds")
    @Produces("application/json")
    @Timeout(value = 2000, unit = ChronoUnit.MILLIS)
    @Retry(maxRetries = 2, delay = 150, delayUnit = ChronoUnit.MILLIS)
    @Fallback(fallbackMethod = "fallbackMasterFundQuery")
    LegacyMasterFundDTO findByCnpjOrCode(
        @QueryParam("cnpj") String cnpj, 
        @QueryParam("code") String code
    );
}
```

### 4.2 Properties (`application.properties`)
```properties
# REST Client Endpoints
quarkus.rest-client.legacy-registry-api.url=https://legacy-core-service.internal/api/v1
quarkus.rest-client.legacy-registry-api.connect-timeout=1000
quarkus.rest-client.legacy-registry-api.read-timeout=2500
```

---

## 5. Flyway Schema Migrations

Automated Hibernate schema generations are disabled. We execute the schemas sequentially.

### `src/main/resources/db/migration/V1.0.0__create_funds_table.sql`
```sql
CREATE TABLE funds (
    id BIGSERIAL PRIMARY KEY,
    cnpj VARCHAR(18) UNIQUE,
    name VARCHAR(300) NOT NULL,
    requestor VARCHAR(100) NOT NULL,
    originating_department VARCHAR(150) NOT NULL,
    target_launch_date DATE,
    no_forecast BOOLEAN NOT NULL DEFAULT FALSE,
    fund_type VARCHAR(50) NOT NULL,
    master_fund_type VARCHAR(50),
    master_fund_id BIGINT,
    master_fund_name VARCHAR(300),
    mirror_fund BOOLEAN
);

CREATE INDEX idx_funds_cnpj ON funds(cnpj);
CREATE INDEX idx_funds_type ON funds(fund_type);
```

### `src/main/resources/db/migration/V1.3.0__create_classes_table.sql`
```sql
CREATE TABLE fund_classes (
    id BIGSERIAL PRIMARY KEY,
    fund_id BIGINT NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    max_custody_fee NUMERIC(8, 6) NOT NULL,
    has_minimum_remuneration BOOLEAN NOT NULL DEFAULT FALSE,
    min_remuneration_amount NUMERIC(15, 2),
    economic_index VARCHAR(20),
    esg_category VARCHAR(30) NOT NULL,
    target_audience VARCHAR(30) NOT NULL
);

CREATE INDEX idx_fund_classes_fund ON fund_classes(fund_id);
```
