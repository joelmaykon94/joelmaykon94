# Plano de Conteúdos para Modernização de Sistemas Bancários Legados

**Foco:** Migração de core bancário (mainframe/COBOL/silos) para stack moderna (Java 21, Spring Boot, Quarkus, Angular, cloud nativa)

---

## 🧠 Fundamentos de Estratégia de Migração

| Tópico | Descrição | Artigos e Referências |
|--------|-----------|----------------------|
| **Strangler Fig Pattern** | Método principal de substituição gradual de legado | [StranglerFigApplication](https://martinfowler.com/bliki/StranglerFigApplication.html) – Martin Fowler |
| **Anti-Corruption Layer (ACL)** | Isola o novo core do legado, evitando contaminação | *Patterns of Enterprise Application Architecture* – Fowler (Cap. ACL) |
| **Domain-Driven Design (DDD)** | Identificação de bounded contexts para desacoplar silos | *Domain-Driven Design* – Eric Evans (Cap. 14) |
| **Event-Driven Architecture (EDA)** | Elimina latência síncrona do mainframe | [Event-Driven Architecture on AWS for Banking](https://aws.amazon.com/pt/event-driven-architecture/) |
| **Strangler Fig Application** | Padrão de migração incremental | Martin Fowler (martinfowler.com) |
| **Migrating from Mainframe to Cloud** | Padrões para serviços financeiros | AWS Prescriptive Guidance |
| **Legacy System Modernization** | Revisão sistemática da literatura | IEEE Xplore (2022-2024) |
| **From COBOL to Kafka** | Migração orientada a eventos em bancos | Confluent Blog / InfoQ |
| **Domain-Driven Design for Core Banking** | DDD aplicado a transformação bancária | ThoughtWorks Tech Radar |
| **Database Refactoring for Legacy Monoliths** | Refatoração de banco de dados | Pramod Sadalage & Scott Ambler |
| **Strangling the Monolith** | Case real de migração bancária | Microsoft Azure Architecture Center |

---

## 🏗️ Stack Moderna e Implementação

| Camada | Tecnologia | Conteúdo Recomendado |
|--------|------------|---------------------|
| **Linguagem** | Java 21 | [Virtual Threads Guide](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html) (Oracle) |
| **Framework** | Spring Boot 3.x | [Spring Cloud para Microsserviços](https://spring.io/projects/spring-cloud) |
| **Mensageria** | Kafka | [Kafka in Banking: Event-Driven Core](https://developer.confluent.io/use-cases/banking/) (Confluent) |
| **Containerização** | Docker + Kubernetes | *Kubernetes in Action* – Marko Lukša (Cap. StatefulSets) |
| **Banco de Dados** | SQL Server / Oracle | *Modernizing Legacy Databases* – O'Reilly |

---

## 🔒 Segurança e Conformidade

| Tópico | Aplicação Bancária | Leitura Essencial |
|--------|-------------------|-------------------|
| **Zero Trust com mTLS** | Aderência ao BACEN/SPB | *Zero Trust Architecture* – NIST SP 800-207 |
| **OAuth2 / OIDC** | Open Banking e APIs seguras | [OAuth 2.0 for Banking APIs](https://openid.net/financial-api/) (OpenID Foundation) |
| **Secure by Design (SSDLC)** | Segurança desde o design da solução | *Building Secure Software* – Viega & McGraw (Cap. 4) |
| **LGPD / BACEN Compliance** | Transformação regulatória em vantagem competitiva | Circular BACEN 3.978/2020 |
| **Security in Cloud-Native Banking** | Segurança e compliance em migração cloud | Google Cloud Architecture Center |
| **OWASP Top 10 para Banking** | Vulnerabilidades críticas em aplicações financeiras | OWASP Foundation |
| **SAMM Framework** | Modelo de maturidade para segurança de software | OWASP SAMM Project |

---

## 🏛️ Arquitetura Empresarial e Governança

| Framework/Método | Aplicação | Referência |
|-----------------|-----------|------------|
| **TOGAF ADM** | Definição da arquitetura alvo (To-Be) e transição | *The TOGAF Standard, Version 9.2* – Cap. ADM |
| **Building Blocks (ABBs/SBBs)** | Capacidades reutilizáveis (Motor de KYC, etc.) | [TOGAF Building Blocks](https://pubs.opengroup.org/architecture/togaf91-doc/arch/chap34.html) |
| **Value Stream Mapping** | Otimização do fluxo de valor do legado | *Value Stream Mapping for Banking* – Karen Martin |
| **OKRs de Transformação** | Engajamento de equipes na modernização | *Measure What Matters* – John Doerr |
| **C4 Model** | Documentação arquitetural para bancos | [C4 Model](https://c4model.com/) + *Financial Services Cases* |

---

## 📜 Artigos Científicos e Teses (Anexados ao Perfil)

| Documento | Autor/Ano | Aplicação |
|-----------|-----------|-----------|
| *Arquitetura segura no desenvolvimento de software: Abordagem à plataforma digital U.OPENLAB* | Domingos Guedes Ferreira (2019) | SSDLC, segurança em plataformas colaborativas, OWASP, PKI, Blockchain |
| *Building Secure Software* | Viega & McGraw | 10 princípios do software seguro |
| *Software Assurance Maturity Model (SAMM)* | OWASP (2017) | Framework para desenvolvimento seguro |

---

## 🗃️ Repositórios Práticos (GitHub)

| Repositório | Descrição | Uso |
|-------------|-----------|-----|
| [ms-conta-pagamento](https://github.com/claudiocostapontes/ms-conta-pagamento) | Case de modernização com Java 21, Spring Boot, DDD | Laboratório prático para aplicar Strangler Fig e ACL |
| aws-samples/banking-legacy-migration | CDC com DMS e Kafka | Exemplos de captura de mudanças |
| ibm/legacy-modernization-patterns | COBOL para Java/Quarkus | Padrões de migração mainframe |
| strangler-fig-implementation | Código com testes de integração | Implementação do padrão Strangler Fig |

---

## 📚 Livros de Referência

| Título | Autor(es) | Foco |
|--------|-----------|------|
| *Modernizing Legacy Systems in Banking* | Chris Richardson (O'Reilly, 2024) | Estratégias específicas para bancos |
| *Building Event-Driven Microservices* | Adam Bellemare (Cap. sistemas financeiros) | Arquitetura orientada a eventos |
| *Continuous Delivery for Mainframe* | Jeff Sussna | Entrega contínua em mainframe |
| *Computer Security: Principles and Practice* | Stallings & Brown (2015) | Modelo CIA, AAA, segurança da informação |

---

## 🎯 Artigos Específicos para Cada Stack

### Angular (v15 → v19)
- *Angular Update Guide* (angular.dev)
- *Modern Angular Build with esbuild/Vite* (Angular.io)
- *Signals Guide* (angular.dev)
- *Juice Shop Upgrade Blog* (GitCode)

### Java (8 → 21)
- *7 Key Lessons from Using Java 21 Virtual Threads in Production* (Cashfree Tech, 2025)
- *Java 21 Migration Guide* (Oracle/OpenJDK)
- *JEP 453 – Structured Concurrency* (OpenJDK)
- *ZGC Documentation* (Oracle)
- *Modernization Guide* (Oracle/OpenJDK)

### Quarkus (JBoss → Quarkus 3)
- *Quarkus Migration Guide 3.0* (GitHub Wiki)
- *Hibernate ORM 6.2 Guide*
- *Quarkus Datasource Configuration*
- *Quarkus Reactive SQL Clients Guide*
- *Union Investment Case Study*

### Git e Branching
- *Trunk-Based Development* (trunkbaseddevelopment.com)
- *GitHub Flow Guide*
- *Feature Toggles* (Martin Fowler)
- *Unleash + Lloyds Case*

### Bancos de Dados (SQL Server / Oracle)
- *Spring Batch - Reference Documentation*
- *Cloud Native Batch Patterns*
- *Debezium Documentation*
- *Kafka in Banking* (Confluent)

---

## ✅ Resumo por Fase de Estudo

| Fase | Duração | Foco Principal | Conteúdos Prioritários |
|------|---------|----------------|----------------------|
| **1. Fundamentos** | 2 semanas | Estratégia de migração | Strangler Fig, ACL, DDD, EDA |
| **2. Stack Moderna** | 3 semanas | Implementação técnica | Java 21, Spring Boot, Kafka, K8s |
| **3. Segurança** | 2 semanas | Compliance e proteção | Zero Trust, OAuth2, OWASP, SSDLC |
| **4. Governança** | 2 semanas | Arquitetura empresarial | TOGAF, Building Blocks, Value Stream |

---

*Documento gerado em: 2026-06-02*
