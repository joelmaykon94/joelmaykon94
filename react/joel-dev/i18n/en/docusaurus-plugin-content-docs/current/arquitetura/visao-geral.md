---
sidebar_position: 1
---

# 🏗️ Architecture Overview

The system is designed as a **Microservices** architecture, focused on high scalability, resilience, and long-term maintenance, serving complex domains of finance and user management.

:::info
Architectural Style
This project uses the most modern market standards, combining **Event-Driven Architecture** with **CQRS** to ensure performance and eventual consistency where necessary.
:::

## 🌐 System Context (C4 Model - Level 1)

The diagram below describes the high-level ecosystem and how the user interacts with the platform and its external systems.

```mermaid
C4Context
    title Financial System and Dashboard Context Diagram

    Person(user, "End User", "Accesses the Dashboard and performs financial transactions.")
    System(system, "Financial Platform", "Allows real-time data visualization, user management, and execution of financial transactions.")
    
    System_Ext(keycloak, "Keycloak (IAM)", "Centralized Identity and Access Manager.")
    System_Ext(oracle_core, "Oracle Core Bank", "Banking core system and external settlement (optional/integration).")

    Rel(user, system, "Accesses dashboard and transacts", "HTTPS/REST")
    Rel(system, keycloak, "Delegates authentication and validates tokens", "OIDC/OAuth2")
    Rel(system, oracle_core, "Settles financial transactions", "JDBC/REST")
```

## 📦 Container Architecture (C4 Model - Level 2)

Deepening into the solution, we detail how services communicate and which persistence technologies are used.

```mermaid
C4Container
    title Container Diagram - Financial Platform

    Person(user, "End User", "Accesses the platform via browser")

    System_Boundary(platform, "Financial Platform") {
        Container(spa, "Single Page App (Angular)", "Angular, TypeScript", "Provides the user interface (Dashboard, Transactions, User Management).")
        Container(api_gateway, "API Gateway / NGINX", "NGINX/Kong", "Reverse routing, rate limiting, and SSL termination.")
        
        Container(ms_auth, "Auth & User Service", "Java 21, Quarkus", "Manages user data and bridges with Keycloak.")
        Container(ms_financial, "Financial Transaction Service", "Java 21, Quarkus", "Processes and consolidates financial transactions.")
        Container(ms_dashboard, "Dashboard & Analytics Service", "Java 21, Quarkus", "Aggregates data for Frontend visualization.")
        Container(ms_batch, "Batch Processor", "Java 21, Spring Batch", "Processes night-time reconciliations and reports.")

        ContainerDb(db_sqlserver, "Users Database", "SQL Server", "Stores user registration data.")
        ContainerDb(db_oracle, "Financial Database", "Oracle", "ACID consistency for financial transactions.")
        ContainerDb(db_mongo, "Dashboard Database", "MongoDB", "Real-time optimized views for the Dashboard (CQRS).")
        
        ContainerQueue(kafka, "Apache Kafka", "Message Broker", "High-volume events (Transactions, View updates).")
        ContainerQueue(rabbitmq, "RabbitMQ", "Message Broker", "Asynchronous processing queues and notification retries.")
    }

    Rel(user, spa, "Uses")
    Rel(spa, api_gateway, "API Calls", "JSON/HTTPS")
    
    Rel(api_gateway, ms_auth, "Routes /api/users", "REST")
    Rel(api_gateway, ms_financial, "Routes /api/transactions", "REST")
    Rel(api_gateway, ms_dashboard, "Routes /api/dashboard", "REST")
    
    Rel(ms_auth, db_sqlserver, "Reads/Writes", "JDBC")
    Rel(ms_financial, db_oracle, "Reads/Writes", "JDBC")
    Rel(ms_dashboard, db_mongo, "Reads", "NoSQL Driver")
    
    Rel(ms_financial, kafka, "Publishes 'TransactionCreated'", "Kafka Protocol")
    Rel(ms_dashboard, kafka, "Consumes events to update Dashboard", "Kafka Protocol")
    
    Rel(ms_batch, db_oracle, "Reads transactions", "JDBC")
    Rel(ms_batch, rabbitmq, "Notifies", "AMQP")
```

## 🛠️ Technology Stack

| Layer | Technology | Badge |
| :--- | :--- | :--- |
| **Backend** | Java 21 / Quarkus | <span className="badge-linear">Robustness</span> |
| **Frontend** | Angular | <span className="badge-linear">Scalability</span> |
| **Messaging** | Kafka / RabbitMQ | <span className="badge-linear--warning">Resilience</span> |
| **Database** | Oracle / SQL Server / MongoDB | <span className="badge-linear--success">Consistency</span> |
| **Security** | Keycloak | <span className="badge-linear--danger">Security</span> |

## 📐 Implemented Architectural Patterns

<div className="bento-grid">
  <div className="bento-item">
    <h3>CQRS</h3>
    <p>Separation of responsibility between read and write for maximum performance.</p>
  </div>
  <div className="bento-item">
    <h3>Event-Driven</h3>
    <p>Decoupled asynchronous communication using Apache Kafka.</p>
  </div>
  <div className="bento-item">
    <h3>API Gateway</h3>
    <p>Single entry point, security, and routing for the ecosystem.</p>
  </div>
</div>
