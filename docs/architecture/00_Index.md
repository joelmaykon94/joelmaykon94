# Documentação de Arquitetura do Sistema

Bem-vindo à documentação oficial do sistema. Este repositório contém a visão de alto nível, padrões de projeto, arquitetura de infraestrutura e decisões técnicas que guiam o desenvolvimento ponta a ponta deste projeto.

## Índice

1. [Visão Geral da Arquitetura](01_Architecture_Overview.md)
2. [Domain-Driven Design (DDD) e Clean Architecture](02_Domain_Driven_Design_Clean_Arch.md)
3. [Ecossistema de Microsserviços](03_Microservices_Services.md)
4. [Frontend em Angular](04_Frontend_Angular.md)
5. [Bancos de Dados e Persistência](05_Databases_Storage.md)
6. [Mensageria e Eventos (Kafka & RabbitMQ)](06_Messaging_Events.md)
7. [Segurança e Gestão de Identidade (Keycloak)](07_Security_IAM.md)
8. [Processamento em Lote (Spring Batch)](08_Batch_Processing.md)
9. [Observabilidade e Monitoramento](09_Observability.md)
10. [CI/CD, Gitflow e Qualidade de Código](10_CI_CD_Gitflow_Tests.md)
11. [Infraestrutura, Kubernetes e Deployment](11_Infrastructure_Deployment.md)

## Tecnologias Principais

- **Backend:** Java 21, Quarkus, Spring Batch
- **Frontend:** Angular
- **Arquitetura:** Microsserviços, Clean Architecture, Domain-Driven Design (DDD)
- **Mensageria:** Apache Kafka, RabbitMQ
- **Bancos de Dados:** Oracle (Transacional legado/core), SQL Server (Dados Corporativos), MongoDB (Dashboard/Leituras Rápidas/Event Sourcing)
- **Segurança:** Keycloak (OAuth2 / OIDC)
- **Qualidade & Testes:** SonarQube, JUnit, Mockito, Testcontainers, Cypress (E2E)
- **CI/CD:** GitHub Actions, ArgoCD, Gitflow Workflow
- **Infraestrutura:** Kubernetes, Rancher, Docker, NGINX
- **Observabilidade:** OpenTelemetry, Prometheus, Grafana, ELK/Loki
