---
name: copilot-refs
description: "Use local /copilot-references (or mistyped /copilot-refrences) as the first source for GitHub Copilot CLI and Copilot SDK implementation details. Use when working on Copilot SDK adapters, sessions, tools, MCP, hooks, plugins, skills, custom agents, CLI automation, or when confirming API/event names before coding."
argument-hint: "[copilot cli/sdk/customization question]"
user-invocable: true
---

# Copilot Refs

Use this skill when a task needs **implementation-accurate GitHub Copilot CLI or Copilot SDK details** from the local `copilot-references/` snapshot.

The user may say `/copilot-refs`, `/copilot-references`, or `/copilot-refrences`; resolve all of them to the local `copilot-references/` folder.

## Mission

Route agents to the right local reference file before they guess from memory or reuse unverified examples. Use this especially for Copilot SDK, CLI, MCP, hooks, plugin, skill, custom-agent, and session/event APIs.

## When To Use

Use this skill for questions or implementation work involving:

- `@github/copilot-sdk` Node/TypeScript APIs;
- Copilot SDK sessions, streaming events, tools, custom agents, MCP servers, hooks, plugin directories, session persistence, cloud/remote sessions;
- Copilot CLI commands, slash commands, permissions, tools, automation, hooks, MCP, telemetry, plugins;
- confirming exact event names, config shapes, option names, or generated protocol types;
- checking an upstream Awesome Copilot example against local references;
- implementing a Copilot SDK adapter behind Adaptive-UI's `Responder` / `Director` seams.

Do **not** use this skill for Adaptive-UI implementation standards. Those live in `.github/instructions/*.instructions.md`.

## Reference Map

Start with the nearest README or index, then drill down.

| Need | Start here |
|---|---|
| Copilot CLI overview | `copilot-references/copilot-cli/README.md` |
| CLI commands / flags / slash commands | `copilot-references/copilot-cli/cli/commands.md`, `options.md`, `slash.md` |
| CLI tools and permissions | `copilot-references/copilot-cli/cli/tools.md`, `permissions.md` |
| CLI automation / CI / prompt mode | `copilot-references/copilot-cli/automation.md` |
| CLI hooks | `copilot-references/copilot-cli/cli/hooks.md` |
| CLI MCP | `copilot-references/copilot-cli/cli/mcp.md` |
| CLI skills and agents | `copilot-references/copilot-cli/cli/agents.md` |
| CLI plugins | `copilot-references/copilot-cli/plugins.md` |
| SDK overview | `copilot-references/copilot-sdk/README.md` |
| SDK setup path | `copilot-references/copilot-sdk/docs/setup/choosing-a-setup-path.md` |
| SDK Node/TS public types | `copilot-references/copilot-sdk/nodejs/src/types.ts` |
| SDK Node/TS client/session APIs | `copilot-references/copilot-sdk/nodejs/src/client.ts`, `session.ts` |
| SDK event names and event payloads | `copilot-references/copilot-sdk/nodejs/src/generated/session-events.ts` |
| SDK feature index | `copilot-references/copilot-sdk/docs/features/index.md` |
| SDK custom agents | `copilot-references/copilot-sdk/docs/features/custom-agents.md` |
| SDK skills | `copilot-references/copilot-sdk/docs/features/skills.md` |
| SDK MCP | `copilot-references/copilot-sdk/docs/features/mcp.md` |
| SDK hooks | `copilot-references/copilot-sdk/docs/features/hooks.md`, `docs/hooks/*.md` |
| SDK plugin directories | `copilot-references/copilot-sdk/docs/features/plugin-directories.md` |
| SDK streaming events | `copilot-references/copilot-sdk/docs/features/streaming-events.md` |
| SDK troubleshooting | `copilot-references/copilot-sdk/docs/troubleshooting/index.md` |
| SDK protocol version | `copilot-references/copilot-sdk/sdk-protocol-version.json` |

## Workflow

1. **Classify the task**: CLI operation, SDK implementation, MCP, hook, plugin, skill/agent, or troubleshooting.
2. **Read the nearest README/index** to orient yourself.
3. **For SDK code, prefer source/types over prose**:
   - `nodejs/src/types.ts`
   - `nodejs/src/client.ts`
   - `nodejs/src/session.ts`
   - `nodejs/src/generated/session-events.ts`
4. **For CLI behavior, prefer focused CLI docs** under `copilot-references/copilot-cli/cli/`.
5. **For implementation in this app**, keep Copilot SDK behind Adaptive-UI seams:
   ```txt
   Responder(messages, context) -> chat reply
   Director(messages, context, mounted) -> UIPlan
   ```
6. **Cross-check when version-critical**: local references are a snapshot. If package versions or public docs matter, inspect installed package types and/or current official docs.
7. **Report which local files you used** when answering or implementing.

## Trust Hierarchy

For exact SDK implementation details:

1. installed package types in `node_modules` (if present);
2. local SDK source/types under `copilot-references/copilot-sdk/nodejs/src/`;
3. local SDK docs under `copilot-references/copilot-sdk/docs/`;
4. official live docs / package README;
5. Awesome Copilot examples and snippets.

For exact CLI behavior:

1. local focused CLI docs under `copilot-references/copilot-cli/cli/`;
2. `copilot-references/copilot-cli/automation.md` and `plugins.md` for those surfaces;
3. live CLI docs if behavior appears version-sensitive.

## Gotchas

- **Do not trust memory for SDK event names.** Read `generated/session-events.ts`.
- **Do not treat SDK snippets as authority.** Confirm `defineTool`, `mcpServers`, model-listing, connection, and session APIs against `types.ts` and installed package types.
- **Do not mix CLI, SDK, and Agent Skill concepts.** CLI skills/agents are configuration/runtime surfaces; SDK sessions are application runtime surfaces; repo Agent Skills are workflow knowledge.
- **Do not expose SDK details in the Adaptive-UI core.** Wrap them in adapters behind `Responder`/`Director`.
- **Do not read the whole folder up front.** Use the map and load only the focused references needed for the task.

## Output Expectations

When using this skill, state:

- which `copilot-references/` files were consulted;
- whether local references, installed types, or live docs were the authority;
- any version, persistence, or compatibility constraints;
- the resulting implementation or recommendation.
