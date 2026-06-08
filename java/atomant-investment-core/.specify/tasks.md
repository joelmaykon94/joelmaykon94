# Actionable Tasks: Fund Subclass Dynamic Generation

This document lists the atomic, sequential execution tasks for implementing the **Fund Subclass Dynamic Generation** feature in the `atomant-investment-core` service.

---

## Phase 1: Setup & Configuration

- [ ] T001 Verify Hibernate Validator dependencies are configured in [pom.xml](file:///home/joelmaykon/joelmaykon94/java/atomant-investment-core/pom.xml).
- [ ] T002 [P] Configure JSON validation error mappings in `java/atomant-investment-core/src/main/java/org/acme/investment/api/error/ValidationExceptionMapper.java` to return standardized error codes and field mappings.

---

## Phase 2: Foundational Adapters

- [ ] T003 [P] Create validation group interfaces in `java/atomant-investment-core/src/main/java/org/acme/investment/api/validation/DraftGroup.java` and `java/atomant-investment-core/src/main/java/org/acme/investment/api/validation/FormalizeGroup.java`.
- [ ] T004 [P] Create database migration script `V1.4.0__create_investment_subclasses_tables.sql` under `java/atomant-investment-core/src/main/resources/db/migration/` defining the tables for `investment_classes` and `investment_subclasses`.

---

## Phase 3: User Story 1 - Draft Mode Persistence

- [ ] T005 [US1] Map JPA database entities for the class structure in `java/atomant-investment-core/src/main/java/org/acme/investment/infrastructure/persistence/InvestmentClassEntity.java` and `java/atomant-investment-core/src/main/java/org/acme/investment/infrastructure/persistence/InvestmentSubclassEntity.java`.
- [ ] T006 [P] [US1] Implement Panache repository wrappers in `java/atomant-investment-core/src/main/java/org/acme/investment/infrastructure/persistence/InvestmentClassRepository.java` and `java/atomant-investment-core/src/main/java/org/acme/investment/infrastructure/persistence/InvestmentSubclassRepository.java`.
- [ ] T007 [US1] Define incoming transfer schemas in `java/atomant-investment-core/src/main/java/org/acme/investment/api/dto/ClassRequestDTO.java` and `java/atomant-investment-core/src/main/java/org/acme/investment/api/dto/SubclassRequestDTO.java` using group parameters.
- [ ] T008 [US1] Implement save business logic in `java/atomant-investment-core/src/main/java/org/acme/investment/domain/service/ClassDraftService.java` to save partial metadata using draft status.
- [ ] T009 [US1] Implement JAX-RS controller mapping in `java/atomant-investment-core/src/main/java/org/acme/investment/api/rest/ClassResource.java` exposing `POST /api/classes/draft`.
- [ ] T010 [US1] Write integration tests using REST Assured verifying partial draft payloads save successfully in `java/atomant-investment-core/src/test/java/org/acme/investment/api/rest/ClassDraftResourceTest.java`.

---

## Phase 4: User Story 2 - Subclass Dynamic Generation Limits

- [ ] T011 [US2] Apply collection boundary constraints `@Size(min = 1, max = 12, groups = FormalizeGroup.class)` on the subclass list inside `java/atomant-investment-core/src/main/java/org/acme/investment/api/dto/ClassRequestDTO.java`.
- [ ] T012 [US2] Add the `@Valid` annotation to cascading validation fields on the subclass list inside `java/atomant-investment-core/src/main/java/org/acme/investment/api/dto/ClassRequestDTO.java`.
- [ ] T013 [US2] Add controller mapping for formalization in `java/atomant-investment-core/src/main/java/org/acme/investment/api/rest/ClassResource.java` exposing `POST /api/classes/formalize` bound to the `FormalizeGroup` validation context.
- [ ] T014 [US2] Write unit tests verifying dynamic subclass spawning limits (rejecting 0 or 13 subclasses, accepting 1 to 12) in `java/atomant-investment-core/src/test/java/org/acme/investment/domain/service/ClassBoundaryValidationTest.java`.

---

## Phase 5: User Story 3 - Formalization Strict Validation

- [ ] T015 [US3] Add detailed Hibernate Validator parameters (`@NotBlank`, `@Pattern`, `@Positive`) to fields in `java/atomant-investment-core/src/main/java/org/acme/investment/api/dto/SubclassRequestDTO.java` associated with the `FormalizeGroup.class` context.
- [ ] T016 [US3] Implement business logic for promoting draft classes to active states in `java/atomant-investment-core/src/main/java/org/acme/investment/domain/service/ClassFormalizationService.java`.
- [ ] T017 [US3] Write REST Assured integration tests verifying payload validations in `java/atomant-investment-core/src/test/java/org/acme/investment/api/rest/ClassFormalizationValidationTest.java`.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T018 Execute the full test suite and confirm that test coverage passes the minimum project gate rules.
