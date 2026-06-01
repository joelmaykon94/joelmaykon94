---
title: "Overview"
sidebar_label: "Overview"
sidebar_position: 1
---

# <MdExplore style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Workspace Overview

import { MdExplore, MdSyncAlt, MdBarChart, MdFolderZip } from 'react-icons/md';

Welcome to the workspace's technical documentation. This system centralizes the <span className="text-highlight">Engineering Practices</span>, automation, and monitoring used in our projects.

---

## 🚀 What you will find here

The documentation is divided into fundamental pillars to ensure software scalability and quality:

<div className="doc-featured-section">
  <h3><MdSyncAlt style={{verticalAlign: 'middle', marginRight: '8px'}} /> GitOps Implementation</h3>
  <p>
    Details about our <strong>CI/CD</strong> pipeline using <strong>GitHub Actions</strong> and <strong>ArgoCD</strong>. 
  </p>
  <a href="/docs/category/implementação-gitops" className="text-highlight">View GitOps documentation →</a>
</div>

<div className="doc-featured-section">
  <h3><MdBarChart style={{verticalAlign: 'middle', marginRight: '8px'}} /> Quality & Monitoring</h3>
  <p>
    Guide on using <strong>SonarQube</strong> for static code analysis (SAST). 
  </p>
  <a href="/docs/category/qualidade--monitoramento" className="text-highlight">View Monitoring documentation →</a>
</div>

---

## <MdFolderZip style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Repository Mapping

All implementations described in these documents can be found directly in this repository. Below is the guide to locating each part of the code:

| Component | Location | Description |
| :--- | :--- | :--- |
| **Java Backend** | `@java/atomant-auth/` | Spring Boot/Quarkus microservice focused on Auth. |
| **Angular Frontend** | `@angular/financial/` | Web application for financial management. |
| **Python Scripts** | `@python/poetry/` | Automations and Python logic using Poetry. |
| **SonarQube Infra** | `@devops/sonarqube/` | Docker files and quality server configurations. |
| **CI Pipeline** | `.github/workflows/` | GitHub Actions automation definitions. |
| **Portfolio/Docs** | `docs/joel-dev/` | Source code of this Docusaurus portal. |

---

## 🏗️ Work Philosophy

Our ecosystem is guided by principles of **Clean Architecture**, **DDD**, and **Infrastructure as Code**. The goal is to reduce friction between development and operations.

:::info
Direct Reference
You can access the full source code by navigating the folders listed above in your file explorer or directly on [GitHub](https://github.com/joelmaykon94/joelmaykon94).
:::
