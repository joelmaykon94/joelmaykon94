# Purpose
This project contains the **Financial Core & Ledger Engine** backend service (formerly enterprise-financial-core) that handles double-entry ledger accounting, settlement clearing, real-time transaction anti-fraud detection, dynamic fee configurations, and legacy system integrations.

# Ownership
- Owner: joelmaykon

# Local Contracts
- Ledger records are immutable; corrections must be posted as separate reversal entries.
- Double-entry balance verification is mandatory: Total Debits must always equal Total Credits.
- No Float or Double types should be used for monetary values. Use `BigDecimal` with `RoundingMode.HALF_EVEN`.

# Work Guidance
For complete context about requirements and architecture, refer to:
- [.specify/memory/constitution.md](file:///home/joelmaykon/joelmaykon94/java/atomant-financial-core/.specify/memory/constitution.md): Architectural layers and component interaction.
- [.specify/memory/business-rules.md](file:///home/joelmaykon/joelmaykon94/java/atomant-financial-core/.specify/memory/business-rules.md): Detailed business rules for the ledger, clearing, fraud checks, and legacy adapters.
- [.specify/global_kyc_risk_analysis_spec.md](file:///home/joelmaykon/joelmaykon94/java/atomant-financial-core/.specify/global_kyc_risk_analysis_spec.md): Specifications for real-time risk assessment and KYC validation.
- [.specify/dora_compliance_cloud_resilience_spec.md](file:///home/joelmaykon/joelmaykon94/java/atomant-financial-core/.specify/dora_compliance_cloud_resilience_spec.md): Resiliency patterns and DORA compliance checklist.
- [.specify/zero_trust_api_gateway_fapi_spec.md](file:///home/joelmaykon/joelmaykon94/java/atomant-financial-core/.specify/zero_trust_api_gateway_fapi_spec.md): Zero-Trust security rules and FAPI compliance.
- [.specify/checklists/requirements.md](file:///home/joelmaykon/joelmaykon94/java/atomant-financial-core/.specify/checklists/requirements.md): System integration requirements checklist.

# Verification
- Run test suites using the project build tools.
- Verify double-entry balancing rules in unit and integration tests.

# Child DOX Index
None.
