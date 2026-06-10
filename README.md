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

| Período | Cargo / Empresa | Impacto Principal |
|---------|----------------|-------------------|
| 05/2026 – Atual | Analista Senior Plataforma Baixa – EngeSoftware (CEF - Bank Federal) | Modernização Java & Angular. |
| 05/2025 – 12/2025 | Assessor Especial – Pref. de Parnamirim/RN | Modernização Java, Angular & Quarkus via K8s e GitOps. |
| 09/2023 – 07/2024 | Eng. de IA Conversacional – Mutant (Vivo) | Fluxos LLM para milhões de usuários. |

---

## 📊 Estatísticas e Métricas do GitHub

<div align="center">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td width="50%" align="center">
        <!-- Estatísticas Gerais do GitHub -->
        <img src="https://github-readme-stats.vercel.app/api?username=joelmaykon94&show_icons=true&theme=dracula&hide_border=true" />
      </td>
      <td width="50%" align="center">
        <!-- Linguagens Mais Utilizadas -->
        <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=joelmaykon94&layout=compact&theme=dracula&hide_border=true" />
      </td>
    </tr>
  </table>
</div>

<br/>

<div align="center">
  <!-- Gráfico de Atividade de Commits -->
  <img width="100%" src="https://github-readme-activity-graph.vercel.app/graph?username=joelmaykon94&theme=dracula&hide_border=true" />
</div>

<div align="center" style="display: flex; justify-content: space-between; gap: 2%;">
  <!-- Streak de Contribuições (Consistência) -->
  <img width="49%" src="https://github-readme-streak-stats.herokuapp.com/?user=joelmaykon94&theme=dracula&hide_border=true" />
  
  <!-- Troféus de Conquistas (Dracula Style) -->
  <img width="49%" src="https://github-profile-trophy-fork-two.vercel.app/?username=joelmaykon94&theme=dracula&no-bg=true&no-frame=true&column=3&margin-w=15&margin-h=15" />
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
