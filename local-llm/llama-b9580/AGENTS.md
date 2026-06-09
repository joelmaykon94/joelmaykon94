# Purpose
This directory houses precompiled `llama.cpp` binaries and supporting shared libraries utilized by the startup helper scripts.

# Ownership
- Owner: joelmaykon

# Local Contracts
- The binaries and shared libraries must not be modified or built directly inside this folder.
- Maintain executable permissions for all binaries.

# Work Guidance
- Use [llama-server](file:///home/joelmaykon/joelmaykon94/local-llm/llama-b9580/llama-server) as the main server executable.
- The startup scripts [start-coder-servers.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-coder-servers.sh) and [start-server.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-server.sh) depend on the libraries in this directory being present in the library load path or local executable directory.

# Verification
- Run `./llama-server --help` to confirm execution capability and list supported CLI flags.
