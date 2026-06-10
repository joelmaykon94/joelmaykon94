#!/bin/bash
# start-server.sh
# Helper script to run llama.cpp server with Qwen Coder model

# Directory where llama.cpp binaries are stored
BIN_DIR="/home/joelmaykon/joelmaykon94/local-llm/llama-b9580"

# Model configuration: We use the Qwen 2.5 Coder 7B model as default.
# You can uncomment another size (1.5B or 14B/32B if your machine supports it).

# --- 7B Model (Recommended default for coding assistant tasks) ---
#HF_REPO="unsloth/Qwen2.5-Coder-7B-Instruct-GGUF"
#HF_FILE="Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf"

# --- 1.5B Model (Extremely fast, low resource usage) ---
HF_REPO="unsloth/Qwen2.5-Coder-1.5B-Instruct-GGUF"
HF_FILE="Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf"

# --- 14B Model (More intelligent coding, needs ~10GB VRAM/RAM) ---
# HF_REPO="unsloth/Qwen2.5-Coder-14B-Instruct-GGUF"
# HF_FILE="Qwen2.5-Coder-14B-Instruct-Q4_K_M.gguf"

echo "Starting llama-server..."
echo "Hugging Face Repo: $HF_REPO"
echo "Model File:        $HF_FILE"
echo "Port:              8080"
echo "Context Size:      8192"

# Start llama-server
# Note: It will automatically download the model from Hugging Face if not already cached.
# Default cache directory: ~/.cache/huggingface/hub
"$BIN_DIR/llama-server" \
  --hf-repo "$HF_REPO" \
  --hf-file "$HF_FILE" \
  --host 127.0.0.1 \
  --port 8080 \
  -c 8192 \
  --threads $(nproc)
