# Technical Specification: `atomant-calculator` (Calculator Module)

This document specifies the detailed technical design, mathematical formulas, and REST endpoints for the Calculator Module.

---

## 1. OpenAPI API Contract

Exposes endpoints for daily fee calculation and pro-rata quota holder apportionment.

```yaml
openapi: 3.0.3
info:
  title: Calculator Module API
  version: 1.0.0
  description: Technical specification for daily fee calculation and apportionment.
paths:
  /api/v1/calculate/daily-fee:
    post:
      summary: Calculate Daily Fund Fees
      description: Receives a batch list of funds and computes their daily diarized fee based on a 252-day business year.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/DailyFeeRequest'
      responses:
        '200':
          description: Batch calculations completed successfully.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DailyFeeResponse'

  /api/v1/calculate/apportionment:
    post:
      summary: Apportion daily fee to quota holders
      description: Calculates the pro-rata representation and fee allocation for a list of quota holders based on their holdings.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApportionmentRequest'
      responses:
        '200':
          description: Apportionment completed.
          content:
            application/json:
              schema:
                type: object
                properties:
                  dailyFundFee:
                    type: number
                  splits:
                    type: array
                    items:
                      $ref: '#/components/schemas/HolderSplitResponse'

components:
  schemas:
    DailyFeeRequest:
      type: object
      properties:
        cnpj:
          type: string
        netAssetValue:
          type: number
        annualFeeRate:
          type: number
    DailyFeeResponse:
      type: object
      properties:
        cnpj:
          type: string
        dailyFundFee:
          type: number
    ApportionmentRequest:
      type: object
      properties:
        dailyFundFee:
          type: number
        totalFundQuotas:
          type: number
        holders:
          type: array
          items:
            type: object
            properties:
              quotaHolderId:
                type: string
              holderQuotas:
                type: number
    HolderSplitResponse:
      type: object
      properties:
        quotaHolderId:
          type: string
        representationRatio:
          type: number
        proratedFee:
          type: number
```

---

## 2. Java Records (JSON Mappings & Domain Objects)

These Java 21 Records map raw inputs and outputs. They contain no framework annotations, enforcing pure domain isolation.

```java
package org.acme.calculator.domain.model;

import java.math.BigDecimal;
import java.util.List;

// --- Daily Fee records ---
public record DailyFeeRequest(String cnpj, BigDecimal netAssetValue, BigDecimal annualFeeRate) {}
public record DailyFeeResponse(String cnpj, BigDecimal dailyFundFee) {}

// --- Apportionment records ---
public record HolderPosition(String quotaHolderId, BigDecimal holderQuotas) {}
public record ApportionmentRequest(BigDecimal dailyFundFee, BigDecimal totalFundQuotas, List<HolderPosition> holders) {}

public record HolderSplitResponse(String quotaHolderId, BigDecimal representationRatio, BigDecimal proratedFee) {}
public record ApportionmentResponse(BigDecimal dailyFundFee, List<HolderSplitResponse> splits) {}
```

---

## 3. Isolated Domain Service (`FeeCalculatorService.java`)

This service implements the calculations using strict `BigDecimal` operations and `RoundingMode.HALF_EVEN` (Banker's rounding).

```java
package org.acme.calculator.domain.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.calculator.domain.model.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class FeeCalculatorService {

    private static final BigDecimal WORKING_DAYS_YEAR = BigDecimal.valueOf(252);

    /**
     * Rule 1: Daily Fee Diarization
     * Daily Fee = (NAV * Annual Rate) / 252 business days
     */
    public List<DailyFeeResponse> calculateDailyFees(List<DailyFeeRequest> requests) {
        return requests.stream()
                .map(req -> {
                    BigDecimal dailyFee = req.netAssetValue()
                            .multiply(req.annualFeeRate())
                            .divide(WORKING_DAYS_YEAR, 4, RoundingMode.HALF_EVEN);
                    return new DailyFeeResponse(req.cnpj(), dailyFee);
                })
                .collect(Collectors.toList());
    }

    /**
     * Rule 2 & 3: Quota Holder Representation & Pro-rata Fee Apportionment
     * Representation = Holder Position / Total Quotas
     * Apportionment = Representation * Daily Fund Fee
     */
    public ApportionmentResponse calculateApportionment(ApportionmentRequest request) {
        BigDecimal dailyFee = request.dailyFundFee();
        BigDecimal totalQuotas = request.totalFundQuotas();

        List<HolderSplitResponse> splits = request.holders().stream()
                .map(holder -> {
                    // Representation Ratio (calculated with 8 decimal places)
                    BigDecimal ratio = holder.holderQuotas()
                            .divide(totalQuotas, 8, RoundingMode.HALF_EVEN);

                    // Apportionment (calculated with 4 decimal places)
                    BigDecimal proratedFee = ratio
                            .multiply(dailyFee)
                            .setScale(4, RoundingMode.HALF_EVEN);

                    return new HolderSplitResponse(holder.quotaHolderId(), ratio, proratedFee);
                })
                .collect(Collectors.toList());

        return new ApportionmentResponse(dailyFee, splits);
    }
}
```

---

## 4. Quarkus JAX-RS Resource Controller (`CalculatorResource.java`)

Runs on Java 21 Virtual Threads (`@RunOnVirtualThread`) to handle JSON requests, invoking the pure domain service logic.

```java
package org.acme.calculator.api;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.calculator.domain.model.ApportionmentRequest;
import org.acme.calculator.domain.model.DailyFeeRequest;
import org.acme.calculator.domain.service.FeeCalculatorService;
import java.util.List;

@Path("/api/v1/calculate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalculatorController {

    private final FeeCalculatorService calculatorService;

    public CalculatorController(FeeCalculatorService calculatorService) {
        this.calculatorService = calculatorService;
    }

    @POST
    @Path("/daily-fee")
    @RunOnVirtualThread
    public Response computeDailyFees(List<DailyFeeRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Batch request cannot be empty").build();
        }
        var response = calculatorService.calculateDailyFees(requests);
        return Response.ok(response).build();
    }

    @POST
    @Path("/apportionment")
    @RunOnVirtualThread
    public Response computeApportionment(ApportionmentRequest request) {
        if (request == null || request.totalFundQuotas() == null || request.holders() == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid apportionment inputs").build();
        }
        var response = calculatorService.calculateApportionment(request);
        return Response.ok(response).build();
    }
}
```
