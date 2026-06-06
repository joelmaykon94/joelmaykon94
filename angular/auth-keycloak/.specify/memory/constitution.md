<!--
SYNC IMPACT REPORT
- Version change: Template -> 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] -> I. Code Simplicity and Quality
  - [PRINCIPLE_2_NAME] -> II. Testing Discipline and Standards
  - [PRINCIPLE_3_NAME] -> III. User Experience and Interface Consistency
  - [PRINCIPLE_4_NAME] -> IV. Performance Standards and Optimization
  - [PRINCIPLE_5_NAME] -> V. Security and Observability
- Added sections:
  - Additional Constraints and Technology Stack (replacing [SECTION_2_NAME])
  - Quality Gates and CI/CD Pipeline (replacing [SECTION_3_NAME])
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated)
- Follow-up TODOs: None
-->

# Auth-Keycloak Constitution

## Core Principles

### I. Code Simplicity and Quality

Developers MUST write simple, clean, and typed code adhering to Angular/TypeScript best
practices and Clean Architecture.
- TypeScript strict mode MUST be enabled; the use of `any` is strictly prohibited.
- Components MUST be modular, single-responsibility, and reusable. Avoid heavy components.
- Business logic MUST be separated from the UI layer by using Angular Services.
- Linting and formatting rules (ESLint, Prettier) MUST pass with zero warnings.

### II. Testing Discipline and Standards

Testing is non-negotiable. Every user journey, logic flow, and contract MUST be covered
by appropriate tests.
- Unit tests MUST achieve at least 80% code coverage for all new files.
- Critical integration paths (e.g. auth redirection, login flows) MUST have integration tests.
- API integrations and token exchanges MUST have contract verification tests.
- Jasmine/Karma (or Jest) test execution MUST pass successfully in the CI/CD pipeline.

### III. User Experience and Interface Consistency

The user interface MUST provide a unified, responsive, and seamless experience.
- All UI/UX elements MUST use the project's design system tokens and reusable UI components.
- The UI MUST be fully responsive and adapt to mobile, tablet, and desktop viewports.
- Proper state management (e.g. loading, empty, and disabled states) MUST be visible during operations.
- Error messages MUST be user-friendly, descriptive, and non-blocking.

### IV. Performance Standards and Optimization

Performance goals MUST be met to ensure high responsiveness.
- The application MUST use lazy loading for routing and modules to minimize initial bundle size.
- Initial page loads MUST target a Lighthouse Performance score of >= 90.
- All input/change events that trigger network requests MUST be debounced to reduce traffic.
- Change Detection Strategy MUST be optimized (e.g., using `OnPush` where applicable).

### V. Security and Observability

Security and visibility into the application status are crucial.
- Tokens and sensitive data MUST be stored securely using HTTPOnly cookies or secure local/session storage.
- Every auth-state transition (login, token refresh, logout, session expiration) MUST produce structured logs.
- Logging of sensitive information (passwords, raw client secrets, PII) is strictly prohibited.

## Additional Constraints and Technology Stack

- **Framework**: Angular 19+ with SCSS for styling and TypeScript for core logic.
- **Auth Integration**: Keycloak server (OAuth 2.0 / OpenID Connect protocols).
- **Environment Configuration**: Multi-environment support using environment-specific variables.
- **Accessibility**: Compliance with WCAG 2.1 AA standards is required for all customer-facing elements.

## Quality Gates and CI/CD Pipeline

- **Linting & Formatting Gate**: Pre-commit and CI/CD pipelines MUST run ESLint and Prettier. Any warning/error blocks code integration.
- **Testing Gate**: No pull request can be merged unless all test suites pass.
- **Code Review**: A minimum of one peer review approval is required for all changes. Reviewers MUST verify compliance with this Constitution.

## Governance

- This Constitution is the final authority on code quality and architectural decisions.
- Deviations MUST be documented in the Implementation Plan under "Complexity Tracking" and explicitly approved.
- Amendments to this Constitution require a Minor/Major version increment, proposed via a Pull Request with complete rationale and team alignment.

**Version**: 1.0.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06
