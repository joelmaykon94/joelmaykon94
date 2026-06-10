---
title: "概要"
sidebar_label: "概要"
sidebar_position: 1
---

# <MdExplore style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> ワークスペースの概要

import { MdExplore, MdSyncAlt, MdBarChart, MdFolderZip } from 'react-icons/md';

ワークスペースの技術ドキュメントへお越しいただきありがとうございます。このシステムは、プロジェクトで使用される <span className="text-highlight">工程実践 (エンジニアリングプラクティス)</span>、自動化、および監視を一元管理します。

---

## 🚀 ここで見つけられるもの

ドキュメントは、ソフトウェアの拡張性と品質を保証するための基本的な柱に分かれています：

<div className="doc-featured-section">
  <h3><MdSyncAlt style={{verticalAlign: 'middle', marginRight: '8px'}} /> GitOps 実装</h3>
  <p>
    <strong>GitHub Actions</strong> と <strong>ArgoCD</strong> を使用した <strong>CI/CD</strong> パイプラインの詳細。
  </p>
  <a href="/ja/docs/category/implementação-gitops" className="text-highlight">GitOps ドキュメントを見る →</a>
</div>

<div className="doc-featured-section">
  <h3><MdBarChart style={{verticalAlign: 'middle', marginRight: '8px'}} /> 品質と監視</h3>
  <p>
    静的コード分析（SAST）のための <strong>SonarQube</strong> 使用ガイド。
  </p>
  <a href="/ja/docs/category/qualidade--monitoramento" className="text-highlight">監視ドキュメントを見る →</a>
</div>

---

## <MdFolderZip style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> リポジトリマッピング

これらのドキュメントに記載されているすべての実装は、このリポジトリ内で直接見つけることができます。各コードの場所については、以下のガイドを参照してください：

| コンポーネント | 保存場所 | 説明 |
| :--- | :--- | :--- |
| **Java バックエンド** | `@java/atomant-auth/` | Auth に焦点を当てた Spring Boot/Quarkus 微サービス。 |
| **Angular フロントエンド** | `@angular/financial/` | 財務管理のための Web アプリケーション。 |
| **Python スクリプト** | `@python/poetry/` | Poetry を使用した自動化および Python ロジック。 |
| **SonarQube インフラ** | `@devops/sonarqube/` | Docker ファイルおよび品質サーバーの設定。 |
| **CI パイプライン** | `.github/workflows/` | GitHub Actions の自動化定義。 |
| **ポートフォリオ/ドキュメント** | `docs/joel-dev/` | この Docusaurus ポータルのソースコード。 |

---

## 🏗️ 開発の理念

当エコシステムは、**Clean Architecture**、**DDD**、および **Infrastructure as Code** の原則に従って構築されています。開発と運用の間の摩擦を減らすことが目標です。

:::info
直接参照
ファイルエクスプローラーで上記に記載されたフォルダを参照するか、または直接 [GitHub](https://github.com/joelmaykon94/joelmaykon94) で完全なソースコードにアクセスできます。
:::
