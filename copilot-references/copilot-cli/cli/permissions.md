# Permissions and Feature Flags

> Source sections: [Permission approval responses](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#permission-approval-responses) and feature flag notes in the command reference.

Use this for permission prompt responses, persistent approvals, and known feature flags.

---

## Permission Approval Responses

When Copilot CLI prompts for permission, these keys are available:

| Key | Action |
|-----|--------|
| `y` | Allow this specific request once. |
| `n` | Deny this specific request once. |
| `!` | Allow all similar requests for the rest of the session. |
| `#` | Deny all similar requests for the rest of the session. |
| `?` | Show detailed information about the request. |

Session approvals reset when you run `/clear` or start a new session.

---

## Full Dialog Options

When the full dialog is shown, you may also choose:

| Option | Scope | Persistence |
|--------|-------|-------------|
| Once | Single use | None |
| This location | Until manually cleared | Saved to disk per location (git root or current directory). |
| Always | Permanent | Config file. |

Use `/permissions reset` to clear in-memory approvals for the current session.

---

## Feature Flags

| Feature | Status | Description |
|---------|--------|-------------|
| `AUTOPILOT_MODE` | experimental | Autonomous operation mode. |
| `BACKGROUND_AGENTS` | staff | Run agents in the background. |
| `QUEUED_COMMANDS` | staff | Queue commands while the agent is running. |
| `LSP_TOOLS` | on | Language Server Protocol tools. |
| `PLAN_COMMAND` | on | Interactive planning mode. |
| `AGENTIC_MEMORY` | on | Persistent memory across sessions. |
| `CUSTOM_AGENTS` | on | Custom agent definitions. |

---

## Related Sections

- [tools.md](tools.md) for `--allow-tool` and `--deny-tool` syntax.
- [options.md](options.md) for allow-all flags and permission-related startup flags.
- [automation.md](../automation.md) for non-interactive permission patterns.
