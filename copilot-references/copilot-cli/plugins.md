# GitHub Copilot CLI - Plugin Reference

> Source: [GitHub Copilot CLI Plugin Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)

---

## Overview

Plugins let GitHub Copilot CLI load additional agents, skills, commands, hooks, MCP servers, and LSP servers. A plugin is a directory with a root `plugin.json` manifest. Marketplaces are repositories or local directories containing a `.github/plugin/marketplace.json` file that advertises one or more plugins.

For terminal help, run:

```bash
copilot plugin [SUBCOMMAND] --help
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `copilot plugin install SPECIFICATION` | Install a plugin. See install specifications below. |
| `copilot plugin uninstall NAME` | Remove a plugin. |
| `copilot plugin list` | List installed plugins. |
| `copilot plugin update NAME` | Update a named plugin. Use `--all` to update all installed plugins at once. |
| `copilot plugin enable NAME` | Enable a previously disabled plugin. |
| `copilot plugin disable NAME` | Disable a plugin without uninstalling it. |
| `copilot plugin marketplace add SPECIFICATION` | Register a marketplace. |
| `copilot plugin marketplace list` | List registered marketplaces. |
| `copilot plugin marketplace browse NAME` | Browse marketplace plugins. |
| `copilot plugin marketplace remove NAME` | Unregister a marketplace. |

### Plugin Install Specifications

| Source type | Specification | Description |
|-------------|---------------|-------------|
| Marketplace | `plugin@marketplace` | Plugin from a registered marketplace. |
| GitHub repository | `OWNER/REPO` | Plugin at the root of a GitHub repository. |
| GitHub subdirectory | `OWNER/REPO:PATH/TO/PLUGIN` | Plugin in a subdirectory of a GitHub repository. |
| Git URL | `https://github.com/o/r.git` | Plugin from any Git URL. |
| Local path | `./my-plugin` or `/abs/path` | Plugin from a local directory. |

---

## `plugin.json`

All plugins consist of a plugin directory containing a manifest file named `plugin.json` at the plugin root. The CLI also checks these manifest locations, in order:

1. `.plugin/plugin.json`
2. `plugin.json`
3. `.github/plugin/plugin.json`
4. `.claude-plugin/plugin.json`

### Required Field

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Kebab-case plugin name. Letters, numbers, and hyphens only. Max 64 characters. |

### Optional Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief description. Max 1024 characters. |
| `version` | string | Semantic version, for example `1.0.0`. |
| `author` | object | Author info: `name` required, `email` and `url` optional. |
| `homepage` | string | Plugin homepage URL. |
| `repository` | string | Source repository URL. |
| `license` | string | License identifier, for example `MIT`. |
| `keywords` | string[] | Search keywords. |
| `category` | string | Plugin category. |
| `tags` | string[] | Additional tags. |

### Component Path Fields

These tell the CLI where to find plugin components. All are optional; the CLI uses default conventions when omitted.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `agents` | string or string[] | `agents/` | Path(s) to agent directories containing `.agent.md` files. |
| `skills` | string or string[] | `skills/` | Path(s) to skill directories containing `SKILL.md` files. |
| `commands` | string or string[] | none | Path(s) to command directories. |
| `hooks` | string or object | none | Path to a hooks config file, or inline hooks object. |
| `mcpServers` | string or object | none | Path to an MCP config file, such as `.mcp.json`, or inline server definitions. |
| `lspServers` | string or object | none | Path to an LSP config file, or inline server definitions. |

### Example `plugin.json`

```json
{
  "name": "my-dev-tools",
  "description": "React development utilities",
  "version": "1.2.0",
  "author": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "license": "MIT",
  "keywords": ["react", "frontend"],
  "agents": "agents/",
  "skills": ["skills/", "extra-skills/"],
  "hooks": "hooks.json",
  "mcpServers": ".mcp.json"
}
```

---

## `marketplace.json`

A marketplace lets users discover and install curated plugins. Create a `marketplace.json` file and save it in `.github/plugin/` in the repository, or in a local directory such as `/PATH/TO/my-marketplace/.github/plugin/marketplace.json`, then register it:

```bash
copilot plugin marketplace add /PATH/TO/my-marketplace
```

Copilot CLI also looks for marketplace manifests in `.claude-plugin/`.

The CLI checks marketplace manifest locations in this order:

1. `marketplace.json`
2. `.plugin/marketplace.json`
3. `.github/plugin/marketplace.json`
4. `.claude-plugin/marketplace.json`

### Example `marketplace.json`

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Your Organization",
    "email": "plugins@example.com"
  },
  "metadata": {
    "description": "Curated plugins for our team",
    "version": "1.0.0"
  },
  "plugins": [
    {
      "name": "frontend-design",
      "description": "Create a professional-looking GUI ...",
      "version": "2.1.0",
      "source": "./plugins/frontend-design"
    },
    {
      "name": "security-checks",
      "description": "Check for potential security vulnerabilities ...",
      "version": "1.3.0",
      "source": "./plugins/security-checks"
    }
  ]
}
```

The `source` field path is relative to the marketplace repository root. `"./plugins/plugin-name"` and `"plugins/plugin-name"` resolve to the same directory.

### Top-Level Marketplace Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Kebab-case marketplace name. Max 64 characters. |
| `owner` | object | Yes | Marketplace owner info: `{ name, email? }`. |
| `plugins` | array | Yes | List of plugin entries. |
| `metadata` | object | No | Marketplace metadata: `{ description?, version?, pluginRoot? }`. |

### Plugin Entry Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Kebab-case plugin name. Max 64 characters. |
| `source` | string or object | Yes | Where to fetch the plugin: relative path, GitHub, or URL. |
| `description` | string | No | Plugin description. Max 1024 characters. |
| `version` | string | No | Plugin version. |
| `author` | object | No | Author info: `{ name, email?, url? }`. |
| `homepage` | string | No | Plugin homepage URL. |
| `repository` | string | No | Source repository URL. |
| `license` | string | No | License identifier. |
| `keywords` | string[] | No | Search keywords. |
| `category` | string | No | Plugin category. |
| `tags` | string[] | No | Additional tags. |
| `commands` | string or string[] | No | Path(s) to command directories. |
| `agents` | string or string[] | No | Path(s) to agent directories. |
| `skills` | string or string[] | No | Path(s) to skill directories. |
| `hooks` | string or object | No | Path to hooks config or inline hooks object. |
| `mcpServers` | string or object | No | Path to MCP config or inline server definitions. |
| `lspServers` | string or object | No | Path to LSP config or inline server definitions. |
| `strict` | boolean | No | When `true` (default), plugins must conform to the full schema and validation rules. When `false`, relaxed validation is used for more flexibility, especially direct installs or legacy plugins. |

---

## File Locations

| Item | Location |
|------|----------|
| Installed marketplace plugins | `~/.copilot/installed-plugins/MARKETPLACE/PLUGIN-NAME` |
| Installed direct plugins | `~/.copilot/installed-plugins/_direct/SOURCE-ID/` |
| Marketplace cache (Linux) | `~/.cache/copilot/marketplaces/` |
| Marketplace cache (macOS) | `~/Library/Caches/copilot/marketplaces/` |
| Cache override | `COPILOT_CACHE_HOME` |
| Plugin manifest | `.plugin/plugin.json`, `plugin.json`, `.github/plugin/plugin.json`, or `.claude-plugin/plugin.json` |
| Marketplace manifest | `marketplace.json`, `.plugin/marketplace.json`, `.github/plugin/marketplace.json`, or `.claude-plugin/marketplace.json` |
| Agents | `agents/` by default, overridable in manifest |
| Skills | `skills/` by default, overridable in manifest |
| Hooks configuration | `hooks.json` or `hooks/hooks.json` |
| MCP configuration | `.mcp.json`, `.github/mcp.json` |
| LSP configuration | `lsp.json` or `.github/lsp.json` |
| Plugin data | `${COPILOT_PLUGIN_DATA}` (also available as `${CLAUDE_PLUGIN_DATA}`), a persistent writable directory unique to each installed plugin. Use this instead of writing into the installed-plugins cache. |

---

## Loading Order and Precedence

If multiple plugins or local configurations define agents, skills, MCP servers, or MCP tools with duplicate names, the CLI uses precedence rules.

### Agents and Skills

Agents and skills use first-found-wins precedence.

- Custom agents are deduplicated by ID, derived from the file name. For example, `reviewer.agent.md` becomes `reviewer`.
- Skills are deduplicated by the `name` field inside `SKILL.md`.
- A project-level or personal agent/skill with the same name as one from a plugin causes the plugin version to be silently ignored.
- Plugins cannot override project-level or personal configurations.

### MCP Servers

MCP servers use last-wins precedence.

- If a plugin defines an MCP server with the same server name as an already installed MCP server, the plugin's definition takes precedence.
- `--additional-mcp-config` has the highest priority and can override plugin-installed MCP server definitions with the same name.

### Built-Ins

Built-in tools and agents are always present and cannot be overridden by user-defined components.

### Precedence Summary

| Component | Precedence |
|-----------|------------|
| Built-in tools and agents | Always present; cannot be overridden. |
| Custom agents | First loaded is used; deduped by agent ID. |
| Skills | First loaded is used; deduped by skill `name`. |
| Commands | Lower priority than skills; skills override commands. |
| MCP servers | Last loaded is used; deduped by server name. |

### Detailed Loading Order

| Component | Order |
|-----------|-------|
| Custom agents | `~/.copilot/agents/`; project `.github/agents/`; parent `.github/agents/`; project `.claude/agents/`; parent `.claude/agents/`; plugin agent dirs by install order; remote org/enterprise agents. |
| Agent skills | project `.github/skills/`; project `.agents/skills/`; project `.claude/skills/`; parent skill dirs; `~/.copilot/skills/`; `~/.agents/skills/`; plugin skill dirs; `COPILOT_SKILLS_DIRS` env and config; then command dirs (`.claude/commands/`). |
| MCP servers | `~/.copilot/mcp-config.json` (lowest); plugin MCP configs; `--additional-mcp-config` (highest). |

---

## Further Reading

- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli)
- [GitHub Copilot CLI Command Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [GitHub Copilot CLI Programmatic Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-programmatic-reference)
