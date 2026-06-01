---
title: "Visão Geral"
sidebar_label: "Visão Geral"
sidebar_position: 1
---

# <MdExplore style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Visão Geral do Workspace

import { MdExplore, MdSyncAlt, MdBarChart, MdFolderZip } from 'react-icons/md';

Bem-vindo à documentação técnica do workspace. Este sistema centraliza as <span className="text-highlight">Práticas de Engenharia</span>, automação e monitoramento utilizadas em nossos projetos.

---

## 🚀 O que você encontrará aqui

A documentação está dividida em pilares fundamentais para garantir a escalabilidade e qualidade do software:

<div className="doc-featured-section">
  <h3><MdSyncAlt style={{verticalAlign: 'middle', marginRight: '8px'}} /> Implementação GitOps</h3>
  <p>
    Detalhes sobre nosso pipeline de <strong>CI/CD</strong> utilizando <strong>GitHub Actions</strong> e <strong>ArgoCD</strong>. 
  </p>
  <a href="/docs/category/implementação-gitops" className="text-highlight">Ver documentação de GitOps →</a>
</div>

<div className="doc-featured-section">
  <h3><MdBarChart style={{verticalAlign: 'middle', marginRight: '8px'}} /> Qualidade & Monitoramento</h3>
  <p>
    Guia de uso do <strong>SonarQube</strong> para análise estática de código (SAST). 
  </p>
  <a href="/docs/category/qualidade--monitoramento" className="text-highlight">Ver documentação de Monitoramento →</a>
</div>

---

## <MdFolderZip style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Mapeamento do Repositório

Todas as implementações descritas nestas documentações podem ser encontradas diretamente neste repositório. Abaixo está o guia de onde localizar cada parte do código:

| Componente | Localização | Descrição |
| :--- | :--- | :--- |
| **Backend Java** | `@java/atomant-auth/` | Microserviço em Spring Boot/Quarkus com foco em Auth. |
| **Frontend Angular** | `@angular/financial/` | Aplicação web para gestão financeira. |
| **Scripts Python** | `@python/poetry/` | Automações e lógica em Python utilizando Poetry. |
| **Infra SonarQube** | `@devops/sonarqube/` | Arquivos Docker e configurações do servidor de qualidade. |
| **Pipeline CI** | `.github/workflows/` | Definições de automação do GitHub Actions. |
| **Portfolio/Docs** | `docs/joel-dev/` | Código fonte deste portal Docusaurus. |

---

## 🏗️ Filosofia de Trabalho

Nosso ecossistema é guiado por princípios de **Clean Architecture**, **DDD** e **Infrastructure as Code**. O objetivo é reduzir a fricção entre desenvolvimento e operações.

:::info
Referência Direta
Você pode acessar o código fonte completo navegando pelas pastas listadas acima no seu explorador de arquivos ou diretamente no [GitHub](https://github.com/joelmaykon94/joelmaykon94).
:::
