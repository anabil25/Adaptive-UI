# Interactive Interface Shortcuts

> Source sections: [Global shortcuts](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#global-shortcuts-in-the-interactive-interface), [Timeline shortcuts](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#timeline-shortcuts-in-the-interactive-interface), [Session picker shortcuts](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#session-picker-shortcuts), [Diff mode shortcuts](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#diff-mode-shortcuts), [Navigation shortcuts](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#navigation-shortcuts-in-the-interactive-interface)

Use this when you are inside the interactive TUI and need a keybinding.

---

## Global Shortcuts

| Shortcut | Description |
|----------|-------------|
| `@ FILENAME` | Include file contents in context. |
| `# NUMBER` | Include a GitHub issue or pull request in context. |
| `! COMMAND` | Execute a local shell command, bypassing Copilot. |
| `?` | Open quick help when the prompt is empty. |
| `Esc` | Cancel the current operation. |
| `Ctrl+C` | Cancel operation or clear input. Press twice to exit. |
| `Ctrl+D` | Shutdown. |
| `Ctrl+G` | Edit the prompt in an external editor (`$EDITOR`). |
| `Ctrl+L` | Clear the screen. |
| `Ctrl+Enter` or `Ctrl+Q` | Queue a message while the agent is busy. |
| `Ctrl+R` | Reverse-search command history. |
| `Ctrl+V` | Paste from clipboard as an attachment. |
| `Ctrl+X` then `/` | Run a slash command after starting a prompt. |
| `Ctrl+X` then `e` | Edit the prompt in an external editor (`$EDITOR`). |
| `Ctrl+X` then `b` | Promote the running task or shell command to the background. |
| `Ctrl+X` then `o` | Open the most recent link from the timeline. |
| `Ctrl+Z` | Suspend the process to the background on Unix. |
| `Shift+Enter` / `Option+Enter` on Mac / `Alt+Enter` on Windows/Linux | Insert a newline in the input. |
| `Shift+Tab` | Cycle between standard, plan, and autopilot mode. |

---

## Timeline Shortcuts

| Shortcut | Description |
|----------|-------------|
| `Ctrl+F` | Open timeline search. |
| `Ctrl+O` | Expand recent timeline items when the prompt input is empty. |
| `Ctrl+E` | Expand all timeline items when the prompt input is empty. |
| `Ctrl+T` | Expand or collapse reasoning display in responses. |
| `Page Up` / `Page Down` | Scroll the timeline up or down by one page. |

---

## Session Picker Shortcuts

The session picker opens via `/resume` or `--continue`.

| Shortcut | Description |
|----------|-------------|
| `Up` / `Down` | Move selection up or down. |
| `Enter` | Open the selected session. |
| `s` | Cycle sort order: relevance -> created -> name -> last used. |
| `Tab` | Switch between local and remote tabs. |
| `d` | Delete the selected session. |
| `Esc` | Close the picker. |

Sort modes:

| Mode | Description |
|------|-------------|
| `relevance` | Scores sessions by match to the current working directory. Default. |
| `last used` | Most recently modified sessions first. |
| `created` | Most recently created sessions first. |
| `name` | Alphabetical by session name; unnamed sessions sort last. |

Sessions already open in another window float to the top in non-relevance modes. When no working-directory context is available, `relevance` is skipped.

---

## Diff Mode Shortcuts

Diff mode opens via `/diff`.

| Shortcut | Description |
|----------|-------------|
| `Up` / `k` | Move selection up one line. |
| `Down` / `j` | Move selection down one line. |
| `Left` / `h` | Jump to the previous file. |
| `Right` / `l` | Jump to the next file. |
| `Home` | Jump to the first line. |
| `End` | Jump to the last line. |
| `Page Up` | Scroll up one page. |
| `Page Down` | Scroll down one page. |
| `Click` | Select the clicked diff line. Requires mouse support. |
| Mouse scroll | Scroll up or down. |
| `c` | Add or edit a comment on the selected line. |
| `s` | Show comments summary when comments exist. |
| `b` | Toggle between unstaged changes and branch diff. |
| `Enter` | Submit all comments when comments exist. |
| `r` | Refresh the diff for remote sessions. |
| `Esc` / `Ctrl+C` | Exit diff mode. |

Holding `Up` or `Down` accelerates scrolling after the first 10 rapid presses. Mouse support requires `--mouse` and is enabled by default in alt-screen mode. Disable with `--no-mouse`.

---

## Navigation Shortcuts

| Shortcut | Description |
|----------|-------------|
| `Ctrl+A` | Move to beginning of the line. |
| `Ctrl+B` | Move to the previous character. |
| `Ctrl+E` | Move to end of the line. |
| `Ctrl+F` | Move to the next character. |
| `Ctrl+G` | Edit the prompt in an external editor. |
| `Ctrl+H` | Delete the previous character. |
| `Ctrl+K` | Delete from cursor to end of line; if already at end, delete the line break. |
| `Ctrl+U` | Delete from cursor to beginning of the line. |
| `Ctrl+W` | Delete the previous word. |
| `Home` | Move to the start of the current visual line. |
| `End` | Move to the end of the current visual line. |
| `Ctrl+Home` | Move to the start of the text. |
| `Ctrl+End` | Move to the end of the text. |
| `Alt+Left/Right` on Windows/Linux or `Option+Left/Right` on Mac | Move the cursor by a word. |
| `Up` / `Down` | Navigate command history. |
| `Tab` / `Ctrl+Y` | Accept the current inline completion suggestion. |
