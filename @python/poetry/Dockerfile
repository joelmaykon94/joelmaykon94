FROM python:3.10-slim as builder

RUN pip install poetry
RUN mkdir -p /app
COPY . /app

WORKDIR /app
RUN poetry install --without dev

FROM python:3.10-slim as base

COPY --from=builder /app /app

WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH"
CMD ["python", "-m", "app.main"]