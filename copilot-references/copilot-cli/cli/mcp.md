# MCP

> Source section: [MCP server configuration](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#mcp-server-configuration)

Use this for MCP server setup, `copilot mcp`, server config fields, built-in MCP servers, OAuth, trust, and enterprise allowlists.

---

## `copilot mcp`

| Subcommand | Description |
|------------|-------------|
| `list [--json]` | List configured MCP servers grouped by source. |
| `get <name> [--json]` | Show config and tools for a server. |
| `add <name>` | Add a server to user config at `~/.copilot/mcp-config.json`. |
| `remove <name>` | Remove a user-level server. Workspace servers must be edited in config files. |

`copilot mcp add` options: `-- <command> [args...]` (local/stdio), `--url <url>` (remote), `--type <local|stdio|http|sse>`, `--env KEY=VALUE` (repeatable), `--header KEY=VALUE` (repeatable), `--tools <tools>` (`"*"`, a comma-separated list, or `""` for none), `--timeout <ms>`, `--json`, `--show-secrets`.

> **Caution:** `--show-secrets` can print sensitive environment variable and header values. Only use in trusted environments.

---

## Transport Types

| Type | Description | Key Fields |
|------|-------------|------------|
| `local` / `stdio` | Local process over stdin/stdout. | `command`, `args` |
| `http` | Remote server using streamable HTTP transport. | `url` |
| `sse` | Remote server using Server-Sent Events transport. | `url` |

---

## Local Server Fields

| Field | Required | Description |
|-------|----------|-------------|
| `command` | Yes | Command to start the server. |
| `args` | Yes | Command arguments array. |
| `tools` | Yes | Tools to enable: `["*"]` for all, or specific tool names. |
| `env` | No | Environment variables. Supports `$VAR`, `${VAR}`, and `${VAR:-default}`. |
| `cwd` | No | Working directory. |
| `timeout` | No | Tool call timeout in milliseconds. |
| `type` | No | `"local"` or `"stdio"`. Default: `"local"`. |

---

## Remote Server Fields

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | `"http"` or `"sse"`. |
| `url` | Yes | Server URL. |
| `tools` | Yes | Tools to enable. |
| `headers` | No | HTTP headers. Supports variable expansion. |
| `oauthClientId` | No | Static OAuth client ID. Skips dynamic registration. |
| `oauthPublicClient` | No | Whether the OAuth client is public. Default: `true`. Set `false` for confidential clients with a stored secret. |
| `oauthGrantType` | No | `"authorization_code"` (default, browser flow) or `"client_credentials"` (fully headless, no browser/callback). |
| `oidc` | No | Enable OIDC token injection for `GITHUB_COPILOT_OIDC_MCP_TOKEN[_<SUFFIX>]` variables (local) or as a Bearer header (remote). |
| `timeout` | No | Tool call timeout in milliseconds. |

---

## Filter Mapping

Control how MCP tool output is processed using the `filterMapping` field.

| Value | Description |
|-------|-------------|
| `none` | No filtering. |
| `markdown` | Format output as Markdown. |
| `hidden_characters` | Remove hidden or control characters. Default. |

---

## Built-In MCP Servers

| Server | Description |
|--------|-------------|
| `github-mcp-server` | GitHub API integration: issues, pull requests, labels, commits, code search, GitHub Actions. |
| `playwright` | Browser automation: navigate, click, type, screenshot, form handling. |
| `fetch` | HTTP requests through fetch. |
| `time` | Time utilities: `get_current_time`, `convert_time`. |

Disable all built-ins with `--disable-builtin-mcps`, or one server with `--disable-mcp-server SERVER-NAME`.

### GitHub MCP Server Tools

| Tools | Purpose |
|-------|---------|
| `get_file_contents`, `search_code` | Browse repository files. |
| `list_issues`, `issue_read`, `search_issues` | Issue tracking. |
| `get_pull_request`, `list_pull_requests`, `get_pull_request_files` | Pull requests. |
| `list_commits`, `get_commit` | Commit history. |
| `list_workflow_runs`, `get_workflow_run_logs` | GitHub Actions. |
| `get_label`, `list_label`, `label_write` | Label management. |

---

## Trust and Security

| Source | Trust Level | Review Recommended |
|--------|-------------|-------------------|
| Built-in | High | No |
| Repository `.github/mcp.json` | Medium | Recommended |
| Workspace `.mcp.json`, `.vscode/mcp.json` | Medium | Recommended |
| Dev container `.devcontainer/devcontainer.json` | Medium | Recommended |
| User config `~/.copilot/mcp-config.json` | User-defined | User responsibility |
| Remote servers | Low | Always |

All MCP tool calls require explicit permission, even read-only external calls.

---

## OAuth and Auth Refresh

Remote MCP servers using OAuth may show `needs-auth` when a token expires or a different account is required. Use `/mcp auth <server-name>` to run a fresh OAuth flow.

For headless OAuth, set `oauthGrantType: "client_credentials"`. This requires `oauthClientId`, `oauthPublicClient: false`, and a `client_secret` in the system keychain. The CLI then skips the browser, callback server, PKCE, and dynamic registration, posting `grant_type=client_credentials` to the discovered token endpoint on every 401.

---

## Naming, Enterprise Allowlist, and Migration

Server names may contain printable characters except control characters and `}`. Tool names sent to the model are sanitized to `a-z`, `A-Z`, `0-9`, `-`, and `_`; Unicode is Punycode-encoded; `@` becomes `-`; combined names cap at 64 characters.

Enterprise organizations can enforce an MCP allowlist. Non-default servers are fingerprinted from command, args, and URL. The check is fail-closed; built-in default servers are exempt.

For private npm registries, use `--registry` in the `args` array. npm config flags are treated as value-consuming when computing server identity fingerprints.

To migrate VS Code MCP config:

```bash
jq '{mcpServers: .servers}' .vscode/mcp.json > .mcp.json
```
