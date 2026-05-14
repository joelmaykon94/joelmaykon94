# 1. Visão Geral da Arquitetura

O sistema é desenhado como uma arquitetura de Microsserviços, focada em alta escalabilidade, resiliência e manutenção a longo prazo, atendendo a domínios complexos de finanças e gestão de usuários.

## Contexto do Sistema (C4 Model - Nível 1)

```mermaid
C4Context
    title Diagrama de Contexto do Sistema Financeiro e Dashboard

    Person(user, "Usuário Final", "Acessa o Dashboard e realiza transações financeiras.")
    System(system, "Plataforma Financeira", "Permite visualização de dados em tempo real, gestão de usuários e execução de transações financeiras.")
    
    System_Ext(keycloak, "Keycloak (IAM)", "Gerenciador de Identidade e Acesso centralizado.")
    System_Ext(oracle_core, "Oracle Core Bank", "Sistema de core bancário e liquidação externa (opcional/integração).")

    Rel(user, system, "Acessa dashboard e transaciona", "HTTPS/REST")
    Rel(system, keycloak, "Delega autenticação e valida tokens", "OIDC/OAuth2")
    Rel(system, oracle_core, "Liquida transações financeiras", "JDBC/REST")
```

## Arquitetura de Contêineres (C4 Model - Nível 2)

```mermaid
C4Container
    title Diagrama de Contêineres - Plataforma Financeira

    Person(user, "Usuário Final", "Acessa a plataforma via navegador")

    System_Boundary(platform, "Plataforma Financeira") {
        Container(spa, "Single Page App (Angular)", "Angular, TypeScript", "Provê a interface de usuário (Dashboard, Transações, Gestão de Usuários).")
        Container(api_gateway, "API Gateway / NGINX", "NGINX/Kong", "Roteamento reverso, rate limiting e terminação SSL.")
        
        Container(ms_auth, "Auth & User Service", "Java 21, Quarkus", "Gerencia os dados de usuário e faz ponte com o Keycloak.")
        Container(ms_financial, "Financial Transaction Service", "Java 21, Quarkus", "Processa e consolida as transações financeiras.")
        Container(ms_dashboard, "Dashboard & Analytics Service", "Java 21, Quarkus", "Agrega dados para a visualização no Frontend.")
        Container(ms_batch, "Batch Processor", "Java 21, Spring Batch", "Processa conciliações e relatórios noturnos.")

        ContainerDb(db_sqlserver, "Database Usuários", "SQL Server", "Armazena dados cadastrais de usuários.")
        ContainerDb(db_oracle, "Database Financeiro", "Oracle", "Consistência ACID para transações financeiras.")
        ContainerDb(db_mongo, "Database Dashboard", "MongoDB", "Views otimizadas em tempo real para o Dashboard (CQRS).")
        
        ContainerQueue(kafka, "Apache Kafka", "Message Broker", "Eventos de alta volumetria (Transações, Atualização de Views).")
        ContainerQueue(rabbitmq, "RabbitMQ", "Message Broker", "Filas de processamento assíncrono e retry de notificações.")
    }

    Rel(user, spa, "Usa")
    Rel(spa, api_gateway, "Chamadas API", "JSON/HTTPS")
    
    Rel(api_gateway, ms_auth, "Roteia /api/users", "REST")
    Rel(api_gateway, ms_financial, "Roteia /api/transactions", "REST")
    Rel(api_gateway, ms_dashboard, "Roteia /api/dashboard", "REST")
    
    Rel(ms_auth, db_sqlserver, "Lê/Escreve", "JDBC")
    Rel(ms_financial, db_oracle, "Lê/Escreve", "JDBC")
    Rel(ms_dashboard, db_mongo, "Lê", "NoSQL Driver")
    
    Rel(ms_financial, kafka, "Publica 'TransactionCreated'", "Kafka Protocol")
    Rel(ms_dashboard, kafka, "Consome eventos para atualizar Dashboard", "Kafka Protocol")
    
    Rel(ms_batch, db_oracle, "Lê transações", "JDBC")
    Rel(ms_batch, rabbitmq, "Notifica", "AMQP")
```

## Resumo Tecnológico e Padrões
- **Padrões Arquiteturais:** API Gateway, CQRS (Command Query Responsibility Segregation), Event-Driven Architecture, Database-per-service.
- **Integração:** Orquestração no Frontend (BFF opcional) ou direto via API Gateway. Comunicação assíncrona entre serviços via Kafka.
