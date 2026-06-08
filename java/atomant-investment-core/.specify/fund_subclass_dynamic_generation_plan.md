# Technical Implementation Plan: Fund Subclass Dynamic Generation

**Branch**: `fund-subclass-dynamic-generation` | **Date**: 2026-06-08 | **Spec**: [fund_subclass_dynamic_generation_spec.md](./fund_subclass_dynamic_generation_spec.md)

---

## 1. Summary

This plan details the technical approach to implement dynamic spawning and validation of up to 12 subclasses under a single Investment Class. We will leverage **Quarkus REST (RESTEasy Reactive)**, **Hibernate Validator (JSR-380)** validation groups, and **Panache Repositories** under a Hexagonal Architecture layout.

---

## 2. Technical Context

- **Language/Version**: Java 21 (utilizing Virtual Threads and Records)
- **Primary Dependencies**: `quarkus-hibernate-validator`, `quarkus-hibernate-orm-panache`, `quarkus-rest-jackson`
- **Storage**: PostgreSQL (Production), H2 (In-memory testing)
- **Testing**: JUnit 5, AssertJ, REST Assured
- **Target Platform**: Linux Container / JVM
- **Project Type**: Web Service (REST API)
- **Performance Goals**: Hibernate validator constraint checks for 12 subclasses must execute in <10ms CPU time.
- **Constraints**: Force strict dynamic boundary (min 1, max 12 subclasses) on formalization; allow nullable/partial subclass details in draft mode.

---

## 3. Constitution Check

- [x] **Hexagonal Architecture Separation**: Domain layer (`domain.model`) must remain pure Java with zero dependencies on JPA annotations or Quarkus packages.
- [x] **No Active Record**: Domain persistence mapped via Panache Repository pattern (`PanacheRepositoryBase`) rather than active record entities.
- [x] **Testing Standards**: Domain validations and constraints are 100% unit-tested; HTTP serialization and validation rules verified via REST Assured.
- [x] **Java 21 Threading**: Endpoints utilize `@RunOnVirtualThread` to avoid blocking event loops during PostgreSQL transactions.

---

## 4. Phase 0: Research Decisions

- **Decision 1 (Validation Groups)**: Use Hibernate Validator Groups (`DraftGroup.class` and `FormalizeGroup.class`) to distinguish between loose draft validation and strict formalization validation on the same DTO.
  - *Rationale*: Allows using a single schema hierarchy for both modes, maintaining type safety while dynamically enabling constraint enforcement based on endpoint context.
  - *Alternatives Considered*: Distinct DTO classes for draft and formalization. Rejected to prevent class explosion and duplicate mapping layers.
- **Decision 2 (Spawning Enforcement)**: Enforce the `@Size(min = 1, max = 12, groups = FormalizeGroup.class)` on the subclasses collection in `InvestmentClassRequestDTO`.
  - *Rationale*: Declaratively checks boundary constraints at the framework adapter layer before hitting resources.

---

## 5. Phase 1: Design & Contracts

### 5.1 Data Model Mappings (`data-model.md`)

```
org.acme.investment.infrastructure.persistence
├── InvestmentClassEntity.java     <-- Maps "investment_classes" table
└── InvestmentSubclassEntity.java  <-- Maps "investment_subclasses" table
```

#### `InvestmentClassEntity`
```java
@Entity
@Table(name = "investment_classes")
public class InvestmentClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 150)
    public String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    public ClassStatus status; // DRAFT, FORMALIZED

    @OneToMany(mappedBy = "investmentClass", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<InvestmentSubclassEntity> subclasses = new ArrayList<>();
}
```

#### `InvestmentSubclassEntity`
```java
@Entity
@Table(name = "investment_subclasses")
public class InvestmentSubclassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    public InvestmentClassEntity investmentClass;

    @Column(name = "subclass_code", nullable = false, length = 50)
    public String subclassCode;

    @Column(nullable = false, length = 150)
    public String name;

    @Column(length = 18)
    public String cnpj;

    @Column(name = "admin_fee", precision = 8, scale = 6)
    public BigDecimal adminFee;

    @Column(name = "tax_classification", length = 100)
    public String taxClassification;
}
```

### 5.2 API Interface Contracts (`/contracts/`)

#### Validation Groups
```java
public interface DraftGroup {}
public interface FormalizeGroup {}
```

#### Resource Interface Contract
```java
@Path("/api/classes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface ClassApiContract {

    @POST
    @Path("/draft")
    @RunOnVirtualThread
    Response saveDraft(@ConvertGroup(to = DraftGroup.class) @Valid ClassRequestDTO dto);

    @POST
    @Path("/formalize")
    @RunOnVirtualThread
    Response formalizeClass(@ConvertGroup(to = FormalizeGroup.class) @Valid ClassRequestDTO dto);
}
```

#### Request DTO
```java
public class ClassRequestDTO {
    public Long id;

    @NotBlank(groups = {DraftGroup.class, FormalizeGroup.class})
    public String name;

    @NotNull(groups = FormalizeGroup.class)
    @Size(min = 1, max = 12, groups = FormalizeGroup.class, message = "Spawning limit: must be between 1 and 12 subclasses")
    @Valid
    public List<SubclassRequestDTO> subclasses;
}

public class SubclassRequestDTO {
    @NotBlank(groups = FormalizeGroup.class)
    public String subclassCode;

    @NotBlank(groups = FormalizeGroup.class)
    public String name;

    @Pattern(regexp = "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", groups = FormalizeGroup.class, message = "Invalid CNPJ format")
    public String cnpj;

    @Positive(groups = FormalizeGroup.class)
    public BigDecimal adminFee;

    @NotBlank(groups = FormalizeGroup.class)
    public String taxClassification;
}
```

### 5.3 Quickstart validation guide (`quickstart.md`)

#### Draft Persistence Verification
1. **Request**: `POST /api/classes/draft`
   ```json
   {
     "name": "Class A - Equity Focus",
     "subclasses": []
   }
   ```
2. **Outcome**: `201 Created` with payload saved in `DRAFT` status (0 subclasses).

#### Over-Limit Verification
1. **Request**: `POST /api/classes/formalize`
   - Send with `subclasses` list containing 13 elements.
2. **Outcome**: `400 Bad Request` with constraint validation error: `Spawning limit: must be between 1 and 12 subclasses`.

#### Individual Subclass Constraint Failure
1. **Request**: `POST /api/classes/formalize`
   ```json
   {
     "name": "Class B - Fixed Income",
     "subclasses": [
       {
         "subclassCode": "SUB-01",
         "name": "Subclass 1",
         "cnpj": "invalid-cnpj-format",
         "adminFee": -0.5,
         "taxClassification": "Longo Prazo"
       }
     ]
   }
   ```
2. **Outcome**: `400 Bad Request` displaying details:
   - `subclasses[0].cnpj: Invalid CNPJ format`
   - `subclasses[0].adminFee: must be greater than 0`
