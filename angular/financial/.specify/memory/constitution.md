# SpecKit Project Constitution: Financial App

This constitution defines the non-negotiable principles, engineering standards, and quality gates for the development of the **Financial App**. All AI-driven planning, code generation, and manual refactoring must comply with these guidelines.

---

## 1. Code Quality & Architecture Principles

### TypeScript Standards
- **Strict Type Safety:** TypeScript `strict` mode must be enabled and enforced. The `any` type is strictly forbidden. 
- **Type Definitions:** All API request/response payloads, component state structures, and complex data structures must have explicit `interface` or `type` declarations.
- **Avoid Assertions:** Do not use type assertions (`as Type`) or non-null assertions (`!`) unless interacting with external libraries that do not have accurate typings. Document any exceptions.

### Angular 21 Best Practices
- **Standalone Architecture:** All components, directives, and pipes must be standalone (`standalone: true`). 
- **Modern Control Flow:** Use modern template control flow (`@if`, `@for`, `@switch`) instead of legacy structural directives (`*ngIf`, `*ngFor`).
- **Reactive State with Signals:**
  - Utilize **Angular Signals** (`signal`, `computed`, `effect`) for component-level state management and state synchronization.
  - Limit the use of RxJS to operations that require async streams (e.g., HTTP requests, debouncing user input). Convert RxJS Observables to Signals using `toSignal()` when binding to templates.
- **Dependency Injection:** Use the modern `inject()` function in constructors or property initializations for dependency injection:
  ```typescript
  private readonly financialService = inject(FinancialService);
  ```
- **Single Responsibility (SRP):** Keep components concise (target < 300 lines of code). Extract business logic and network requests into dedicated Angular services.

---

## 2. Testing Standards

### Vitest & JSDOM
- **Primary Testing Framework:** All unit and component tests must use **Vitest** and **jsdom**. Legacy testing setups like Karma/Jasmine are not permitted.
- **Code Coverage Target:** Keep a target of at least **80% coverage** for all business logic, helper functions, and custom Angular services.
- **Test Isolation:**
  - Mock all HTTP/network services and external APIs during unit testing. Do not perform real network calls.
  - Utilize dedicated test beds (`TestBed.configureTestingModule`) to isolate components.
- **Component Testing:**
  - Verify template rendering under different input states (`@Input` properties).
  - Simulate user interactions (clicks, keyboard inputs) and assert that appropriate event outputs (`@Output`) or service calls are triggered.
- **Cleanup:** Ensure proper test cleanup in `afterEach` hooks if global states or subscriptions are mutated to prevent test leakage.

---

## 3. User Experience (UX) & Interface Consistency

### Styling & Design System
- **Tailwind CSS Utility First:** Use Tailwind CSS utility classes for layout, spacing, and styling. Avoid writing inline styles or custom ad-hoc CSS unless implementing complex visual effects that Tailwind cannot support.
- **Consistent Theme:** Strictly adhere to the predefined color palette (neutrals, primaries, success/warning/danger colors) to ensure design continuity.
- **Responsive Layouts:** Implement mobile-first styling (`md:`, `lg:` classes) to support all viewport sizes from 320px up to 1920px.

### Component Aesthetics
- **Lucide Icons:** Use `lucide-angular` for all icons across the application. Do not mix and match icon libraries.
- **Consistent Data Visualizations:** Utilize `chart.js` and `ng2-charts` for visualizations. Ensure the charts' color palettes match the app's style guide and adapt correctly to theme variations.
- **Visual Feedback:** All asynchronous operations must feature elegant visual feedback:
  - Skeleton loaders for content areas.
  - Spinner overlays for actions (e.g., submitting transactions).
  - Descriptive, accessible empty states when no data is available.
  - Clear error notifications with retry actions.

---

## 4. Performance Requirements

### Server-Side Rendering (SSR) Compatibility
- **Universal Code:** As this project uses `@angular/ssr`, all code must be safe to execute in a node.js environment.
- **Platform Checks:** Never reference browser-only globals (like `window`, `document`, or `localStorage`) directly. Use `isPlatformBrowser` or inject the `DOCUMENT` token:
  ```typescript
  import { isPlatformBrowser } from '@angular/common';
  import { inject, PLATFORM_ID } from '@angular/core';

  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    // Browser-only logic
  }
  ```

### Change Detection Strategy
- **OnPush Detection:** Enforce `ChangeDetectionStrategy.OnPush` on all components to optimize rendering performance. Bind component properties using Signals to trigger granular updates.

### Lazy Loading & Code Splitting
- **Deferred Loading:** Use the `@defer` block to lazy-load heavy templates, charts, and below-the-fold components:
  ```html
  @defer (on viewport) {
    <app-financial-chart [data]="data()" />
  } @placeholder {
    <div class="h-64 bg-slate-100 animate-pulse rounded-lg"></div>
  }
  ```
- **Route-Level Code Splitting:** Always lazy-load feature modules/components in the routing configuration to minimize the initial bundle size.
