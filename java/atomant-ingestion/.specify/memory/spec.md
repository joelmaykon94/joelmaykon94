# Technical Specification: `atomant-ingestion` (Ingestion Module)

This document specifies the detailed technical design, API contract (OpenAPI), and implementation examples for the Ingestion Module microservice.

---

## 1. OpenAPI 3.0 Contract (Swagger)

The following YAML contract defines the endpoints exposed by the ingestion module to trigger imports and fetch external calendar states.

```yaml
openapi: 3.0.3
info:
  title: Ingestion Module API
  version: 1.0.0
  description: Technical specification for fetching, sanitizing, and normalizing public financial Open Data (CVM, BACEN).
paths:
  /api/v1/ingest/cvm/funds:
    post:
      summary: Trigger CVM Fund Data Ingestion
      description: Fetches daily Net Asset Value (NAV/PL) and quota holder position counts from CVM Open Data.
      responses:
        '202':
          description: Ingestion job successfully accepted and scheduled.
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                    format: uuid
                    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  status:
                    type: string
                    example: "QUEUED"
        '503':
          description: External CVM API is unavailable (Circuit Breaker open).

  /api/v1/ingest/bacen/holidays:
    post:
      summary: Sync BACEN Holiday Calendar
      description: Fetches bank calendar days from BACEN/SGS to configure working days for 252-day math.
      responses:
        '200':
          description: Holidays successfully synchronized.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    date:
                      type: string
                      format: date
                      example: "2026-12-25"
                    description:
                      type: string
                      example: "Natal"
        '503':
          description: External BACEN service is down.
```

---

## 2. MicroProfile REST Client Interfaces

These interfaces consume external public endpoints. They implement SmallRye Fault Tolerance policies (Retry & Circuit Breaker).

### 2.1 CVM API Client & JSON Mapping Record
Maps the raw daily fund reports fetched from CVM's CSV/JSON outputs.

```java
package org.acme.ingestion.infrastructure.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.math.BigDecimal;
import java.util.List;

@RegisterRestClient(configKey = "cvm-api")
@Path("/api/v1")
public interface CvmClient {

    @GET
    @Path("/fund-daily-report")
    @Produces(MediaType.APPLICATION_JSON)
    @Retry(maxRetries = 3, delay = 1000, jitter = 200)
    @CircuitBreaker(requestVolumeThreshold = 10, failureRatio = 0.5, delay = 10000)
    List<CvmFundRawDTO> getDailyReports(@QueryParam("date") String date);

    // JSON Mapping Java Record
    record CvmFundRawDTO(
        String CNPJ_FUNDO,
        String DT_COMPTC,
        BigDecimal VL_TOTAL,
        BigDecimal VL_QUOTA,
        BigDecimal VL_PATRIM_LIQ,
        BigDecimal CAPTC_DIA,
        BigDecimal RESG_DIA,
        Long NR_COTST
    ) {}
}
```

### 2.2 BACEN SGS API Client & JSON Mapping Record
Maps the bank holidays and calendar parameters from BACEN SGS series.

```java
package org.acme.ingestion.infrastructure.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "bacen-api")
@Path("/v1/dados/serie")
public interface BacenClient {

    @GET
    @Path("/bcdata.sgs.{seriesCode}/dados")
    @Produces(MediaType.APPLICATION_JSON)
    @Retry(maxRetries = 3, delay = 1000, jitter = 200)
    @CircuitBreaker(requestVolumeThreshold = 10, failureRatio = 0.5, delay = 10000)
    List<BacenHolidayRawDTO> getHolidays(@PathParam("seriesCode") String seriesCode);

    // JSON Mapping Java Record
    record BacenHolidayRawDTO(
        String data,
        String valor
    ) {}
}
```

---

## 3. Quarkus REST Controller (API Layer)

Controller class exposing HTTP routes, using Java 21 Virtual Threads (`@RunOnVirtualThread`) to handle the blocking REST client calls asynchronously.

```java
package org.acme.ingestion.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.ingestion.domain.service.IngestionOrchestrator;
import java.util.Map;
import java.util.UUID;

@Path("/api/v1/ingest")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class IngestionController {

    @Inject
    IngestionOrchestrator orchestrator;

    @POST
    @Path("/cvm/funds")
    @RunOnVirtualThread
    public Response ingestCvmFunds() {
        // Triggers ingestion process asynchronously and returns 202 Accepted immediately
        UUID jobId = UUID.randomUUID();
        orchestrator.triggerCvmIngestionAsync(jobId);
        
        return Response.status(Response.Status.ACCEPTED)
                .entity(Map.of("jobId", jobId, "status", "QUEUED"))
                .build();
    }

    @POST
    @Path("/bacen/holidays")
    @RunOnVirtualThread
    public Response syncBacenHolidays() {
        // Synchronously pulls BACEN calendar days and returns the normalized list
        var normalizedHolidays = orchestrator.syncCalendarHolidays();
        
        return Response.ok(normalizedHolidays).build();
    }
}
```
