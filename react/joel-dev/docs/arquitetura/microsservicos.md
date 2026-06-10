---
sidebar_position: 3
---

# 🚀 Ecossistema de Microsserviços

Esta seção detalha as responsabilidades e configurações dos serviços que compõem o ecossistema da plataforma.

:::info 
Escolha Tecnológica: Quarkus
Escolhemos **Quarkus** com **Java 21** (Virtual Threads) devido ao tempo de inicialização ultrarrápido e baixo consumo de memória, ideal para ambientes de cloud-native e Kubernetes.
:::

## 📦 Serviços Core

<div className="doc-step">
  <div className="doc-step-number">1</div>
  <div className="doc-step-content">
    <h3>Auth & User Service</h3>
    <p>Responsável pelo ciclo de vida do usuário e integração com Keycloak.</p>
    <ul>
      <li><strong>DB:</strong> SQL Server</li>
      <li><strong>Eventos:</strong> Publica <code>UserCreatedEvent</code></li>
      <li><span className="badge-linear">Identity & Access</span></li>
    </ul>
  </div>
</div>

<div className="doc-step">
  <div className="doc-step-number">2</div>
  <div className="doc-step-content">
    <h3>Financial Transaction Service</h3>
    <p>Onde o "dinheiro muda de mãos". Realiza pagamentos e transferências com alta consistência.</p>
    <ul>
      <li><strong>DB:</strong> Oracle (ACID Compliance)</li>
      <li><strong>Padrão:</strong> Outbox Pattern para mensageria resiliente</li>
      <li><span className="badge-linear--success">Core Financial</span></li>
    </ul>
  </div>
</div>

<div className="doc-step">
  <div className="doc-step-number">3</div>
  <div className="doc-step-content">
    <h3>Dashboard Service (CQRS Read Side)</h3>
    <p>Consolida dados analíticos de forma assíncrona para entregas em milissegundos.</p>
    <ul>
      <li><strong>DB:</strong> MongoDB (NoSQL)</li>
      <li><strong>Eventos:</strong> Consome de Apache Kafka</li>
      <li><span className="badge-linear--warning">Analytics</span></li>
    </ul>
  </div>
</div>

<div className="doc-step">
  <div className="doc-step-number">4</div>
  <div className="doc-step-content">
    <h3>Batch Processor</h3>
    <p>Executa rotinas pesadas de fim de dia (EOD) e conciliações bancárias.</p>
    <ul>
      <li><strong>Tech:</strong> Spring Batch + Java 21</li>
      <li><strong>Agendamento:</strong> CronJobs Kubernetes</li>
      <li><span className="badge-linear--danger">Batch Processing</span></li>
    </ul>
  </div>
</div>

## 🔄 Fluxo de Transação (CQRS + Mensageria)

O diagrama abaixo ilustra o fluxo ponta a ponta desde a requisição do usuário até a atualização do dashboard em tempo real.

```mermaid
sequenceDiagram
    actor User as Angular App
    participant API as API Gateway
    participant TS as Financial Service
    participant Oracle as DB Oracle
    participant Kafka as Apache Kafka
    participant DS as Dashboard Service
    participant Mongo as DB MongoDB

    User->>API: POST /transactions (amount, target)
    API->>TS: Roteamento com JWT
    TS->>TS: Validação de Domínio (DDD)
    TS->>Oracle: BEGIN TRANSACTION
    TS->>Oracle: UPDATE saldo, INSERT extrato
    TS->>Oracle: INSERT evento na tabela Outbox
    TS->>Oracle: COMMIT
    TS-->>API: 201 Created
    API-->>User: Sucesso
    
    TS->>Kafka: Worker publica 'TransactionCreatedEvent'
    Kafka-->>DS: Consome evento em background
    DS->>Mongo: Atualiza documento de dashboard do usuário
    
    User->>API: GET /dashboard
    API->>DS: Roteamento com JWT
    DS->>Mongo: Leitura instantânea (Otimizada)
    DS-->>API: JSON Dashboard
    API-->>User: Exibe gráficos atualizados
```

:::tip
 Outbox Pattern
Utilizamos o **Outbox Pattern** para garantir que uma transação no banco de dados e a publicação de um evento no Kafka ocorram de forma atômica, evitando perda de eventos em caso de falha.
:::
