<!-- SPECKIT START -->

# Atomant-Calculator Specification Kit

This project contains the **Calculator Module** serving as the central calculation engine for financial computations in the investment and payment processing system.

## Specification Files

For complete context about this module, project structure, mathematical principles, and business rules, refer to these specification documents in the `.specify/memory/` directory:

1. **[constitution.md](./.specify/memory/constitution.md)**
   - Core mathematical and rounding standards (Java BigDecimal with RoundingMode.HALF_EVEN)
   - Strict prohibition on Float/Double types for financial calculations
   - Precision standards by calculation type:
     - Daily Fund Fee: 4 decimal places
     - Quota Holder Representation Ratio: 8 decimal places
     - Pro-rata Fee Apportionment: 4 decimal places
   - Three core business formulas: Daily Fee Diarization, Quota Holder Representation, Pro-rata Fee Apportionment
   - Structural layer conventions and package organization

2. **[spec.md](./.specify/memory/spec.md)**
   - Technical specifications for daily fee and apportionment endpoints
   - OpenAPI 3.0.3 contract with detailed request/response schemas
   - Java 21 Records for DTOs (immutable, framework-annotation-free)
   - FeeCalculatorService implementation with BigDecimal operations
   - Example request/response payloads

3. **[business-rules.md](./.specify/memory/business-rules.md)**
   - Investment calculations: NAV computation, quota purchase, settlement pricing
   - Payment calculations: Admin fees, apportionment, redemptions, distributions
   - Financial index calculations: CDI, IPCA, Selic-linked fee adjustments
   - Precision and rounding rules for all calculation types
   - Special scenarios: Fund inception/closure, stock splits, mergers, corporate actions
   - Reconciliation and validation rules with variance tolerances
   - Error handling and fallback strategies for missing data
   - Regulatory compliance with CVM, tax authorities, and audit requirements
   - Performance targets and caching strategies
   - Integration points with audit, payment, and investment modules
   - Comprehensive testing and validation requirements

4. **[universal_interest_calculation_engine_spec.md](./.specify/universal_interest_calculation_engine_spec.md)**
   - Feature specification for interest rate calculation engine
   - Support for compound interest with configurable periods
   - Index-linked interest (CDI, IPCA) calculations
   - Banker's rounding requirements for financial precision
   - API contract for `/calculate/interest` endpoint
   - Edge case handling and success criteria

## Technology Stack

- **Language**: Java 25
- **Framework**: Quarkus with CDI
- **Build**: Maven
- **Testing**: JUnit 5, Quarkus Test Framework
- **Database**: PostgreSQL (for persistence of calculation audit trails)
- **Caching**: Redis (for index and NAV caches)
- **Math**: Java BigDecimal (exclusively; no Float/Double)

## Key Commands

```bash
# Build the module
./mvnw clean package

# Run tests
./mvnw test

# Start development server
./mvnw quarkus:dev

# Build Docker image
docker build -t atomant-calculator:latest .

# Push to Docker Hub
docker tag atomant-calculator:latest joelmaykon/atomant-calculator:latest
docker push joelmaykon/atomant-calculator:latest
```

## Architecture Overview

The Calculator Module serves four primary functions:

### 1. Daily Fee Calculation
- Diarizes annual management fees to daily amounts based on 252-business-day calendar
- Handles index-linked fees (CDI + spread, IPCA + spread, Selic-based)
- Caches index values for consistent daily calculation
- Supports fund inception/closure pro-ration

### 2. Quota Holder Apportionment
- Calculates representation ratio for each quota holder (ownership %)
- Apportions daily fund fee pro-rata to each holder
- Handles mid-month investments and redemptions with day-count adjustments
- Validates reconciliation (sum of pro-rata fees ≈ daily fund fee)

### 3. Investment Valuation
- NAV (Net Asset Value) computation and daily publication
- Quota purchase calculations based on investment amount and NAV
- Settlement price determination and locking
- Investment constraint validation (min/max, daily/monthly limits)
- NAV amendment procedures with retroactive recalculation

### 4. Payment & Redemption Processing
- Redemption proceeds calculation (gross amount minus fees and taxes)
- Tax withholding calculations (capital gains, income tax)
- Interest accrual on holdback periods (CDI + 2%)
- Dividend/distribution calculations and tax treatment
- High-frequency redemption penalty application

## Key Formulas

**Daily Fund Fee (Diarization)**:
$$\text{Daily Fee} = \frac{\text{Fund NAV} \times \text{Annual Fee Rate}}{252}$$

**Quota Holder Representation**:
$$\text{Representation} = \frac{\text{Holder Quotas}}{\text{Total Quotas}}$$

**Pro-rata Fee Apportionment**:
$$\text{Pro-rata Fee} = \text{Daily Fee} \times \text{Representation}$$

**Investment Quota Calculation**:
$$\text{Quotas Acquired} = \frac{\text{Investment Amount}}{NAV_{\text{Settlement}}}$$

**Redemption Net Proceeds**:
$$\text{Net Proceeds} = (\text{Redemption Quotas} \times NAV) - \text{Fees} - \text{Taxes}$$

## Precision Standards

| Calculation | Scale | Rounding | Usage |
|---|---|---|---|
| NAV | 8 | HALF_EVEN | Fund unit pricing |
| Daily Fee | 4 | HALF_EVEN | Fee distribution |
| Representation Ratio | 8 | HALF_EVEN | Ownership calculation |
| Pro-rata Fee | 4 | HALF_EVEN | Individual fee allocation |
| Final Currency | 2 | HALF_EVEN | User-facing payments |
| Annual Rates | 6 | HALF_EVEN | Fee rate storage |
| Daily Rates | 8 | HALF_EVEN | Daily accrual |

**Critical Rule**: Never use Float or Double for financial calculations. BigDecimal with RoundingMode.HALF_EVEN is mandatory.

## Integration Points

- **Upstream**: Receives fund NAV and position data from custodian systems
- **Downstream**: Provides calculated fees to `atomant-payment` and `atomant-audit`
- **Index Data**: Integrates with B3 (CDI), IBGE (IPCA), Central Bank (Selic) APIs
- **Audit Module**: All calculations logged immutably for 20-year regulatory compliance
- **Investment Module**: Provides NAV and quota calculations for investment processing

## Package Structure

```
org.acme.calculator
├── api                          # REST resources (@Path) exposing calculation endpoints
├── domain
│   ├── model                    # Java Records for DTOs (CalculationRequest, etc.)
│   └── service                  # FeeCalculatorService, InterestService (domain logic)
├── infrastructure.persistence   # Repositories, JPA entities for audit trail storage
├── infrastructure.external      # API clients for B3, IBGE, Central Bank index retrieval
└── exception                    # Custom exceptions, validation errors
```

## Calculation Workflow

1. **Input Validation**: Verify principal, NAV, rate, period values within acceptable ranges
2. **Index Resolution**: Fetch current CDI/IPCA/Selic values; apply fallback if missing
3. **Calculation Execution**: Execute BigDecimal operations with HALF_EVEN rounding at each step
4. **Result Validation**: Check variance, reconciliation, precision requirements
5. **Audit Logging**: Persist calculation with inputs, outputs, timestamp, actor ID
6. **Cache Update**: Update NAV/index caches for subsequent calculations

## Performance Targets

- **Daily Fee Calculation**: < 5ms per fund
- **Apportionment**: < 1ms per quota holder
- **Batch Processing**: 100,000 calculations/minute
- **Memory**: < 500MB for in-memory calculation engine
- **Index Cache Hit Rate**: > 95% (24-hour TTL)
- **NAV Cache Hit Rate**: > 99% (30-day TTL after publication)

## Data Consistency Rules

- **NAV Change Limit**: Flag for review if daily NAV change > 5%
- **Fee Reconciliation**: Sum of pro-rata fees must equal daily fund fee (variance < R$ 0.01)
- **Quota Consistency**: Total quotas must exactly equal sum of all holdings
- **Representation Validation**: Sum of all representation ratios = 1.0 (variance < 0.000001)
- **Concentration Risk**: Flag any individual holder with representation > 50%

## Testing Coverage Requirements

- **Unit Tests**: 100% coverage of all calculation paths and edge cases
- **Integration Tests**: End-to-end calculation workflows
- **Reconciliation Tests**: Fee aggregation, variance analysis
- **Performance Tests**: Load testing at 1000 concurrent requests
- **Regulatory Tests**: Fee calculations match disclosed rates (tolerance ±0.0001%)

## Security & Compliance

- **Immutable Audit Trail**: All calculations persisted to atomant-audit module
- **Regulatory Compliance**: CVM fee disclosure verification, tax reporting accuracy
- **Data Integrity**: SHA-256 hashing of input parameters for tamper detection
- **Access Control**: Calculation modifications require compliance officer approval
- **Retention Policy**: 20-year retention for all calculation records

## Error Handling

- **Input Validation Errors**: Return 400 Bad Request with detailed constraint violations
- **Index Unavailable**: Fall back to previous day rate with 1-day lag; alert if > 5 days missing
- **Calculation Errors**: Log, alert fund manager, allow manual override with approval
- **Precision Overflow**: Aggressive rounding; escalate to analyst for review
- **Reconciliation Variance**: Log variance; if > threshold, investigate root cause

## Monitoring & Alerts

- **Daily NAV Change**: Alert if > 5% from previous day
- **Fee Reconciliation**: Alert if variance between sum of pro-rata and calculated daily fee > R$ 0.01
- **Index Data Freshness**: Alert if index data > 1 business day old
- **Calculation Latency**: Alert if any calculation exceeds 100ms (vs. 5ms target)
- **Cache Hit Rate**: Monitor; alert if hit rate drops below 80%

<!-- SPECKIT END -->
