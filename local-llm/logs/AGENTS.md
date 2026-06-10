# Purpose
This directory stores ephemeral log outputs produced by the background `llama-server` instances.

# Ownership
- Owner: joelmaykon

# Local Contracts
- Log files (`*.log`) must not be committed to version control.
- Logs are overwritten or appended to on each startup of the server control scripts.

# Work Guidance
- Monitor [chat.log](/local-llm/logs/chat.log) and [autocomplete.log](/local-llm/logs/autocomplete.log) to troubleshoot llama-server operations, model downloads, and CUDA / CPU threads configurations.

# Verification
- Ensure logs are updated with timestamps when running [start-coder-servers.sh](/local-llm/start-coder-servers.sh).
