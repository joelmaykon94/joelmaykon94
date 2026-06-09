# 📋 Fase 5: Planejamento e Kanban (Kanban)

Este arquivo serve como template para planejar e acompanhar o progresso das tarefas de engenharia e desenvolvimento utilizando a sintaxe nativa de Kanban do Mermaid (v11.4.0+).

---

## 🚦 1. Definição de Pronto (Definition of Done - DoD)

Para que uma tarefa seja considerada "Concluída" (Done), ela deve cumprir os seguintes critérios:
1. [ ] Código escrito, limpo e testado.
2. [ ] Testes automatizados passando sem quebras de regressão.
3. [ ] Linter Ruff executado com sucesso e sem avisos de tipagem estrita.
4. [ ] Revisão de código efetuada ou homologada com IA.
5. [ ] Documentação de API ou README atualizados se aplicável.

---

## 🗂️ 2. Quadro Kanban Visual (Mermaid Kanban)

O diagrama abaixo representa as tarefas necessárias para a implantação do MVP estruturadas nas fases típicas de desenvolvimento.

```mermaid
---
config:
  kanban:
    ticketBaseUrl: 'https://github.com/joelmaykon94/joelmaykon94/issues/#TICKET#'
---
kanban
  todo[A Fazer]
    task1[Configurar dependencias do Poetry] @{assigned: "Joel", ticket: "1", priority: "High"}
    task2[Implementar autenticacao JWT] @{assigned: "Joel", ticket: "2", priority: "Very High"}
    task3[Escrever testes unitarios de modelo] @{assigned: "IA-Agent", ticket: "3", priority: "Low"}
  in_progress[Em Progresso]
    task4[Modelagem das tabelas do banco] @{assigned: "Joel", ticket: "4", priority: "High"}
  review[Revisao de Codigo]
    task5[Validacao das rotas CRUD] @{assigned: "IA-Agent", ticket: "5", priority: "Medium"}
  done[Concluido]
    task6[Definicao da proposta de valor e UVP] @{assigned: "Joel", ticket: "6", priority: "High"}
```

---

## 🛠️ 3. Backlog de Tarefas Detalhado

### 3.1 Infraestrutura e Setup
- **[Task-001]** Instalar pacotes de type-checking (`mypy`, `pyright`).
- **[Task-002]** Configurar arquivo `.mise.toml` ou `.env` para segurança local.

### 3.2 Feature Set A (Core)
- **[Task-003]** Desenvolver endpoints de CRUD de tarefas em `python/poetry`.
- **[Task-004]** Acoplar conexões do ORM SQLAlchemy.

---

> [!TIP]
> **Como interagir com a IA nesta fase:**
> Peça para a IA:
> *"Com base no quadro Kanban e nas tarefas listadas em 5-kanban.md, me dê uma sugestão de quebra de sub-tarefas técnicas para a implementação da Task-002 (Autenticação JWT) e monte o comando Git Branch correspondente seguindo o padrão de nomenclatura `feature/issue-<numero>`."*
