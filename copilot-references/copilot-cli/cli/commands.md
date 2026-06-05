# Command-Line Commands

> Source section: [Command-line commands](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#command-line-commands)

Use this when you are looking for top-level `copilot ...` terminal commands, login behavior, tab completion, or command-line plugin/MCP entry points.

---

## Commands

| Command | Description |
|---------|-------------|
| `copilot` | Launch the interactive user interface. |
| `copilot completion SHELL` | Print a shell script to enable tab completion for Copilot CLI subcommands, options, and known value choices. Supported shells: `bash`, `zsh`, `fish`. |
| `copilot help [TOPIC]` | Display help information. Topics: billing, config, commands, environment, logging, monitoring, permissions, providers. |
| `copilot init` | Initialize Copilot custom instructions for this repository. |
| `copilot login` | Authenticate with Copilot via OAuth device flow. Accepts `--host HOST` to specify GitHub host URL. |
| `copilot logout` | Sign out of GitHub and remove stored credentials. |
| `copilot mcp` | Manage MCP server configurations from the command line (`list`, `get`, `add`, `remove`). |
| `copilot plugin` | Manage plugins and plugin marketplaces. |
| `copilot update` | Download and install the latest version. |
| `copilot version` | Display version information and check for updates. |

---

## `copilot login`

| Option | Description |
|--------|-------------|
| `--host HOST` | GitHub host URL. Default: `https://github.com`. Use this for a GitHub Enterprise Cloud instance that uses data residency, such as `https://example.ghe.com`. |

Default authentication is a browser-based flow. On success, Copilot CLI stores a token in the system credential store. If no credential store is found, it stores the token in a plaintext config file under `~/.copilot/` or under `COPILOT_HOME` if set.

For headless use, Copilot CLI can use tokens from environment variables, checked in this order:

1. `COPILOT_GITHUB_TOKEN`
2. `GH_TOKEN`
3. `GITHUB_TOKEN`

Supported token types:

- Fine-grained personal access tokens (v2 PATs) with the "Copilot Requests" permission.
- OAuth tokens from the Copilot CLI app.
- OAuth tokens from the GitHub CLI (`gh`) app.

Classic personal access tokens (`ghp_`) are not supported.

---

## `copilot completion`

`copilot completion SHELL` outputs a completion script for `bash`, `zsh`, or `fish`. Source it or write it to your shell's completion directory to enable tab completion for subcommands, command options, and known option values.

```bash
# Bash, current session
source <(copilot completion bash)

# Bash, persistent on Linux
copilot completion bash | sudo tee /etc/bash_completion.d/copilot

# Zsh, write to a directory on $fpath, then restart the shell
copilot completion zsh > "${fpath[1]}/_copilot"

# Fish
copilot completion fish > ~/.config/fish/completions/copilot.fish
```

---

## Related Sections

- [mcp.md](mcp.md) for `copilot mcp` details.
- [../plugins.md](../plugins.md) for `copilot plugin` details.
- [options.md](options.md) for startup flags and prompt-mode options.
