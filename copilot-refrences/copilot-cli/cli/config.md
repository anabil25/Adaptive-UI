# Environment Variables and Configuration Files

> Source sections: [Environment variables](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#environment-variables), [Configuration file settings](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#configuration-file-settings)

Use this for env-var based configuration, settings files, config precedence, and repository/local settings.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `COLORFGBG` | Fallback for dark/light terminal background detection. |
| `COPILOT_ALLOW_ALL` | Set to `true` to allow all permissions automatically. Equivalent to `--allow-all`. |
| `COPILOT_AUTO_UPDATE` | Set to `false` to disable automatic updates. |
| `COPILOT_CACHE_HOME` | Override the cache directory for marketplace caches, auto-update packages, and other ephemeral data. |
| `COPILOT_CUSTOM_INSTRUCTIONS_DIRS` | Comma-separated list of additional directories for custom instructions. |
| `COPILOT_EDITOR` | Editor command for interactive editing. Checked after `$VISUAL` and `$EDITOR`. Defaults to `vi`. |
| `COPILOT_ENABLE_HTTP2` | Set to `1` or `true` to opt into HTTP/2 transport. HTTP/1.1 is default. |
| `COPILOT_GH_HOST` | GitHub hostname for Copilot CLI only, overriding `GH_HOST`. |
| `COPILOT_GITHUB_TOKEN` | Authentication token. Takes precedence over `GH_TOKEN` and `GITHUB_TOKEN`. |
| `COPILOT_HOME` | Override the configuration and state directory. Default: `$HOME/.copilot`. |
| `COPILOT_MODEL` | Set the AI model. |
| `COPILOT_PROMPT_FRAME` | Set to `1` or `0` to enable or disable the decorative UI frame around the input prompt. |
| `COPILOT_SKILLS_DIRS` | Comma-separated list of additional directories for skills. |
| `COPILOT_SUBAGENT_MAX_CONCURRENT` | Maximum concurrent subagents across the session tree. Default: 32. Range: 1-256. |
| `COPILOT_SUBAGENT_MAX_DEPTH` | Maximum subagent nesting depth. Default: 6. Range: 1-256. |
| `GH_HOST` | GitHub hostname for both GitHub CLI and Copilot CLI. Default: `github.com`. Override with `COPILOT_GH_HOST` for Copilot only. |
| `GH_TOKEN` | Authentication token. Takes precedence over `GITHUB_TOKEN`. |
| `GITHUB_COPILOT_PROMPT_MODE_EXTENSIONS` | Set to `true` to load project extensions and allow extension management tools in prompt mode (`-p`). |
| `GITHUB_COPILOT_PROMPT_MODE_REPO_HOOKS` | Set to `true` to load repository hooks in prompt mode (`-p`). |
| `GITHUB_COPILOT_PROMPT_MODE_WORKSPACE_MCP` | Set to `true` to load workspace MCP sources in prompt mode (`-p`). |
| `GITHUB_TOKEN` | Authentication token. |
| `PLAIN_DIFF` | Set to `true` to disable rich diff rendering. |
| `USE_BUILTIN_RIPGREP` | Set to `false` to use the system ripgrep instead of the bundled version. |
| `COPILOT_CLI_ENABLED_FEATURE_FLAGS` | Comma-separated list of feature flags to enable. |

---

## Configuration File Settings

Settings cascade from user to repository to local, with more specific scopes overriding general ones. Command-line flags and environment variables take highest precedence.

> User settings were previously stored in `~/.copilot/config.json`. Existing user-editable settings in that location are automatically migrated to `~/.copilot/settings.json` on startup.

| Scope | Location | Purpose |
|-------|----------|---------|
| User | `~/.copilot/config.json` / migrated to `~/.copilot/settings.json` | Global defaults for all repositories. Use `COPILOT_HOME` for an alternate path. |
| Repository | `.github/copilot/settings.json` | Shared repository configuration. Committed. |
| Local | `.github/copilot/settings.local.json` | Personal overrides. Add to `.gitignore`. |

---

## User Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `allowed_urls` | string[] | `[]` | URLs or domains allowed without prompting. |
| `alt_screen` | boolean | `false` | Use the terminal alternate screen buffer. |
| `auto_update` | boolean | `true` | Automatically download CLI updates. |
| `banner` | `"always"` / `"once"` / `"never"` | `"once"` | Animated banner display frequency. |
| `bash_env` | boolean | `false` | Enable BASH_ENV support for bash shells. |
| `beep` | boolean | `true` | Play an audible beep when attention is required. |
| `compact_paste` | boolean | `true` | Collapse large pastes into compact tokens. |
| `custom_agents.default_local_only` | boolean | `false` | Only use local custom agents. |
| `denied_urls` | string[] | `[]` | URLs or domains blocked. Takes precedence over `allowed_urls`. |
| `experimental` | boolean | `false` | Enable experimental features. |
| `include_coauthor` | boolean | `true` | Add a Co-authored-by trailer to git commits made by the agent. |
| `companyAnnouncements` | string[] | `[]` | Custom messages shown randomly on startup. |
| `log_level` | enum | `"default"` | Logging verbosity: none, error, warning, info, debug, all, default. |
| `model` | string | varies | AI model to use. |
| `powershell_flags` | string[] | `["-NoProfile", "-NoLogo"]` | Flags passed to PowerShell on startup. Windows only. |
| `reasoning_effort` | enum | `"medium"` | Reasoning effort: low, medium, high, xhigh. |
| `render_markdown` | boolean | `true` | Render Markdown in terminal output. |
| `screen_reader` | boolean | `false` | Enable screen-reader optimizations. |
| `stream` | boolean | `true` | Enable streaming responses. |
| `store_token_plaintext` | boolean | `false` | Store auth tokens in plaintext when no system keychain is available. |
| `streamer_mode` | boolean | `false` | Hide preview model names and quota details. |
| `theme` | `"auto"` / `"dark"` / `"light"` | `"auto"` | Terminal color theme. |
| `trusted_folders` | string[] | `[]` | Folders with pre-granted file access. |
| `update_terminal_title` | boolean | `true` | Show the current intent in the terminal title. |

---

## Repository Settings

| Setting | Type | Merge Behavior | Description |
|---------|------|----------------|-------------|
| `companyAnnouncements` | string[] | Replaced; repository takes precedence. | Messages shown randomly on startup. |
| `enabledPlugins` | Record<string, boolean> | Merged; repository overrides user for same key. | Declarative plugin auto-install. |
| `extraKnownMarketplaces` | Record<string, object> | Merged; repository overrides user for same key. | Plugin marketplaces available in this repository. |
| `marketplaces` | Record<string, object> | Merged; repository overrides user for same key. | Deprecated; use `extraKnownMarketplaces`. |

---

## Local Settings

`.github/copilot/settings.local.json` uses the same schema as repository settings and takes precedence over it. It is for personal overrides and should not be committed.

---

## Related Sections

- [options.md](options.md) for flag equivalents.
- [agents.md](agents.md) for agent and skill path behavior.
- [telemetry.md](telemetry.md) for OTel environment variables.
