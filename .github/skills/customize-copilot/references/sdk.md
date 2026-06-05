# SDK

Use this only when the task is about building with `@github/copilot-sdk`. Treat the installed SDK types and local `copilot-references/` source as the implementation contract before writing code.

## When SDK Is The Correct Primitive

Use Copilot SDK when your app needs to embed a Copilot-powered agent runtime with sessions, streaming, tools, custom agents, MCP servers, and permission handling.

Do not use it for:
- repo coding standards;
- project workflow documentation;
- simple one-shot LLM calls;
- exposing an external API to Copilot (use MCP instead).

## Stateless vs Stateful Use

There are two different "one shot" paths:

1. **Shell/automation one-shot:** use Copilot CLI prompt mode:
  ```bash
  copilot -p "Summarize this repository" -s --no-ask-user
  ```
  This is best when you want a scriptable completion and no VS Code chat UI/history. Add narrow `--allow-tool=...` permissions only when the prompt needs tools. Use `--share` only when you explicitly want a transcript file.

2. **App/runtime one-shot:** use the SDK, but create an **ephemeral session** and clean it up:
  - do **not** pass a stable `sessionId`;
  - do **not** call `resumeSession`;
  - keep `enableSessionStore: false` and avoid persistent/infinite-session features unless you intentionally want resumability;
  - for production multi-user/server integrations, use `mode: "empty"` when you want optional ambient features disabled by default, and provide its required config (`baseDirectory` or `sessionFs`, plus explicit session `availableTools`) from the installed SDK types;
  - call `session.disconnect()` and `client.stop()` when done.

Important nuance: the SDK always uses a session object for a turn. "Stateless" means **not resumable/durable beyond the operation**, not "no session exists internally". If you provide a stable `sessionId`, enable persistence/session store, remote sessions, or infinite sessions, you are choosing stateful behavior and must manage retention/deletion.

If a session was intentionally persisted and should be removed, `disconnect()` is not enough — it releases in-memory resources but preserves resumable data. Use `client.deleteSession(sessionId)` to permanently remove persisted session data.

## TypeScript Implementation Pattern

Use this shape for an ephemeral SDK call in app code:

```ts
import { CopilotClient, approveAll, defineTool } from '@github/copilot-sdk';

const client = new CopilotClient();
try {
  const session = await client.createSession({
    onPermissionRequest: approveAll,
    enableSessionStore: false,
    infiniteSessions: { enabled: false },
    streaming: true,
    tools: []
  });

  try {
    const response = await session.sendAndWait({ prompt: 'Hello' }, 60_000);
    console.log(response?.data.content);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

Before writing production code, confirm these surfaces in the installed types:
- `CopilotClient` constructor and lifecycle (`start`, `stop`, connection options);
- `createSession`, `resumeSession`, `send`, `sendAndWait`, `abort`, `disconnect`;
- `enableSessionStore`, `infiniteSessions`, `sessionId`, `remoteSession`, and `sessionIdleTimeoutSeconds` when deciding stateless vs stateful behavior;
- `SessionEvent` discriminants and event data fields;
- `defineTool` signature;
- `mcpServers` shape;
- model listing method (prefer runtime discovery over hardcoded names).

## SDK API Guardrails

- **Local types are the contract.** Awesome Copilot and web snippets are examples, not authority.
- Recent Node examples use `defineTool('tool_name', config)`. Confirm the installed `defineTool` signature before adding tools.
- Event names use dot/snake style, e.g. `assistant.message_delta`, `session.idle`, `session.error`, `tool.execution_start`, `tool.execution_complete`.
- Streaming sends both delta and final events. Handle deltas for UX and final events for canonical output.
- Use `client.listModels()` when present; do not use `getModels()` unless the installed package exposes it.
- `mcpServers` is represented as a record keyed by server name in the local Node types; use that shape unless the installed package differs.
- CLI bundling differs by language/package. Confirm runtime setup from the installed SDK and local `copilot-references/copilot-sdk/README.md`.
- `approveAll` is useful for demos and dangerous for production. Use a real permission handler and tool allowlists.
- `disconnect()` is not deletion. If the app made a resumable session, call `client.deleteSession(sessionId)` when retention is no longer desired.

## Safe SDK Branch For Adaptive-UI

If implementing a real Copilot-backed adapter:
1. Keep `Responder`/`Director` as the app contracts.
2. Create adapter factories, e.g. `createCopilotResponder` and `createCopilotDirector`.
3. Use SDK sessions internally.
4. Parse Director output through the repo's `parsePlan()`/schema boundary.
5. Keep deterministic fake adapters for tests.
6. Add contract tests that every adapter must pass.

## Tool Definition Rules

- Tool names should be snake_case and purpose-specific.
- Tool descriptions must say when the tool should be called.
- Parameters must be schema-validated (Zod or JSON Schema).
- Tool handlers must return JSON-serializable data or the SDK's typed tool result object if supported.
- Never expose broad shell/database/network capabilities when a narrow tool is enough.

## Event Handling Rules

- Subscribe with a cleanup/unsubscribe function if the SDK provides one.
- Always handle `session.error`.
- Wait for `session.idle` or `sendAndWait` before assuming a turn is complete.
- For streaming, aggregate deltas for display but use final messages for persisted transcript state where available.

## Reference Sources

- https://github.com/github/copilot-sdk
- https://www.npmjs.com/package/@github/copilot-sdk
- https://github.com/github/awesome-copilot/tree/main/skills/copilot-sdk
- https://raw.githubusercontent.com/github/awesome-copilot/main/instructions/copilot-sdk-nodejs.instructions.md
