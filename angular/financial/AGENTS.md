# Purpose
This directory contains the `financial` Angular frontend application for the Atomant financial system, providing dashboards and user interfaces for investment tracking, payment management, and audit visualization.

# Ownership
- Owner: joelmaykon

# Local Contracts
- Ensure `tsconfig.app.json` has `compilerOptions.rootDir` explicitly set to `"src"` to maintain consistent compile layout and avoid TypeScript build resolution issues.
- All code must follow Angular and TypeScript standards and clean code principles.

# Work Guidance
- Use Angular CLI to build or serve the application.
- Build the project using `npm run build`.
- Serve the project in development mode using `npm run start`.

# Verification
- Run type check: `npx tsc --project tsconfig.app.json --noEmit`
- Run build command: `npm run build`
