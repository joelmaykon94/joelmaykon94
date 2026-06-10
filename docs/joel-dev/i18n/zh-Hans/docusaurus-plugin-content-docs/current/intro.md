---
title: "概述"
sidebar_label: "概述"
sidebar_position: 1
---

# <MdExplore style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> 工作区概述

import { MdExplore, MdSyncAlt, MdBarChart, MdFolderZip } from 'react-icons/md';

欢迎来到工作区的技术文档。该系统集中了我们项目中使用的 <span className="text-highlight">工程实践</span>、自动化和监控。

---

## 🚀 你在这里能找到什么

文档分为几个基本支柱，以确保软件的可扩展性和质量：

<div className="doc-featured-section">
  <h3><MdSyncAlt style={{verticalAlign: 'middle', marginRight: '8px'}} /> GitOps 实现</h3>
  <p>
    关于我们使用 <strong>GitHub Actions</strong> 和 <strong>ArgoCD</strong> 的 <strong>CI/CD</strong> 流水线的详细信息。
  </p>
  <a href="/zh-Hans/docs/category/implementação-gitops" className="text-highlight">查看 GitOps 文档 →</a>
</div>

<div className="doc-featured-section">
  <h3><MdBarChart style={{verticalAlign: 'middle', marginRight: '8px'}} /> 质量与监控</h3>
  <p>
    关于使用 <strong>SonarQube</strong> 进行静态代码分析（SAST）的指南。
  </p>
  <a href="/zh-Hans/docs/category/qualidade--monitoramento" className="text-highlight">查看监控文档 →</a>
</div>

---

## <MdFolderZip style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> 仓库映射

本篇文档中所描述的所有实现都可以直接在此仓库中找到。以下是定位各部分代码的指南：

| 组件 | 位置 | 描述 |
| :--- | :--- | :--- |
| **Java 后端** | `@java/atomant-auth/` | 专注于 Auth 的 Spring Boot/Quarkus 微服务。 |
| **Angular 前端** | `@angular/financial/` | 用于财务管理的 Web 应用程序。 |
| **Python 脚本** | `@python/poetry/` | 使用 Poetry 的自动化和 Python 逻辑。 |
| **SonarQube 基础设施** | `@devops/sonarqube/` | Docker 文件和质量服务器配置。 |
| **CI 流水线** | `.github/workflows/` | GitHub Actions 自动化定义。 |
| **项目集/文档** | `docs/joel-dev/` | 此 Docusaurus 门户的源代码。 |

---

## 🏗️ 工作哲学

我们的生态系统遵循 **Clean Architecture**、**DDD** 和 **Infrastructure as Code** 原则。目标是减少开发和运维之间的摩擦。

:::info
直接参考
您可以通过在文件资源管理器中导航上述列出的文件夹，或直接在 [GitHub](https://github.com/joelmaykon94/joelmaykon94) 上访问完整的源代码。
:::
