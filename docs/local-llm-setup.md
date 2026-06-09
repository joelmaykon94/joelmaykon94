# Configuração Local Completa: Autopilot de Código com Qwen Coder + VS Code + Pi Agent

Este documento descreve o processo de configuração *end-to-end* de um copiloto de código 100% local e privado, integrando o **VS Code (via Continue)** e o **Pi Coding Agent** com a família de modelos **Qwen 2.5 Coder** via **llama.cpp** no Ubuntu e Arch Linux.

---

## 🏗️ Visão Geral da Arquitetura de Codificação

Para uma experiência fluida de desenvolvimento (sem latência na escrita e com respostas inteligentes no chat), configuramos **dois servidores locais simultâneos**:

```mermaid
graph TD
    subgraph VS Code (Continue Extension)
        A[Sidebar Chat & Edit] -->|Port 8080| C(llama-server 7B Coder)
        B[Tab Autocomplete] -->|Port 8081| D(llama-server 1.5B Coder)
    end
    subgraph Terminal (Pi Agent)
        E[Pi Coding Agent CLI] -->|Port 8080| C
    end
    C -->|Chat / Engenharia| F[Qwen2.5-Coder-7B GGUF]
    D -->|Preenchimento em Tempo Real| G[Qwen2.5-Coder-1.5B GGUF]
```

1.  **Servidor de Chat (Porta 8080)**: Executa o **Qwen 2.5 Coder 7B**, otimizado para responder dúvidas complexas de engenharia de software, explicar códigos, refatorar e aplicar mudanças.
2.  **Servidor de Autocomplete (Porta 8081)**: Executa o **Qwen 2.5 Coder 1.5B**, um modelo superleve com latência quase nula, responsável por sugerir trechos de código enquanto você digita no VS Code.

---

## 🛠️ Passo 1: Pré-requisitos do Sistema

Instale os compiladores e utilitários de sistema.

### No Ubuntu / Debian
```bash
sudo apt update
sudo apt install -y build-essential cmake git curl jq
```

### No Arch Linux
```bash
sudo pacman -Syu --needed base-devel cmake git curl jq
```

---

## 🤖 Passo 2: Instalação do Pi Agent e Extensão

Instale o Pi Coding Agent CLI globalmente e adicione a extensão do llama.cpp para uso em terminal:

```bash
npm install -g @mariozechner/pi-coding-agent
pi install npm:pi-llama-cpp
```

O arquivo de configurações globais em [~/.pi/agent/settings.json](file:///home/joelmaykon/.pi/agent/settings.json) deve conter a extensão registrada:
```json
{
  "packages": [
    "npm:pi-llama-cpp"
  ]
}
```

---

## 🚀 Passo 3: Compilação do llama.cpp

### Opção A: Apenas CPU (Otimizado com AVX2)
```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release -j$(nproc)
```

### Opção B: Com Aceleração GPU (NVIDIA CUDA)
Melhora a velocidade de geração da CPU dividindo as camadas do modelo 7B para a GPU.
*   **Ubuntu**: `sudo apt install -y nvidia-cuda-toolkit`
*   **Arch Linux**: `sudo pacman -S cuda`
```bash
git clone https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build -DGGML_CUDA=ON
cmake --build build --config Release -j$(nproc)
```
Os executáveis estarão em `llama.cpp/build/bin/`.

---

## 📂 Passo 4: Script de Inicialização para Servidores Duplos

Criamos o script [start-coder-servers.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-coder-servers.sh) para gerenciar a inicialização dos dois modelos simultaneamente:

```bash
#!/bin/bash
# start-coder-servers.sh

BIN_DIR="$HOME/llama.cpp/build/bin" # Ajuste se compilado em outro local
LOG_DIR="$HOME/local-llm/logs"
mkdir -p "$LOG_DIR"

# --- 1. CHAT MODEL (Qwen2.5-Coder-7B-Instruct) ---
CHAT_REPO="unsloth/Qwen2.5-Coder-7B-Instruct-GGUF"
CHAT_FILE="Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf"
CHAT_PORT=8080
CHAT_CONTEXT=8192
CHAT_GPU=0 # Defina >0 (ex: 16) para acelerar usando GPU (NVIDIA CUDA)

# --- 2. AUTOCOMPLETE MODEL (Qwen2.5-Coder-1.5B-Instruct) ---
AUTO_REPO="unsloth/Qwen2.5-Coder-1.5B-Instruct-GGUF"
AUTO_FILE="Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf"
AUTO_PORT=8081
AUTO_CONTEXT=2048
AUTO_GPU=0

echo "=== Iniciando Servidores de Código Local ==="

# Finalizar servidores antigos
pkill -f llama-server
sleep 1

# Iniciar Autocomplete (1.5B)
"$BIN_DIR/llama-server" \
  --hf-repo "$AUTO_REPO" \
  --hf-file "$AUTO_FILE" \
  --host 127.0.0.1 \
  --port $AUTO_PORT \
  -c $AUTO_CONTEXT \
  -ngl $AUTO_GPU \
  --threads $(nproc) > "$LOG_DIR/autocomplete.log" 2>&1 &

# Iniciar Chat / Edição (7B)
"$BIN_DIR/llama-server" \
  --hf-repo "$CHAT_REPO" \
  --hf-file "$CHAT_FILE" \
  --host 127.0.0.1 \
  --port $CHAT_PORT \
  -c $CHAT_CONTEXT \
  -ngl $CHAT_GPU \
  --threads $(nproc) > "$LOG_DIR/chat.log" 2>&1 &

echo "Servidores iniciados em background."
```

Torne o script executável e inicie os servidores:
```bash
chmod +x start-coder-servers.sh
./start-coder-servers.sh
```

---

## 🔌 Passo 5: Configuração no VS Code (Continue Extension)

1.  Abra o VS Code e instale a extensão **Continue** (desenvolvida pela Continue Dev).
2.  Clique no ícone da extensão Continue na barra lateral esquerda.
3.  Clique no ícone de engrenagem no canto inferior direito do painel do Continue para abrir as configurações.
4.  Substitua o conteúdo do arquivo [~/.continue/config.yaml](file:///home/joelmaykon/.continue/config.yaml) pela seguinte configuração local (otimizada com tratamento de FIM e desativação de Tool Calls):

```yaml
name: Local Coding Assistant (Qwen Coder)
version: 1.0.0
schema: v1

models:
  - name: "Qwen2.5-Coder-7B"
    provider: "llama.cpp"
    model: "Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf"
    apiBase: "http://localhost:8080"
    # Instruções de sistema para forçar o modelo local a não retornar JSON de ferramentas (tool calls) no chat
    systemPrompt: >
      You are a helpful software engineering assistant.
      Write code using standard Markdown code blocks.
      You must ALWAYS respond in plain text or markdown.
      NEVER output raw JSON objects, function calls, or tool execution structures like `{"name": "create_new_file"}`.
      If the user asks to write a file or code, output it inside a markdown block.
    roles:
      - chat
      - edit
      - apply

tabAutocompleteModel:
  name: "Qwen2.5-Coder-1.5B"
  provider: "llama.cpp"
  model: "Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf"
  apiBase: "http://localhost:8081"
  # Template FIM (Fill-in-the-Middle) obrigatório para o autocomplete funcionar via llama.cpp
  template: "<|fim_prefix|>{{{prefix}}}<|fim_suffix|>{{{suffix}}}<|fim_middle|>"
```

---

## 🏃 Passo 6: Como Utilizar no VS Code

Após configurar a extensão, você terá as seguintes funcionalidades ativas:

*   **Autocomplete Inline**: Conforme digita seu código, sugestões aparecerão em cinza claro (geradas pelo modelo de 1.5B). Pressione `Tab` para aceitar.
*   **Chat Sidebar (`Ctrl + L` ou `Cmd + L`)**: Abre o chat lateral para você tirar dúvidas sobre engenharia de software, pedir explicações de código ou planejar melhorias (geradas pelo modelo de 7B).
*   **Edição/Refatoração Direta (`Ctrl + I` ou `Cmd + I`)**: Selecione um trecho de código e escreva instruções de refatoração para que o modelo aplique diretamente no arquivo.
