# GitHub Copilot CLI - Programmatic Reference

> Source: [GitHub Copilot CLI Programmatic Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-programmatic-reference)

---

## Overview

Copilot CLI can run non-interactively by passing a prompt directly on the command line. This is useful for scripts, CI/CD pipelines, and automation workflows.

```bash
copilot -p "Summarize this repository" -s
```

For the complete command list, run:

```bash
copilot help
```

---

## Command-Line Options for Programmatic Use

| Option | Description |
|--------|-------------|
| `-p PROMPT`, `--prompt=PROMPT` | Execute a prompt in non-interactive mode. The CLI runs the prompt and exits when done. |
| `-s`, `--silent` | Suppress stats and decoration, outputting only the agent response. Useful for piping output in scripts. |
| `--add-dir=DIRECTORY` | Add a directory to the allowed-paths list. Repeatable. Useful when the agent needs to read/write outside the current working directory. |
| `--agent=AGENT` | Specify a custom agent to use. |
| `--allow-all`, `--yolo` | Allow all permissions. Equivalent to `--allow-all-tools --allow-all-paths --allow-all-urls`. |
| `--allow-all-paths` | Disable file-path verification entirely. Simpler than `--add-dir` when path restrictions are unnecessary. |
| `--allow-all-tools` | Allow every tool to run without explicit permission for each tool. |
| `--allow-all-urls` | Allow access to all URLs without explicit permission for each URL. |
| `--allow-tool=TOOL ...` | Selectively grant permission for a specific tool. For multiple tools, use a quoted, comma-separated list. |
| `--allow-url=URL ...` | Allow the agent to fetch a specific URL or domain. Useful when a workflow needs web access to known endpoints. For multiple URLs, use a quoted, comma-separated list. |
| `--deny-tool=TOOL ...` | Deny a specific tool. Useful for locked-down workflows. For multiple tools, use a quoted, comma-separated list. |
| `--model=MODEL` | Choose the AI model. Useful for pinning a model in reproducible workflows. |
| `--no-ask-user` | Prevent the agent from pausing to seek additional user input. |
| `--secret-env-vars=VAR ...` | Redact environment variable values from output. For multiple variables, use a quoted, comma-separated list. `GITHUB_TOKEN` and `COPILOT_GITHUB_TOKEN` are redacted by default. |
| `--share=PATH` | Export the session transcript to a Markdown file after non-interactive completion. Defaults to `./copilot-session-<ID>.md`. Useful for auditing or archiving. |
| `--share-gist` | Publish the session transcript as a secret GitHub gist after completion. Useful for sharing CI results. |

> Session transcripts may contain sensitive information. Treat `--share` and `--share-gist` output as potentially sensitive logs.

---

## Tools for `--allow-tool`

Use `--allow-tool` to grant specific tool permissions in non-interactive runs.

| Tool kind | Description |
|-----------|-------------|
| `shell` | Execute shell commands. |
| `write` | Create or modify files. |
| `read` | Read files or directories. |
| `url` | Fetch content from a URL. |
| `memory` | Store new facts to the agent's persistent memory. Does not affect reading existing memories. |
| `MCP-SERVER` | Invoke tools from a specific MCP server. Use the configured server name, for example `github`. |

### Tool Filters

The `shell`, `write`, `url`, and MCP server tool kinds allow filters in parentheses.

| Kind | Example | Meaning |
|------|---------|---------|
| `shell` | `shell(git:*)` | Allow all Git subcommands, such as `git push` and `git status`. |
| `shell` | `shell(npm test)` | Allow the exact command `npm test`. |
| `write` | `write(.github/copilot-instructions.md)` | Allow writing this specific path. |
| `write` | `write(README.md)` | Allow writing any file whose path ends with `/README.md`. |
| `url` | `url(github.com)` | Allow HTTPS URLs on `github.com`. |
| `url` | `url(http://localhost:3000)` | Allow the local dev server with explicit protocol and port. |
| `url` | `url(https://*.github.com)` | Allow any GitHub subdomain, such as `api.github.com`. |
| `url` | `url(https://docs.github.com/copilot/*)` | Allow Copilot documentation URLs under that path. |
| `MCP-SERVER` | `github(create_issue)` | Allow only the `create_issue` tool from the `github` MCP server. |

Wildcards are only supported:

- For `shell`, to match all subcommands of a specified tool, such as `shell(git:*)`.
- For `url`, at the start of the host name to match subdomains, or at the end of a path to match a path suffix.

### Permission Examples

```bash
# Allow file reads and exact shell command only
copilot -p "Explain the test failures" \
  --allow-tool='read,shell(npm test)' \
  --no-ask-user

# Allow all git commands except push
copilot -p "Prepare a release summary" \
  --allow-tool='shell(git:*)' \
  --deny-tool='shell(git push)'

# Allow a known URL and file writes
copilot -p "Update docs based on the latest API page" \
  --allow-tool='read,write,url(https://docs.github.com/copilot/*)'
```

---

## Environment Variables

These are particularly useful in scripts, CI/CD, and other automated environments.

| Variable | Description |
|----------|-------------|
| `COPILOT_ALLOW_ALL` | Set to `true` for full permissions. |
| `COPILOT_MODEL` | Set the model, for example `gpt-5.2` or `claude-sonnet-4.5`. |
| `COPILOT_HOME` | Set the CLI configuration directory. Default: `~/.copilot`. |
| `COPILOT_GITHUB_TOKEN` | Authentication token. Highest precedence. |
| `GH_TOKEN` | Authentication token. Second precedence. |
| `GITHUB_TOKEN` | Authentication token. Third precedence. |

For the full environment-variable list, run:

```bash
copilot help environment
```

---

## Choosing a Model

When a prompt runs non-interactively, the model used is shown in response output unless `-s` or `--silent` is used. Use `--model` to choose a model suited to the task, balancing speed, cost, and capability.

### Examples

Fast/simple task:

```bash
copilot -p "What does this project do?" -s --model claude-haiku-4.5
```

More complex coding task:

```bash
copilot -p "Fix the race condition in the worker pool" \
  --model gpt-5.3-codex \
  --allow-tool='write, shell'
```

Set the model for the current shell session:

```bash
export COPILOT_MODEL=claude-sonnet-4.6
copilot -p "Review this repository" -s
```

Persist a model in the CLI config file (`~/.copilot/settings.json`, or `$COPILOT_HOME/settings.json`):

```json
{
  "model": "gpt-5.3-codex",
  "effortLevel": "low"
}
```

The easiest way to set a model persistently is with `/model` in an interactive session; the choice is written to the config file.

### Model Precedence

From highest to lowest:

1. If a custom agent is used, the model specified in the custom agent definition, if any.
2. The `--model` command-line option.
3. The `COPILOT_MODEL` environment variable.
4. The `model` key in the configuration file (`~/.copilot/settings.json` or `$COPILOT_HOME/settings.json`).
5. The CLI default model.

Model strings for all available models are shown in `copilot help` under the `--model` option.

---

## Using Custom Agents

Use `--agent` to delegate work to a specialized agent.

```bash
copilot -p "Review the latest commit" \
  --allow-tool='shell' \
  --agent code-review
```

This requires an agent with the requested name to exist. Agents can be provided by project files, user files, plugins, or built-ins depending on the CLI's agent loading rules.

---

## Programmatic Usage Patterns

### Script-Friendly Text Output

```bash
summary=$(copilot -p "Summarize the changes in this repository" -s --allow-tool='read,shell(git:*)')
printf '%s\n' "$summary"
```

### CI Run With Explicit Permissions

```bash
copilot -p "Run tests and explain any failures" \
  --allow-tool='read,shell(pnpm test)' \
  --no-ask-user \
  --share=./copilot-session.md
```

### Headless Authentication

Use one of the supported token environment variables, in precedence order:

```bash
COPILOT_GITHUB_TOKEN=github_pat_... copilot -p "Summarize this repo" -s
```

---

## Further Reading

- [Running GitHub Copilot CLI programmatically](https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/run-cli-programmatically)
- [GitHub Copilot CLI Command Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [GitHub Copilot CLI Plugin Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
