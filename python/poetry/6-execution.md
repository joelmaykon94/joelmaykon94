# 🚀 Fase 6: Execução e Desenvolvimento (Execution)

Este arquivo serve como template para guiar o desenvolvimento do código-fonte, estruturar o diretório do projeto, organizar as dependências do Poetry, e documentar os diagramas de sequência dos fluxos de runtime.

---

## 📂 1. Estrutura Recomendada do Projeto

Abaixo está o layout padrão para projetos Python estruturados com Poetry:

```
python/poetry/
├── pyproject.toml         # Gerenciamento de dependências (Poetry)
├── README.md              # Documentação geral de execução
├── poetry.lock            # Lockfile das dependências instaladas
├── app/
│   ├── __init__.py
│   ├── main.py            # Ponto de entrada da aplicação
│   ├── config.py          # Configurações de ambiente (.env)
│   ├── database.py        # Conexão com banco de dados e ORM
│   ├── models/            # Modelos do banco de dados (SQLAlchemy)
│   ├── schemas/           # Validação de dados (Pydantic)
│   └── routes/            # Rotas e controladores da API
└── tests/                 # Pasta de testes automatizados (pytest)
```

---

## 🏗️ 2. Arquitetura Físico-Lógica (Block Diagram)

A estrutura de comunicação física dos componentes durante a execução da aplicação:

```mermaid
block-beta
  columns 3
  Client["Navegador / Cliente"]
  space
  API["FastAPI / Backend Python"]
  
  block:infra:2
    columns 2
    Database[("PostgreSQL")]
    Cache[("Redis Cache")]
  end
  
  AI["Serviço de IA (OpenAI / Gemini)"]

  Client --> API
  API --> Database
  API --> Cache
  API --> AI
```

---

## 🔄 3. Fluxo de Runtime da Aplicação (Sequence Diagram)

O diagrama abaixo representa a sequência de operações quando o usuário realiza uma requisição de listagem de tarefas protegida por autenticação.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Usuário / Client
    participant API as FastAPI App
    participant DB as Banco PostgreSQL
    participant Cache as Redis Cache

    Cliente->>API: GET /api/v1/tasks (Com Header Authorization)
    activate API
    API->>API: Validar Token JWT
    
    API->>Cache: Verificar se as tarefas estão em cache
    activate Cache
    Cache-->>API: Cache hit (Retorna tarefas)
    deactivate Cache
    
    alt Cache Miss
        API->>DB: Buscar tarefas do usuário no Banco
        activate DB
        DB-->>API: Retorna dados das tarefas
        deactivate DB
        API->>Cache: Salvar tarefas no Cache (Expira em 5 min)
    end

    API-->>Cliente: 200 OK (Lista de tarefas em JSON)
    deactivate API
```

---

## 📜 4. Diretrizes de Codificação (Code Rules)
1. **Tipagem Estrita:** Use anotações de tipo em todas as funções e retornos.
2. **Tratamento de Exceções:** Nunca use blocos `try-except` vazios. Sempre logue os erros com a biblioteca padrão ou com o `loguru`.
3. **Migrações:** Toda alteração de modelo de dados deve possuir sua migração criada pelo `alembic`.

---

> [!TIP]
> **Como interagir com a IA nesta fase:**
> Peça para a IA:
> *"Com base no fluxo de execução mapeado em 6-execution.md, crie a rota GET `/api/v1/tasks` com FastAPI. Implemente a lógica de cache usando Redis, seguindo a lógica do diagrama de sequência."*
