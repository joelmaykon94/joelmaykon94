# Code Quality & Performance Guide

This project is configured with **OpenRewrite** and **Moderne** to maintain high standards of code quality and performance across Java, Angular, and Python.

## Java Projects (Maven)
Each Java project in the `java/` directory is configured with the `rewrite-maven-plugin`.

### How to run:
To fix code smells and optimize performance automatically:
```bash
# From any Java project directory (e.g., java/atomant-auth)
./mvnw rewrite:run
```

The active recipe is `com.atomant.QualityAndPerformance` (defined in the root `rewrite.yml`).

---

## Multi-Language support (Moderne CLI)
We use the **Moderne CLI (`mod`)** for unified quality checks.

### Setup Status:
- **CLI Path**: `/home/joelmaykon/.moderne/cli/bin/mod`
- **LSTs**: Built and ready for recipes.
- **Recipes**: `rewrite-static-analysis` and `rewrite-migrate-java` JARs installed.

### How to run:
1. **Login (First time only)**:
   ```bash
   /home/joelmaykon/.moderne/cli/bin/mod config moderne login
   ```
2. **Run Quality Recipes**:
   ```bash
   # Run the global quality pack
   /home/joelmaykon/.moderne/cli/bin/mod run . --recipe com.atomant.QualityAndPerformance
   ```
3. **Apply Changes**:
   ```bash
   /home/joelmaykon/.moderne/cli/bin/mod apply
   ```

---

## Customizing Rules
Edit `rewrite.yml` at the root to modify the `com.atomant.QualityAndPerformance` pack.
