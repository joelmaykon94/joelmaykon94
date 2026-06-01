---
title: "Conceitos de GitOps"
sidebar_label: "Conceitos"
---

# <MdPsychology style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Conceitos de GitOps

import { MdPsychology, MdHistory, MdGavel } from 'react-icons/md';

<div className="flex-row margin-bottom--lg">
  <span className="badge-linear badge-linear--success">Princípio: Fonte da Verdade</span>
  <span className="badge-linear badge-linear--warning">Estado: Declarativo</span>
</div>

O GitOps é um modelo operacional para aplicações nativas de nuvem que utiliza o Git como a "única fonte da verdade" para a infraestrutura e a configuração de aplicações.

---

## 💎 Os Quatro Princípios

Para que um sistema seja considerado GitOps, ele deve seguir estas diretrizes:

1.  **Declarativo:** O sistema deve ter seu estado descrito de forma declarativa (ex: Manifestos Kubernetes).
2.  **Versionado e Imutável:** O estado desejado é armazenado em um repositório Git, mantendo o histórico completo.
3.  **Pull Automático:** O sistema observa as mudanças no Git e as aplica automaticamente (ArgoCD).
4.  **Reconciliação:** O software monitora continuamente o estado atual e o corrige se houver divergência.

---

## <MdGavel style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Separação de Repositórios

Uma prática recomendada é separar o repositório de **Código Fonte** do repositório de **Configuração de Infraestrutura**.

<div className="doc-featured-section">
  - **Repositório de App:** Contém o código (Java/Node/Python) e os fluxos do GitHub Actions.
  - **Repositório de Infra:** Contém manifestos K8s, Helm Charts ou arquivos Kustomize.
</div>

:::info 
Benefício
Isso evita que builds infinitos ocorram quando o pipeline de CI atualiza a versão da imagem no manifesto de infra.
:::
