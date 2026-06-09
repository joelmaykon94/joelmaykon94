#!/bin/bash
# start-server.sh
# Helper script to run llama.cpp server with Qwen 3.5 model

# Directory where llama.cpp binaries are stored
BIN_DIR="/home/joelmaykon/joelmaykon94/local-llm/llama-b9580"

# Model configuration: We use the 4B model as default for smooth CPU/GPU speed.
# If you want to use the 9B model, comment the 4B configuration and uncomment the 9B one.

# --- 4B Model (Recommended for speed and consumer hardware) ---
HF_REPO="unsloth/Qwen3.5-4B-GGUF"
HF_FILE="Qwen3.5-4B-UD-Q4_K_XL.gguf"

# --- 9B Model (More intelligent, requires more RAM/VRAM) ---
# HF_REPO="unsloth/Qwen3.5-9B-GGUF"
# HF_FILE="Qwen3.5-9B-UD-Q4_K_XL.gguf"

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
