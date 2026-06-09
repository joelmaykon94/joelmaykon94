# Project Developer Guide (CLAUDE.md)

This document contains developer commands, style guidelines, and agent configuration details for this repository.

## Commands

- **Python/Poetry Environment**:
  - Install dependencies: `poetry install` (run in `python/poetry`)
  - Run python scripts: `poetry run python <script.py>`
  - Run tests: `poetry run pytest`
  - Code linting: `poetry run ruff check .`
  - Code formatting: `poetry run ruff format .`

## Code Guidelines
- Write clean, type-hinted Python code using modern conventions.
- Format code using Ruff (compliant with Black formatting style).
- Use descriptive variable names and document classes and functions.
- Follow the 7 phases of AI-driven development.

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage labels map to standard GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

This project uses a single-context domain document layout. See `docs/agents/domain.md`.
