# CLI Reference

> Source: [GitHub Copilot CLI Command Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

This folder is the split command reference. File names are intentionally short: pick the noun that matches what you need.

---

## Start Here

| If you are looking for... | Open |
|---------------------------|------|
| Terminal commands such as `copilot`, `copilot login`, `copilot completion`, `copilot mcp` | [commands.md](commands.md) |
| Interactive keybindings, timeline shortcuts, session picker, diff mode, text navigation | [keys.md](keys.md) |
| Slash commands such as `/model`, `/mcp`, `/plan`, `/review`, `/session`, `/share` | [slash.md](slash.md) |
| Startup flags and command-line options such as `--model`, `--remote`, `--allow-tool`, `--prompt` | [options.md](options.md) |
| Models, tool availability names, and permission pattern syntax | [tools.md](tools.md) |
| Environment variables and settings files | [config.md](config.md) |
| Hook lifecycle, hook JSON, preToolUse decisions, agentStop decisions | [hooks.md](hooks.md) |
| MCP transports, server config, built-ins, OAuth, trust, enterprise allowlists | [mcp.md](mcp.md) |
| Skills, commands-as-skills, built-in agents, custom agents, subagent limits | [agents.md](agents.md) |
| Permission prompt responses and feature flags | [permissions.md](permissions.md) |
| OpenTelemetry traces, metrics, span events, content capture | [telemetry.md](telemetry.md) |

---

## Reading Paths

For daily interactive use:

1. [keys.md](keys.md)
2. [slash.md](slash.md)
3. [tools.md](tools.md)

For scripting and automation:

1. [options.md](options.md)
2. [tools.md](tools.md)
3. [config.md](config.md)
4. [../automation.md](../automation.md)

For extending the CLI:

1. [agents.md](agents.md)
2. [hooks.md](hooks.md)
3. [mcp.md](mcp.md)
4. [../plugins.md](../plugins.md)

For observability or debugging:

1. [config.md](config.md)
2. [hooks.md](hooks.md)
3. [telemetry.md](telemetry.md)
