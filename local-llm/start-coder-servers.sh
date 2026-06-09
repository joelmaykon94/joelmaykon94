#!/bin/bash
# start-coder-servers.sh
# Start two local llama.cpp servers: one for Chat (7B) and one for Autocomplete (1.5B)

BIN_DIR="/home/joelmaykon/joelmaykon94/local-llm/llama-b9580"
LOG_DIR="/home/joelmaykon/joelmaykon94/local-llm/logs"
mkdir -p "$LOG_DIR"

# --- 1. CHAT MODEL (Qwen2.5-Coder-7B-Instruct) ---
CHAT_REPO="unsloth/Qwen2.5-Coder-7B-Instruct-GGUF"
CHAT_FILE="Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf"
CHAT_PORT=8080
CHAT_CONTEXT=8192
CHAT_GPU=0 # Set to >0 (e.g. 16) if compiled with CUDA for GTX 1650

# --- 2. AUTOCOMPLETE MODEL (Qwen2.5-Coder-1.5B-Instruct) ---
AUTO_REPO="unsloth/Qwen2.5-Coder-1.5B-Instruct-GGUF"
AUTO_FILE="Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf"
AUTO_PORT=8081
AUTO_CONTEXT=2048
AUTO_GPU=0

echo "=== Starting Coding LLM Servers ==="

# Kill any existing llama-server instances first to free ports
echo "Stopping any running llama-servers..."
pkill -f llama-server
sleep 1

# Launch Autocomplete Server (1.5B)
echo "Starting Autocomplete Server on port $AUTO_PORT (Qwen 1.5B)..."
"$BIN_DIR/llama-server" \
  --hf-repo "$AUTO_REPO" \
  --hf-file "$AUTO_FILE" \
  --host 127.0.0.1 \
  --port $AUTO_PORT \
  -c $AUTO_CONTEXT \
  -ngl $AUTO_GPU \
  --threads $(nproc) > "$LOG_DIR/autocomplete.log" 2>&1 &

# Launch Chat Server (7B)
echo "Starting Chat Server on port $CHAT_PORT (Qwen 7B)..."
"$BIN_DIR/llama-server" \
  --hf-repo "$CHAT_REPO" \
  --hf-file "$CHAT_FILE" \
  --host 127.0.0.1 \
  --port $CHAT_PORT \
  -c $CHAT_CONTEXT \
  -ngl $CHAT_GPU \
  --threads $(nproc) > "$LOG_DIR/chat.log" 2>&1 &

echo "Both servers are starting in the background."
echo "- Autocomplete log: $LOG_DIR/autocomplete.log"
echo "- Chat log:         $LOG_DIR/chat.log"
echo "Check the logs to see download and startup progress."
