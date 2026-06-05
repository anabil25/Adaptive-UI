# Agents and Skills

> Source sections: [Skills reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#skills-reference), [Custom agents reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#custom-agents-reference)

Use this for skills, command-style skills, built-in agents, custom agent files, agent locations, and subagent limits.

---

## Skills

Skills are Markdown files that extend what the CLI can do. Each skill lives in a directory containing `SKILL.md`. A skill can be invoked with `/SKILL-NAME` or automatically by the agent.

### Skill Frontmatter

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique skill ID. Letters, numbers, and hyphens only. Max 64 characters. |
| `description` | string | Yes | What the skill does and when to use it. Max 1024 characters. |
| `allowed-tools` | string or string[] | No | Tools automatically allowed while the skill is active. Use `"*"` for all. |
| `user-invocable` | boolean | No | Whether users can invoke it with `/SKILL-NAME`. Default: `true`. |
| `disable-model-invocation` | boolean | No | Prevent automatic invocation by the agent. Default: `false`. |

### Skill Locations

| Location | Scope | Description |
|----------|-------|-------------|
| `.github/skills/` | Project | Project-specific skills. |
| `.agents/skills/` | Project | Alternative project location. |
| `.claude/skills/` | Project | Claude-compatible location. |
| Parent `.github/skills/` | Inherited | Monorepo parent support. |
| `~/.copilot/skills/` | Personal | Personal skills for all projects. |
| `~/.agents/skills/` | Personal | Agent skills shared across all projects. |
| `~/.claude/skills/` | Personal | Claude-compatible personal location. |
| Plugin directories | Plugin | Skills from installed plugins. |
| `COPILOT_SKILLS_DIRS` | Custom | Additional comma-separated directories. |
| Bundled with CLI | Built-in | Lowest priority; overridable by any other source. |

Commands are an alternative skill format stored as individual `.md` files in `.claude/commands/`. The filename becomes the command name. Command files use a simplified format with no `name` field required and support `description`, `allowed-tools`, and `disable-model-invocation`. Commands have lower priority than skills with the same name.

---

## Built-In Agents

| Agent | Model | Description |
|-------|-------|-------------|
| `code-review` | `claude-sonnet-4.5` | High signal-to-noise code review. |
| `explore` | `claude-haiku-4.5` | Fast codebase exploration. Searches files, reads code, and answers questions. Returns focused answers under 300 words. Safe to run in parallel. |
| `general-purpose` | `claude-sonnet-4.5` | Full-capability agent for complex multi-step tasks. Runs in a separate context window. |
| `research` | `claude-sonnet-4.6` | Deep research using codebase, relevant repositories, and web sources. |
| `rubber-duck` | complementary model | Constructive critique of proposals, designs, implementations, or tests. |
| `task` | `claude-haiku-4.5` | Command execution for tests, builds, lints. Brief success, full failure output. |

---

## Custom Agents

Custom agents are Markdown files. The filename, minus extension, becomes the agent ID. Use `.agent.md` or `.md`.

### Frontmatter

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | Description shown in agent lists and task tool. |
| `infer` | boolean | No | Allow auto-delegation by the main agent. Default: `true`. |
| `mcp-servers` | object | No | MCP servers to connect. Uses the same schema as `~/.copilot/mcp-config.json`. |
| `model` | string | No | Model for this agent. Inherits outer model if unset. |
| `name` | string | No | Display name. Defaults to filename. |
| `tools` | string[] | No | Tools available to the agent. Default: `["*"]`. |

### Locations

| Scope | Paths |
|-------|-------|
| Project | `.github/agents/`, `.claude/agents/` |
| User | `~/.copilot/agents/`, `~/.claude/agents/` |
| Plugin | `<plugin>/agents/` |

Project agents take precedence over user agents. Plugin agents have the lowest priority.

---

## Subagent Limits

| Limit | Default | Environment Variable |
|-------|---------|----------------------|
| Max depth | 6 | `COPILOT_SUBAGENT_MAX_DEPTH` |
| Max concurrent | 32 | `COPILOT_SUBAGENT_MAX_CONCURRENT` |

Values are clamped between `1` and `256`. Depth counts nested agent levels. Concurrency counts simultaneously running subagents across the session tree.

---

## Related Sections

- [../plugins.md](../plugins.md) for packaging agents and skills in plugins.
- [tools.md](tools.md) for task and skill tool availability.
- [mcp.md](mcp.md) for agent-attached MCP server config.
