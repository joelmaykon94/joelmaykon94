---
title: "CD com ArgoCD"
sidebar_label: "ArgoCD"
---

# <MdSyncAlt style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> CD com ArgoCD

import { MdSyncAlt, MdDns, MdAutoFixHigh } from 'react-icons/md';

O ArgoCD é uma ferramenta declarativa de entrega contínua para o Kubernetes. Ele monitora o repositório de configuração e garante que o cluster esteja sincronizado.

---

## 🚀 Como Funciona

<div className="doc-step">
  <div className="doc-step-number">1</div>
  <div className="doc-step-content">
    <h3>Conexão com o Repositório</h3>
    <p>O ArgoCD é configurado para observar um repositório Git específico.</p>
  </div>
</div>

<div className="doc-step">
  <div className="doc-step-number">2</div>
  <div className="doc-step-content">
    <h3>Detecção de Mudança</h3>
    <p>Sempre que um manifesto (YAML) é alterado, o ArgoCD detecta o estado <code>OutOfSync</code>.</p>
  </div>
</div>

<div className="doc-step">
  <div className="doc-step-number">3</div>
  <div className="doc-step-content">
    <h3>Sincronização</h3>
    <p>O ArgoCD aplica as mudanças no cluster, retornando ao estado <code>Synced</code>.</p>
  </div>
</div>

---

## <MdDns style={{verticalAlign: 'middle', marginRight: '8px', color: 'var(--color-storm-cloud)'}} /> Exemplo de Aplicação (Application YAML)

```yaml title="argocd-app.yaml"
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/joelmaykon94/infra-config.git'
    targetRevision: HEAD
    path: manifests
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

:::note
 Self-Heal
A política de `selfHeal` garante que qualquer alteração manual feita no cluster seja automaticamente sobrescritas pelo que está no Git.
:::
