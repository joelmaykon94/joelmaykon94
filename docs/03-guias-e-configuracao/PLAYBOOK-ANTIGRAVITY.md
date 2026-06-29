
# Guia Completo: Implementação e Otimização do Ecossistema Google Antigravity

Este documento detalha o funcionamento, arquitetura e passos práticos de implementação baseados na análise técnica do ecossistema **Google Antigravity** (substituto oficial do Gemini CLI e Code Assist). 

O Antigravity é focado em velocidade extrema e execução baseada em **agentes autônomos**, funcionando de forma otimizada com o modelo **Gemini 3.5 Flash** (para loops rápidos e baixa latência) e permitindo roteamento para a família Claude Sonnet/Pro para refinamentos complexos.

---

## 1. As Três Interfaces do Antigravity

O ecossistema é dividido em três camadas operacionais distintas. Compreender onde agir evita o desperdício de tokens:

* **a. Antigravity CLI (`agy`):** Agnóstico de IDE. É o terminal de execução direta. É o **único lugar** onde é possível rodar `/usage` para verificar o consumo de cotas em tempo real.
* **b. Antigravity IDE:** Interface integrada baseada em VS Code. O agente possui acesso profundo a saídas do terminal local, realces de texto, logs de erro ativos e comentários em tempo real.
* **c. Antigravity 2.0:** Camada de visualização de alto nível (Command Center). Permite gerenciar múltiplas sessões simultâneas de agentes, alternar entre ambientes e resumir fluxos sem precisar usar comandos de console como `--resume`.

---

## 2. A Engenharia de Agentes do Antigravity

Diferente do Claude Code (onde você frequentemente cria e gerencia sub-agentes manualmente), o Antigravity opera sob o modelo de **Confiança de Objetivo (Goal Trust)**:
1. Você define o objetivo macro.
2. O motor orquestrador decide e dispara o enxame de sub-agentes (*Sub-agent Swarm*) em paralelo em segundo plano.
3. Não há comandos customizados nativos por barra (`/comandos`). Toda automação de fluxo de trabalho é descrita e armazenada em arquivos dentro do diretório `.agents/workflows`.

---

## 3. Arquitetura de Contexto para Projetos (Como Configurar)

Para implementar o Antigravity em qualquer projeto e impedir que o enxame de agentes consuma sua cota lendo arquivos redundantes, você deve estruturar a raiz do projeto com a seguinte hierarquia de prioridades de arquivos Markdown:

### Arquivo 1: `GEMINI.md` (Prioridade Máxima)
Este arquivo substitui instruções globais genéricas e é lido primeiro pelo motor do Gemini. Deve conter as regras críticas do ambiente local.
* **Onde criar:** Na raiz do projeto (`./GEMINI.md`).
* **O que colocar:** Tecnologias exatas utilizadas, regras de segurança, restrições de arquitetura e padrões de codificação de alta performance.

### Arquivo 2: `AGENTS.md` (Instruções de Escopo)
Usado para ditar o comportamento do agente durante a sessão atual.
* **Onde criar:** Na raiz do projeto (`./AGENTS.md`).
* **O que colocar:** Instruções de comportamento. Exemplo: *"Nunca seja prolixo. Não gere explicações textuais em chat se o código puder ser autoexplicativo. Foque em algoritmos assíncronos e limitação de payload."*

### Arquivo 3: `.agents/workflows/` (Automações customizadas)
Onde seus scripts de automação de prompts substituem os antigos comandos customizados.
* **Exemplo:** Um fluxo de `/setup` ou `/deploy` é escrito como um arquivo de workflow em lote que o agente lê para inicializar repositórios ou executar rotinas de teste.

---

## 4. Plano de Ação: Passos para Implementar em Qualquer Projeto

Siga estes passos exatos no seu terminal do VS Code para configurar o ecossistema de forma ultra-eficiente:

### Passo 1: Instalação e Inicialização do Daemon
Instale a CLI oficial e ative o motor de orquestração local:
```bash
# Instalar a CLI do Antigravity
curl -fsSL [https://antigravity.google/cli/install.sh](https://antigravity.google/cli/install.sh) | bash

# Inicializar o escopo do projeto (Cria a estrutura .agents/)
antigravity init

# Iniciar o daemon de comunicação em segundo plano
antigravity start --daemon

```

### Passo 2: Configuração de Regras com "Activation Mode"

O Antigravity possui um menu suspenso chamado **Activation Mode** para as regras. Em vez de injetar todas as diretivas de uma vez (o que estoura o contexto), configure suas regras para ativação seletiva:

1. Crie arquivos de regras especializados (ex: `security-rules.md`, `database-rules.md`) dentro de `.agents/`.
2. No painel do Antigravity IDE, associe cada regra ao seu escopo correspondente (ative as regras de banco apenas quando estiver mexendo na camada de dados).

### Passo 3: Roteamento Inteligente de Modelos (Mitigando Limites de Token)

O Antigravity consome tokens de forma agressiva devido ao paralelismo de agentes. Adote a estratégia de incremento reduzido:

1. **Fase de Inicialização e Boilerplate:** Use o **Gemini 3.5 Flash** (ele é co-otimizado para o Antigravity e executa a velocidade máxima).
2. **Execução de Prompt Direto:** Envie comandos claros com critérios de aceitação estritos e limite o retorno do console, por exemplo:
```bash
# Evite passar logs gigantes inteiros. Use filtros para reduzir tokens de entrada.
tail -n 30 server.log | agy ask --model="3.5-flash-medium" "Conserte esta stack trace específica:"

```


3. **Fase de Estabilização e Debug Complexo:** Se o código gerado pelo Flash quebrar logicamente, alterne o motor da sessão para o **Claude Sonnet** ou **Gemini 3.1 Pro (Low)** apenas para corrigir a consistência lógica da estrutura de arquivos.

---

## 5. Recurso Avançado: O Agente "Jules" (*Dispatch and Walk Away*)

Para projetos hospedados no GitHub, você pode terceirizar tarefas pesadas sem gastar os tokens da sua máquina local usando o **Jules Agent** (incluído no ecossistema):

1. Conecte o repositório do seu projeto ao painel do Jules.
2. Escreva uma tarefa complexa de refatoração ou correção de bug.
3. Despache a tarefa, feche o notebook e saia de perto.
4. O Jules usará modelos de raciocínio profundo (como Gemini Pro) em nuvem para resolver o problema de ponta a ponta e submeterá um **Pull Request (PR)** formatado de forma totalmente autônoma.

---

*Manual desenvolvido para otimização de performance computacional e economia inteligente de tokens de IA.*
