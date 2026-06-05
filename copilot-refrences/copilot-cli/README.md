# GitHub Copilot CLI Notes

This folder is organized by category. Start with the file or folder name that matches the kind of work you are doing.

---

## Categories

| Category | What is inside |
|----------|----------------|
| [cli/](cli/) | The main interactive CLI reference. This folder is split into focused files for commands, keys, slash commands, options, tools, config, hooks, MCP, agents, permissions, and telemetry. Use it when you are trying to operate or configure Copilot CLI directly. |
| [automation.md](automation.md) | Non-interactive and script-oriented usage. Covers `copilot -p`, silent output, explicit tool permissions, `--allow-tool` filters, headless authentication, model precedence, custom agents in prompt mode, and CI-style examples. |
| [plugins.md](plugins.md) | Plugin packaging and marketplace behavior. Covers plugin install commands, `plugin.json`, `marketplace.json`, plugin file locations, plugin data directories, and loading precedence for plugin-provided agents, skills, hooks, MCP servers, and LSP servers. |

---

## Inside `cli/`

| File | What is inside |
|------|----------------|
| [cli/commands.md](cli/commands.md) | Top-level terminal commands such as `copilot`, `copilot login`, `copilot completion`, `copilot mcp`, `copilot plugin`, update, version, and login/token behavior. |
| [cli/keys.md](cli/keys.md) | Interactive keyboard shortcuts. Includes global shortcuts, timeline controls, session picker keys, diff mode keys, mouse notes, and text navigation. |
| [cli/slash.md](cli/slash.md) | Slash commands available inside the interactive CLI. Includes session management, model selection, MCP, plugins, planning, review, research, sharing, tasks, permissions, and update commands. |
| [cli/options.md](cli/options.md) | Command-line flags used at startup or in prompt mode. Includes permission flags, model/mode flags, remote sessions, output formatting, logging, streaming, plugin directories, and sharing. |
| [cli/tools.md](cli/tools.md) | Models, tool availability names, and permission pattern syntax. Use it for `--available-tools`, `--excluded-tools`, `--allow-tool`, `--deny-tool`, and MCP tool permission patterns. |
| [cli/config.md](cli/config.md) | Environment variables and settings files. Covers config precedence, user/repository/local settings, auth-related env vars, cache/config locations, model env vars, and subagent limits. |
| [cli/hooks.md](cli/hooks.md) | Hook lifecycle and hook configuration. Covers hook events, command hooks, prompt hooks, `preToolUse` decisions, `agentStop`/`subagentStop` decisions, and hook tool names. |
| [cli/mcp.md](cli/mcp.md) | MCP server behavior. Covers `copilot mcp`, transports, local/remote server fields, filter mapping, built-in MCP servers, GitHub MCP tools, OAuth, OIDC, trust levels, enterprise allowlists, and migration from VS Code MCP config. |
| [cli/agents.md](cli/agents.md) | Skills and agents. Covers skill frontmatter, skill locations, command-style skills, built-in agents, custom agent frontmatter, custom agent locations, and subagent limits. |
| [cli/permissions.md](cli/permissions.md) | Permission prompts and feature flags. Covers approval keys, full-dialog choices, persisted location approvals, `/permissions reset`, and known CLI feature flags. |
| [cli/telemetry.md](cli/telemetry.md) | OpenTelemetry monitoring. Covers activation env vars, trace spans, metrics, span events, resource attributes, and content capture behavior. |

---

## Inside `automation.md`

| Section | What is inside |
|---------|----------------|
| Programmatic options | The flags that matter when Copilot CLI is called from scripts or CI, especially `-p`, `-s`, permissions, model selection, transcript sharing, and no-interaction mode. |
| Tool permissions | The allowed tool kinds and filter patterns for `--allow-tool`, including shell commands, writes, reads, URLs, memory, and MCP server tools. |
| Environment and auth | The env vars most relevant to automation, including token precedence and `COPILOT_HOME` / `COPILOT_MODEL`. |
| Models and agents | How model selection is resolved in non-interactive runs, plus how to run a prompt through a custom agent. |
| Usage patterns | Small examples for script-friendly output, CI-style test runs, and headless authentication. |

---

## Inside `plugins.md`

| Section | What is inside |
|---------|----------------|
| Plugin commands | Terminal commands for installing, uninstalling, listing, updating, enabling/disabling plugins, and managing marketplaces. |
| Plugin manifests | `plugin.json` fields for plugin metadata and component paths such as agents, skills, commands, hooks, MCP, and LSP servers. |
| Marketplaces | `marketplace.json` structure, plugin entries, marketplace ownership metadata, and source paths. |
| File locations | Where installed plugins, marketplace caches, manifests, hooks, MCP config, LSP config, and plugin data live. |
| Loading precedence | How built-ins, project/user agents, skills, plugin components, commands, and MCP servers resolve when names conflict. |
