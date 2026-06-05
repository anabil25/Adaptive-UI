# Slash Commands

> Source section: [Slash commands in the interactive interface](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#slash-commands-in-the-interactive-interface)

Use this when you are already in the Copilot CLI interactive interface and need a `/command`.

---

## Commands

| Command | Description |
|---------|-------------|
| `/add-dir PATH` | Add a directory to the allowed list for file access. |
| `/agent` | Browse and select from available agents. |
| `/ask QUESTION` | Ask a quick side question without adding to conversation history. Experimental mode only. |
| `/allow-all [on\|off\|show]`, `/yolo [on\|off\|show]` | Enable all permissions: tools, paths, and URLs. |
| `/changelog [summarize] [VERSION\|last N\|since VERSION]`, `/release-notes [...]` | Display the CLI changelog. Add `summarize` for an AI-generated summary. |
| `/chronicle <standup\|tips\|improve\|reindex>` | Session history tools and insights. |
| `/clear [PROMPT]`, `/new [PROMPT]`, `/reset [PROMPT]` | Start a new conversation. |
| `/clikit [COMPONENT]` | Preview CLI business components, such as quota info. |
| `/collect-debug-logs [file\|gist] [PATH]` | Collect debug logs to an archive file or GitHub gist. |
| `/compact [FOCUS-INSTRUCTIONS]` | Summarize conversation history to reduce context usage. Optional focus instructions steer the summary. |
| `/context` | Show context-window token usage and visualization. |
| `/copy` | Copy the last response to the clipboard. |
| `/cwd`, `/cd [PATH]` | Change working directory or display the current directory. |
| `/delegate [PROMPT]` | Delegate changes to a remote repository with an AI-generated pull request. |
| `/diagnose [PROMPT]` | Analyze the current session log and optionally prompt the agent about diagnostics. |
| `/diff` | Review changes in the current directory; auto-switches to branch diff when the working tree is clean. Experimental. |
| `/downgrade <VERSION>` | Download and restart into a specific CLI version. Team accounts only. |
| `/env` | Show loaded environment details: instructions, MCP servers, skills, agents, plugins, LSPs, extensions. |
| `/exit`, `/quit` | Exit the CLI. |
| `/extensions [manage\|mode]`, `/extension` | Manage CLI extensions. |
| `/experimental [on\|off\|show]` | Toggle, set, or show experimental features. |
| `/feedback`, `/bug` | Provide feedback about the CLI. |
| `/fleet [PROMPT]` | Enable parallel subagent execution of task parts. |
| `/help` | Show help for interactive commands. |
| `/ide` | Connect to an IDE workspace. |
| `/init` | Initialize Copilot custom instructions and agentic features for this repository. |
| `/instructions` | View and toggle custom instruction files. |
| `/keep-alive [on\|off\|busy\|DURATION]`, `/caffeinate [...]` | Prevent sleep while a session is active, while the agent is busy, or for a duration such as `30m`, `2h`, `1d`. |
| `/list-dirs` | Display directories with allowed file access. |
| `/login` | Log in to Copilot. |
| `/logout` | Log out of Copilot. |
| `/lsp [show\|test\|reload\|help] [SERVER-NAME]` | Manage language-server configuration. |
| `/mcp [show\|add\|edit\|delete\|disable\|enable\|auth\|reload] [SERVER-NAME]` | Manage MCP server configuration. |
| `/model`, `/models [MODEL]` | Select the AI model. |
| `/permissions [show\|reset]` | View or clear in-memory tool and path approvals for the current session. |
| `/plan [PROMPT]` | Create an implementation plan before coding. |
| `/plugin [marketplace\|install\|uninstall\|update\|list] [ARGS...]` | Manage plugins and plugin marketplaces. |
| `/pr [view\|create\|fix\|auto]` | Manage pull requests for the current branch. |
| `/remote [on\|off]` | Show remote-control status, enable remote steering, or end the remote connection. |
| `/rename [NAME]` | Rename the current session; auto-generates a name if omitted. Alias for `/session rename`. |
| `/research TOPIC` | Run deep research using GitHub search and web sources. |
| `/reset-allowed-tools` | Reset the list of allowed tools. |
| `/restart` | Restart the CLI while preserving the current session. |
| `/resume [SESSION-ID]`, `/continue [SESSION-ID]` | Switch to another session, optionally specifying a session ID. |
| `/review [PROMPT]` | Run the code-review agent to analyze changes. |
| `/rubber-duck [PROMPT]` | Consult the rubber-duck agent for a second opinion on plans, code, or tests. |
| `/sandbox [enable\|disable]` | Configure shell command sandboxing. |
| `/search [QUERY]`, `/find [QUERY]` | Search the conversation timeline. Experimental mode only. |
| `/session [info\|checkpoints [n]\|files\|plan\|rename [NAME]\|cleanup\|prune\|delete [ID]\|delete-all]`, `/sessions [...]` | Show session information and manage sessions. `info` shows session details including the session link. |
| `/share [file\|html\|gist] [session\|research] [PATH]`, `/export [...]` | Share the session to Markdown, interactive HTML, or GitHub gist. |
| `/skills [list\|info\|add\|remove\|reload] [ARGS...]` | Manage skills. |
| `/statusline`, `/footer` | Configure status-line items. |
| `/tasks` | View and manage subagents and shell commands. |
| `/terminal-setup` | Configure terminal multiline input support. |
| `/theme [default\|dim\|high-contrast\|colorblind]` | View or set the color mode. |
| `/tuikit [colors\|icons\|select\|tabbar]` | Preview TUIkit design-system components and color tokens. |
| `/undo`, `/rewind` | Rewind the last turn and revert file changes. |
| `/update`, `/upgrade` | Update the CLI to the latest version. |
| `/usage` | Display session usage metrics and statistics. |
| `/user [show\|list\|switch]` | Manage the current GitHub user. |
| `/version` | Display version information and check for updates. |

---

## Related Sections

- [keys.md](keys.md) for keybindings around `/diff`, `/resume`, and timeline search.
- [mcp.md](mcp.md) for `/mcp` behavior.
- [agents.md](agents.md) for `/agent`, `/skills`, `/review`, `/rubber-duck`, and subagents.
