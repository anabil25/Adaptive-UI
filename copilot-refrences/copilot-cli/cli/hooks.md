# Hooks

> Source section: [Hooks reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#hooks-reference)

Use this for hook lifecycle events, hook JSON, permission decisions, and hook tool names.

---

## Hook Events

| Event | Description | Can Control? |
|-------|-------------|--------------|
| `sessionStart` | A new or resumed session begins. | No |
| `sessionEnd` | The session terminates. | No |
| `userPromptSubmitted` | The user submits a prompt. | No |
| `preToolUse` | Before each tool executes. | Yes, can allow, deny, ask, or modify. |
| `postToolUse` | After each tool completes. | No |
| `agentStop` | The main agent finishes a turn. | Yes, can block and force continuation. |
| `subagentStop` | A subagent completes. | Yes, can block and force continuation. |
| `errorOccurred` | An error occurs during execution. | No |

---

## Hook Configuration

Hooks are external commands that execute during a CLI session. Hook configuration files use JSON format with version `1` and load automatically from `.github/hooks/*.json`.

### Command Hooks

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "type": "command",
        "bash": "your-bash-command",
        "powershell": "your-powershell-command",
        "cwd": "optional/working/directory",
        "env": { "VAR": "value" },
        "timeoutSec": 30
      }
    ]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"command"` | Yes | Must be `"command"`. |
| `bash` | string | One of bash/powershell | Shell command for Unix. |
| `powershell` | string | One of bash/powershell | Shell command for Windows. |
| `cwd` | string | No | Working directory, relative to repo root or absolute. |
| `env` | object | No | Environment variables. Supports variable expansion. |
| `timeoutSec` | number | No | Timeout in seconds. Default: 30. |

### Prompt Hooks

Prompt hooks auto-submit text as if the user typed it. They are supported only on `sessionStart` and run before any initial prompt passed via `--prompt`.

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "prompt",
        "prompt": "Your prompt text or /slash-command"
      }
    ]
  }
}
```

---

## Decision Control

### `preToolUse`

A `preToolUse` hook can control tool execution by writing JSON to stdout.

| Field | Values | Description |
|-------|--------|-------------|
| `permissionDecision` | `"allow"`, `"deny"`, `"ask"` | Whether the tool executes. Empty output uses default behavior. |
| `permissionDecisionReason` | string | Reason shown to the agent. Required when decision is `"deny"`. |
| `modifiedArgs` | object | Substitute tool arguments to use instead of the original arguments. |

### `agentStop` / `subagentStop`

| Field | Values | Description |
|-------|--------|-------------|
| `decision` | `"block"`, `"allow"` | `"block"` forces another agent turn using `reason` as the prompt. |
| `reason` | string | Prompt for the next turn when decision is `"block"`. |

---

## Tool Names for Hook Matching

| Tool Name | Description |
|-----------|-------------|
| `bash` | Execute shell commands on Unix. |
| `powershell` | Execute shell commands on Windows. |
| `view` | Read file contents. |
| `edit` | Modify file contents. |
| `create` | Create new files. |
| `glob` | Find files by pattern. |
| `grep` | Search file contents. |
| `web_fetch` | Fetch web pages. |
| `task` | Run subagent tasks. |

If multiple hooks of the same type are configured, they execute in order. For `preToolUse`, any hook returning `"deny"` blocks the tool. Hook failures are logged and skipped; they never block agent execution.
