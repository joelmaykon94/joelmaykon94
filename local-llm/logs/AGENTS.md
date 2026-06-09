# Purpose
This directory stores ephemeral log outputs produced by the background `llama-server` instances.

# Ownership
- Owner: joelmaykon

# Local Contracts
- Log files (`*.log`) must not be committed to version control.
- Logs are overwritten or appended to on each startup of the server control scripts.

# Work Guidance
- Monitor [chat.log](file:///home/joelmaykon/joelmaykon94/local-llm/logs/chat.log) and [autocomplete.log](file:///home/joelmaykon/joelmaykon94/local-llm/logs/autocomplete.log) to troubleshoot llama-server operations, model downloads, and CUDA / CPU threads configurations.

# Verification
- Ensure logs are updated with timestamps when running [start-coder-servers.sh](file:///home/joelmaykon/joelmaykon94/local-llm/start-coder-servers.sh).
