# Models, Tool Availability, and Permission Patterns

> Source sections: [Supported models](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#supported-models), [Tool availability values](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#tool-availability-values), [Tool permission patterns](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#tool-permission-patterns)

Use this when you need to choose a model, restrict tool availability, or pre-approve/deny tool permissions.

---

## Supported Models

Use `--model=MODEL` or `COPILOT_MODEL` to select a model. Pass `auto` to let Copilot pick the best available model. You can also switch models interactively with `/model`.

| Model | Best for |
|-------|----------|
| `claude-sonnet-4.6` | General-purpose coding. Default. |
| `gpt-5.4` | Complex reasoning tasks. |
| `claude-haiku-4.5` | Fast, lightweight operations. |
| `gpt-5.3-codex` | Code-focused tasks. |
| `gemini-3.1-pro-preview` | Google Gemini reasoning. |
| `gemini-3.5-flash` | Fast Google Gemini responses. |

---

## Tool Availability Values

`--available-tools` and `--excluded-tools` accept these values.

### Shell Tools

| Tool | Description |
|------|-------------|
| `bash` / `powershell` | Execute commands. |
| `list_bash` / `list_powershell` | List active shell sessions. |
| `read_bash` / `read_powershell` | Read output from a shell session. |
| `stop_bash` / `stop_powershell` | Terminate a shell session. |
| `write_bash` / `write_powershell` | Send input to a shell session. |

### File Operation Tools

| Tool | Description |
|------|-------------|
| `apply_patch` | Apply patches. Used by some models instead of edit/create. |
| `create` | Create new files. |
| `edit` | Edit files via string replacement. |
| `view` | Read files or directories. |

### Agent and Task Delegation Tools

| Tool | Description |
|------|-------------|
| `list_agents` | List available agents. |
| `read_agent` | Check background agent status. |
| `task` | Run subagents. |

### Other Tools

| Tool | Description |
|------|-------------|
| `ask_user` | Ask the user a question. |
| `glob` | Find files matching patterns. |
| `grep` or `rg` | Search for text in files. |
| `skill` | Invoke custom skills. |
| `web_fetch` | Fetch and parse web content. |

---

## Tool Permission Patterns

`--allow-tool` and `--deny-tool` accept permission patterns in the format `Kind(argument)`. The argument is optional; omitting it matches all tools of that kind.

| Pattern | Matches | Examples |
|---------|---------|----------|
| `memory` | Storing facts to agent memory. | `memory` |
| `read` | File or directory reads. | `read`, `read(.env)` |
| `shell` | Shell command execution. | `shell(git push)`, `shell(git:*)`, `shell` |
| `url` | URL access through web-fetch or shell. | `url(github.com)`, `url(https://*.api.com)` |
| `write` | File creation or modification. | `write`, `write(src/*.ts)` |
| `SERVER-NAME` | MCP server tool invocation. | `My MCP(create_issue)`, `MyMCP` |

For `shell`, the `:*` suffix matches the command stem followed by a space, preventing partial matches. `shell(git:*)` matches `git push` and `git pull`, but not `gitea`.

Deny rules always take precedence over allow rules, even when `--allow-all` is set.

```bash
# Allow all git commands except git push
copilot --allow-tool='shell(git:*)' --deny-tool='shell(git push)'

# Allow a specific MCP server tool
copilot --allow-tool='MyMCP(create_issue)'

# Allow all tools from a server
copilot --allow-tool='MyMCP'
```

---

## Related Sections

- [options.md](options.md) for where these flags are used.
- [../automation.md](../automation.md) for CI/script examples and narrower filters.
- [mcp.md](mcp.md) for server naming and MCP tool naming rules.
