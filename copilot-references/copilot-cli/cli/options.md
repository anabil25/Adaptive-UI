# Command-Line Options

> Source section: [Command-line options](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#command-line-options)

Use this for startup flags, prompt-mode flags, remote-session flags, permissions, model selection, output behavior, and scripting controls.

---

## Options

| Option | Description |
|--------|-------------|
| `--add-dir=PATH` | Add a directory to the allowed list for file access. Repeatable. |
| `--add-github-mcp-tool=TOOL` | Add a tool to enable for the GitHub MCP server. Repeatable. Use `*` for all tools. |
| `--add-github-mcp-toolset=TOOLSET` | Add a toolset to enable for the GitHub MCP server. Repeatable. Use `all` for all toolsets. |
| `--additional-mcp-config=JSON` | Add an MCP server for this session only. Accepts JSON string or file path prefixed with `@`. |
| `--agent=AGENT` | Specify a custom agent to use. |
| `--allow-all` | Enable all permissions. Equivalent to `--allow-all-tools --allow-all-paths --allow-all-urls`. |
| `--allow-all-paths` | Disable file path verification and allow access to any path. |
| `--allow-all-tools` | Allow all tools to run automatically without confirmation. Required for programmatic use (env: `COPILOT_ALLOW_ALL`). |
| `--allow-all-urls` | Allow access to all URLs without confirmation. |
| `--allow-tool=TOOL ...` | Tools the CLI has permission to use. For multiple tools, use a quoted comma-separated list. |
| `--allow-url=URL ...` | Allow access to specific URLs or domains. For multiple URLs, use a quoted comma-separated list. |
| `--autopilot` | Enable autopilot continuation in prompt mode. |
| `--available-tools=TOOL ...` | Only these tools will be available to the model. |
| `--banner`, `--no-banner` | Show or hide the startup banner. |
| `--bash-env` | Enable BASH_ENV support for bash shells. |
| `--connect[=SESSION-ID]` | Connect directly to a remote session or task. Conflicts with `--resume` and `--continue`. |
| `--config-dir=DIRECTORY` | Deprecated. Use `COPILOT_HOME` instead. |
| `--continue` | Resume the most recent session in the current working directory, falling back to the globally most recent session. |
| `--deny-tool=TOOL ...` | Tools the CLI does not have permission to use. For multiple tools, use a quoted comma-separated list. |
| `--deny-url=URL ...` | Deny access to specific URLs or domains. Takes precedence over `--allow-url`. |
| `--disable-builtin-mcps` | Disable all built-in MCP servers (currently: `github-mcp-server`). |
| `--disable-mcp-server=SERVER-NAME` | Disable a specific MCP server. Repeatable. |
| `--disallow-temp-dir` | Prevent automatic access to the system temporary directory. |
| `--effort=LEVEL`, `--reasoning-effort=LEVEL` | Set reasoning effort. Values: `low`, `medium`, `high`. |
| `--enable-all-github-mcp-tools` | Enable all GitHub MCP server tools, overriding `--add-github-mcp-toolset` and `--add-github-mcp-tool`. |
| `--enable-reasoning-summaries` | Request reasoning summaries for OpenAI models that support them. |
| `--excluded-tools=TOOL ...` | These tools will not be available to the model. |
| `--experimental` | Enable experimental features. Use `--no-experimental` to disable. |
| `-h`, `--help` | Display help. |
| `-i PROMPT`, `--interactive=PROMPT` | Start an interactive session and automatically execute this prompt. |
| `--log-dir=DIRECTORY` | Set log directory. Default: `~/.copilot/logs/`. |
| `--log-level=LEVEL` | Set log level: none, error, warning, info, debug, all, default. |
| `--max-autopilot-continues=COUNT` | Maximum continuation messages in autopilot mode. Default: unlimited. |
| `--mode=MODE` | Set initial agent mode: `interactive`, `plan`, or `autopilot`. Cannot combine with `--autopilot` or `--plan`. |
| `--model=MODEL` | Set the AI model. Pass `auto` to let Copilot pick the best available model. |
| `--mouse[=VALUE]` | Enable mouse support in alt-screen mode. `on` by default, or `off`. Persisted to config. |
| `-n NAME`, `--name=NAME` | Set a name for the new session, used by `--resume` and `/resume`. |
| `--no-ask-user` | Disable the `ask_user` tool so the agent works without asking questions. |
| `--no-auto-update` | Disable automatic CLI updates. |
| `--no-bash-env` | Disable BASH_ENV support for bash shells. |
| `--no-color` | Disable color output. |
| `--no-custom-instructions` | Disable loading custom instructions from AGENTS.md and related files. |
| `--no-experimental` | Disable experimental features. |
| `--no-mouse` | Disable mouse support. |
| `--no-remote` | Disable remote access for this session. |
| `--output-format=FORMAT` | `text` (default) or `json` (outputs JSONL: one JSON object per line). |
| `-p PROMPT`, `--prompt=PROMPT` | Execute a prompt programmatically and exit after completion. |
| `--plan` | Start in plan mode. Shorthand for `--mode plan`. Cannot combine with `--mode` or `--autopilot`. |
| `--plain-diff` | Disable rich diff rendering. |
| `--plugin-dir=DIRECTORY` | Load a plugin from a local directory. Repeatable. |
| `--remote` | Enable remote access to this session from GitHub.com and GitHub Mobile. |
| `-r`, `--resume[=VALUE]` | Resume a previous interactive session. Optionally specify session ID, ID prefix, or exact case-insensitive session name. |
| `-s`, `--silent` | Output only the agent response, without usage statistics. Useful with `-p`. |
| `--screen-reader` | Enable screen-reader optimizations. |
| `--secret-env-vars=VAR ...` | Redact environment variable values from shell and MCP environments. Repeatable. `GITHUB_TOKEN` and `COPILOT_GITHUB_TOKEN` are redacted by default. |
| `--share=PATH` | Share a session to Markdown after a programmatic session. Default: `./copilot-session-<ID>.md`. |
| `--share-gist` | Share a session to a secret GitHub gist after a programmatic session. |
| `--stream=MODE` | Enable or disable streaming. Values: `on`, `off`. Default: `on`. |
| `-v`, `--version` | Show version information. |
| `--yolo` | Enable all permissions. Equivalent to `--allow-all`. |

---

## Notes

- `--remote`, `--no-remote`, and `--connect` require the remote sessions feature on your account.
- You can use `--remote` with `--resume <TASK-ID>` to resume a remote task locally, even if the task was created outside a Git repository.
- When `permissions.disableBypassPermissionsMode` is set to `"disable"` in settings, allow-all flags are suppressed at startup: `--allow-all-tools`, `--allow-all-paths`, `--allow-all-urls`, `--allow-all`, `--yolo`.

---

## Related Sections

- [tools.md](tools.md) for tool names and permission patterns.
- [../automation.md](../automation.md) for scripting-focused option usage.
- [mcp.md](mcp.md) for MCP-related flags.
