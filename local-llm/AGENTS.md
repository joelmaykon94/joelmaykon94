# Purpose
This repository manages local Large Language Model (LLM) server environments using compiled `llama.cpp` binaries. It facilitates hosting lightweight model servers (like Qwen 2.5 Coder) for local chat and autocomplete developer tools on CPU/GPU.

# Ownership
- Owner: joelmaykon

# Local Contracts
- Never commit model weights (`.gguf` files) to the git repository.
- Ensure all execution logs remain within the [logs](file:///home/joelmaykon/joelmaykon94/local-llm/logs) directory and are ignored by git.
- Keep helper scripts [start-coder-servers.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-coder-servers.sh) and [start-server.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-server.sh) executable.

# Work Guidance
- Use [start-coder-servers.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-coder-servers.sh) to spin up two servers: autocomplete on port `8081` and chat on port `8080`.
- Use [start-server.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-server.sh) to run a standalone llama-server for general Qwen Coder chat.
- Binaries are hosted in [llama-b9580](file:///home/joelmaykon/joelmaykon94/local-llm/llama-b9580) and should not be modified directly.
- **Context Size Calibration**: If the local model context is too small, increase the context size parameters (`CHAT_CONTEXT` or `-c`) in the startup scripts and align them with the `contextLength` setting in Continue's configuration file.

# Verification
- Run a server script and verify it listens on its configured ports (e.g., `8080` or `8081`).
- Verify that llama-server is running by requesting `/health` (e.g., `curl http://127.0.0.1:8080/health`).

# Child DOX Index
- [llama-b9580/AGENTS.md](file:///home/joelmaykon/joelmaykon94/local-llm/llama-b9580/AGENTS.md): Binaries and shared library runtime dependencies.
- [logs/AGENTS.md](file:///home/joelmaykon/joelmaykon94/local-llm/logs/AGENTS.md): Ephemeral runtime log outputs.
