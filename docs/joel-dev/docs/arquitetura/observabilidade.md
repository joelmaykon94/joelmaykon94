---
sidebar_position: 4
---

# 🕵️ Observabilidade e Monitoramento

Em uma arquitetura de microsserviços, a observabilidade não é opcional, é o sistema imunológico da plataforma. Implementamos a estratégia baseada nos "Três Pilares".

:::important
 Resiliência
Nossa stack de observabilidade permite identificar falhas antes mesmo que o usuário as perceba, através de alertas proativos e rastreamento ponta a ponta.
:::

## 📊 Os Três Pilares

<div className="bento-grid">
  <div className="bento-item">
    <h3>📈 Métricas</h3>
    <p><strong>Ferramentas:</strong> Prometheus + Grafana</p>
    <p>Monitoramento de saúde da JVM, CPU, Memória e throughput de mensagens (Kafka lag).</p>
  </div>
  <div className="bento-item">
    <h3>📑 Logs</h3>
    <p><strong>Ferramentas:</strong> Loki + Promtail</p>
    <p>Logs centralizados em formato JSON para facilitar a busca e agregação por correlação.</p>
  </div>
  <div className="bento-item">
    <h3>🔗 Tracing</h3>
    <p><strong>Ferramentas:</strong> OpenTelemetry + Tempo</p>
    <p>Rastreamento distribuído para acompanhar uma requisição através de múltiplos serviços.</p>
  </div>
</div>

## 🏗️ Arquitetura de Monitoramento

O diagrama abaixo detalha como os dados de telemetria fluem dos serviços até os dashboards do Grafana.

```mermaid
graph TD
    subgraph "Cluster Kubernetes"
        Service["Microservices (Quarkus/Spring)"]
        Service --> |"Logs JSON (stdout)"| Promtail["Promtail / Fluentbit"]
        Service --> |"Métricas /metrics"| Prometheus["Prometheus Server"]
        Service --> |"Spans (OTLP)"| OTelCollector["OpenTelemetry Collector"]
    end

    Promtail --> Loki["Loki"]
    Prometheus --> Grafana["Grafana Dashboards"]
    Loki --> Grafana
    OTelCollector --> Tempo["Grafana Tempo / Jaeger"]
    Tempo --> Grafana
```

## 🎯 Métricas Chave de Sucesso (KPIs)

| Métrica | Descrição | Status |
| :--- | :--- | :--- |
| **Error Rate** | Porcentagem de requisições HTTP 5xx. | <span className="badge-linear--danger">Crítico</span> |
| **Latency (P99)** | Tempo de resposta para 99% das requisições. | <span className="badge-linear--warning">Alerta</span> |
| **Throughput** | Quantidade de transações por segundo (TPS). | <span className="badge-linear--success">Saudável</span> |
| **Kafka Lag** | Atraso no processamento de mensagens nas filas. | <span className="badge-linear">Performance</span> |

:::tip
 Tracing ID
Toda requisição que entra pelo **API Gateway** recebe um `trace-id` único. Esse ID é propagado para todos os serviços internos (via headers HTTP) e mensagens de fila, permitindo uma visão unificada do fluxo.
:::
