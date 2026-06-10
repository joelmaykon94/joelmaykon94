<div align="center">
  <!-- Header Wave Render - Dracula Theme -->
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=282a36&height=120&section=header&text=JOEL%20MAYKON&fontSize=50&fontColor=bd93f9"/>

  <!-- Background Banner -->
  <img src="docs/files/background.png" width="100%" alt="Background Banner" />

  <br/>

  <!-- Typing SVG - Dark Purple -->
  [![Typing SVG](https://readme-typing-svg.herokuapp.com/?color=4c1d95&size=35&center=true&vCenter=true&width=1000&lines=SPECIALIST+SOFTWARE+ENGINEER;JAVA+|+GO+|+ANGULAR;CLARITY+OVER+COMPLEXITY;LESS+IS+MORE)](https://git.io/typing-svg)

  <!-- Core Badges - Dracula & Dark Purple Style -->
  <img src="https://img.shields.io/badge/EXPERIÊNCIA-Desde%202018-4c1d95?style=for-the-badge&labelColor=282a36&logo=clock&logoColor=bd93f9" />
  <img src="https://img.shields.io/badge/SENIORIDADE-Especialista-9d174d?style=for-the-badge&labelColor=282a36&logo=trending-up&logoColor=bd93f9" />
  <img src="https://img.shields.io/badge/FOCO-Performance-4c1d95?style=for-the-badge&labelColor=282a36&logo=cpu&logoColor=bd93f9" />
  
  <br/>
  
  <!-- Contador de Visitantes -->
  <img src="https://komarev.com/normal-badge/?username=joelmaykon94&color=9d174d&label=VISITANTES&style=for-the-badge&labelColor=282a36" />
 
</div>


---

## 👨‍💻 Sobre mim

Engenheiro de Software com **experiência consolidada desde 2018**. Minha filosofia de desenvolvimento é pautada na **simplicidade e eficiência**. Acredito que complexidade não é sinônimo de evolução e que, muitas vezes, "menos é mais".

---

## 🏗️ Arquitetura do Workspace & Fluxo do Sistema

Abaixo está o diagrama visual da comunicação dos serviços deste repositório e o detalhamento interativo de cada subprojeto:

```mermaid
flowchart TD
    %% Estilização do Diagrama
    classDef default fill:#111,stroke:#333,stroke-width:1px,color:#eee;
    classDef highlight fill:#222,stroke:#fff,stroke-width:2px,color:#fff;
    classDef infra fill:#050505,stroke:#222,stroke-width:1px,color:#888;
    
    %% Definição dos Nós
    A["📊 Web Dashboard<br/>(Angular 19 + Glassmorphism)"]:::highlight
    B["🔐 Autenticação & Identity<br/>(Java 21 + Keycloak Auth)"]:::default
    C["💰 Contabilidade & Ledger Core<br/>(Java 21 + Spring/Quarkus)"]:::default
    D["📝 Auditoria & Consolidação<br/>(Java 21 + Audit Log)"]:::default
    E["⚙️ DevOps Pipeline<br/>(CI/CD + SonarQube Quality)"]:::infra
    F["🧠 IA Local<br/>(llama-server + Qwen 2.5)"]:::highlight

    %% Comunicação entre componentes
    A ==>|Acesso & Token JWT| B
    A ==>|APIs de Finanças / PIX| C
    C -->|Relatórios & Logs| D
    B -.->|Segurança federada| C
    E -.->|Validação de Código| B
    E -.->|Validação de Código| C
    F -.->|Refatoração & Sugestões| B
    F -.->|Refatoração & Sugestões| C
    F -.->|Refatoração & Sugestões| D
```

<br/>

### 📁 Estrutura de Diretórios Interativa

Clique em cada seção abaixo para expandir e explorar a função e stack de cada componente deste repositório:

<details>
  <summary><b>☕ java/ (Microsserviços Backend - Java 21)</b></summary>
  <br/>
  <blockquote>
    <table>
      <thead>
        <tr>
          <th>Componente</th>
          <th>Diretório Local</th>
          <th>Propósito & Tecnologias</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>💰 <b>Financial Core</b></td>
          <td><a href="./java/atomant-financial-core"><code>java/atomant-financial-core</code></a></td>
          <td>Motor contábil e ledger financeiro distribuído de alta transacionalidade. Desenvolvido em Java 21 com foco em performance de banco.</td>
        </tr>
        <tr>
          <td>🔐 <b>Auth Service</b></td>
          <td><a href="./java/atomant-auth"><code>java/atomant-auth</code></a></td>
          <td>Microsserviço de gestão de tokens e integração com servidores de autenticação Keycloak.</td>
        </tr>
        <tr>
          <td>📝 <b>Audit Logger</b></td>
          <td><a href="./java/atomant-audit"><code>java/atomant-audit</code></a></td>
          <td>Processamento assíncrono e auditoria de eventos, transações e registros de sistema.</td>
        </tr>
      </tbody>
    </table>
  </blockquote>
</details>

<details>
  <summary><b>🅰️ angular/ (Aplicações Web Frontend - Angular 19)</b></summary>
  <br/>
  <blockquote>
    <table>
      <thead>
        <tr>
          <th>Aplicação</th>
          <th>Diretório Local</th>
          <th>Propósito & Tecnologias</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>📊 <b>Financial Dashboard</b></td>
          <td><a href="./angular/financial"><code>angular/financial</code></a></td>
          <td>Painel web para gestão de contas e balanços. Utiliza Angular 19, Tailwind CSS e design system Glassmorphism de tons preto e prata.</td>
        </tr>
      </tbody>
    </table>
  </blockquote>
</details>

<details>
  <summary><b>🤖 local-llm/ (Iniciadores de Modelos de IA Offline)</b></summary>
  <br/>
  <blockquote>
    <table>
      <thead>
        <tr>
          <th>Recurso</th>
          <th>Diretório Local</th>
          <th>Propósito & Tecnologias</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>🧠 <b>LLM Coder Host</b></td>
          <td><a href="./local-llm"><code>local-llm/</code></a></td>
          <td>Setup para rodar servidores locais do <code>Qwen 2.5 Coder</code> (1.5B/7B) via <code>llama.cpp</code> na CPU/GPU do próprio computador, integrando com extensões como o Continue.</td>
        </tr>
      </tbody>
    </table>
  </blockquote>
</details>

<br/>

---

## 🛠️ Tech Stack (Specialist Focus)

| Categoria | Tecnologias Chave |
|-----------|------------------|
| **BACKEND** | <img src="https://img.shields.io/badge/Java%208-ED8B00?style=flat-square&logo=openjdk&logoColor=white" alt="Java 8" /> <img src="https://img.shields.io/badge/Java%2017-ED8B00?style=flat-square&logo=openjdk&logoColor=white" alt="Java 17" /> <img src="https://img.shields.io/badge/Java%2021-ED8B00?style=flat-square&logo=openjdk&logoColor=white" alt="Java 21" /> ![Quarkus](https://img.shields.io/badge/Quarkus-4643CC?style=flat-square&logo=quarkus&logoColor=white) ![Spring Batch](https://img.shields.io/badge/Spring_Batch-6DB33F?style=flat-square&logo=spring&logoColor=white) |
| **FRONTEND** | <a href="https://v19.angular.dev/installation" target="_blank"> <img src="https://img.shields.io/badge/Angular%2019-DD0031?style=flat-square&logo=angular&logoColor=white" alt="Angular 19" /></a> |
| **ARQUITETURA** | <img src="https://img.shields.io/badge/Clean_Architecture-1c1c1e?style=flat-square&logo=architecture&logoColor=ffffff" alt="Clean Architecture" /> |
| **DEVOPS** | <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" /> <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white" />  ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) |
| **BANCOS DE DADOS** | <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" /> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" /> |

---

## 💼 Experiência Profissional Recente

### 🏦 EngeSoftware (Prestador CEF - Caixa Econômica Federal)
**Analista Senior Plataforma Baixa** (05/2026 – Atual)
* **Modernização do Core Ledger Bancário**: Arquitetura e desenvolvimento de motores contábeis distribuídos de alto desempenho (*Double-Entry Ledger Engine* & *Investment Core*) com concorrência otimizada e consistência eventual em Java 21, Quarkus e Spring Boot.
* **Processamento Batch de Larga Escala**: Otimização de pipelines para processamento em lote (*Batch File Processor*) e ingestão assíncrona de arquivos de dados financeiros e conciliações.
* **Autenticação & Federação Segura**: Integração com Keycloak para autenticação segura corporativa e gerenciamento federado de sessões bancárias (*Auth Keycloak Module*).
* **Auditoria de Transações**: Implementação de barramento centralizado de auditoria (*Audit Logging & Aggregator*) para rastreamento de eventos em conformidade com as normas regulatórias do BACEN e políticas de conformidade.
* **Painel Financeiro Admin**: Desenvolvimento de interfaces responsivas e de alta performance com Angular 19 e Tailwind CSS.

### 🏛️ Prefeitura de Parnamirim/RN
**Assessor Especial / Tech Lead** (05/2025 – 12/2025)
* Liderança técnica na modernização de sistemas governamentais utilizando Quarkus, Angular 19 e orquestração em Kubernetes com ArgoCD.

### 🤖 Mutant (Vivo Aura)
**Engenheiro de IA Conversacional** (09/2023 – 07/2024)
* Evolução de RAG pipelines e engenharia de prompts com LangChain e Python para o assistente Vivo Aura, atendendo mais de 15M de interações mensais.

---

## 📊 Estatísticas e Métricas do GitHub

<div align="center">
  <!-- Estatísticas Gerais do GitHub -->
  <img src="https://github-readme-stats.vercel.app/api?username=joelmaykon94&show_icons=true&theme=dracula&hide_border=true" />
</div>

<br/>

<div align="center">
  <!-- Gráfico de Atividade de Commits -->
  <img width="100%" src="https://github-readme-activity-graph.vercel.app/graph?username=joelmaykon94&theme=dracula&hide_border=true" />
</div>

<br/>

<div align="center">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td width="49%" valign="top">
        <!-- Linguagens Mais Utilizadas -->
        <img width="100%" src="https://github-readme-stats.vercel.app/api/top-langs/?username=joelmaykon94&layout=compact&theme=dracula&hide_border=true" />
        <br/><br/>
        <!-- Streak de Contribuições (Consistência) -->
        <img width="100%" src="https://github-readme-streak-stats.herokuapp.com/?user=joelmaykon94&theme=dracula&hide_border=true" />
      </td>
      <td width="2%">&nbsp;</td>
      <td width="49%" valign="middle" align="center">
        <!-- Troféus de Conquistas (Dracula Style) -->
        <img width="100%" src="https://github-profile-trophy-fork-two.vercel.app/?username=joelmaykon94&theme=dracula&no-bg=true&no-frame=true&column=3&margin-w=15&margin-h=15" />
      </td>
    </tr>
  </table>
</div>

---

<div align="center">
  <p><i>"A complexidade é um sinal de que você não entendeu o problema. A simplicidade é a sofisticação máxima."</i></p>
</div>

---
 
## 🔗 Vamos nos conectar?

<div align="center"> 
  <a href="https://www.linkedin.com/in/joelmaykon/" target="_blank"><img src="https://img.shields.io/badge/-LinkedIn-282a36?style=for-the-badge&logo=linkedin&logoColor=bd93f9" style="border: 1px solid #bd93f9; border-radius: 10px"></a> 
  <a href="https://github.com/joelmaykon94" target="_blank"><img src="https://img.shields.io/badge/-GitHub-282a36?style=for-the-badge&logo=github&logoColor=bd93f9" style="border: 1px solid #bd93f9; border-radius: 10px"></a>
</div>

<div align="center">
  <!-- Footer Wave Render - Dracula Theme -->
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=282a36&height=120&section=footer&fontColor=bd93f9"/>
</div>
