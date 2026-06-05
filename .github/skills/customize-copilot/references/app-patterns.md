# App Patterns

This repo's runtime architecture is intent-driven UI, not a generic chatbot. Preserve the app seam first, then decide whether Copilot SDK, MCP, or skills belong behind it.

## Core App Seam

```txt
Responder(messages, context) -> chat reply
Director(messages, context, mounted) -> UIPlan
```

Rules:
- Keep `Responder` and `Director` as injected function contracts.
- Keep `UIPlan` parsing at the boundary.
- Reconcile the Director's desired end state against mounted widgets.
- Do not couple the core engine directly to any provider SDK.

## Extensibility Layers

| Layer | Owns | Example |
|---|---|---|
| App core | State, registry, `UIPlan`, reconcile | `Workspace`, `WidgetRegistry`, `parsePlan` |
| App adapter | Calls a model/provider and returns `Responder`/`Director` output | OpenAI adapter, Copilot SDK adapter |
| MCP | External tool/data access | GitHub issues, browser, analytics, CRM, docs search |
| Agent Skill | Workflow knowledge for developers/agents | "How to create a new widget pack" |
| Custom Agent | Specialized role/persona/tool constraints | "Intent UI reviewer" |
| Plugin | Distributable bundle | skill + agent + MCP config for teams |

## When To Use Copilot SDK In An App

Use the Copilot SDK if the app intentionally embeds Copilot's agent runtime:
- you want sessions, multi-turn state, streaming events, tools, MCP servers, custom agent personas, and Copilot CLI/runtime integration;
- you accept SDK version churn and permission/security handling;
- you can wrap it behind `Responder`/`Director` so the engine stays provider-agnostic.

Do **not** use Copilot SDK just because you need one LLM call. For a normal app model call, implement a simple provider adapter behind the same seam.

## When To Use MCP In An App

Use MCP when Copilot or your SDK-hosted agent needs live external capabilities:
- fetch GitHub issues or PRs;
- query analytics or product data;
- run browser automation;
- search docs or a design system catalog;
- call safe internal tools.

Keep MCP tools narrow and typed. Tool descriptions must describe when to use the tool. Do not expose broad shell/database access when a narrow tool will do.

## When To Use Skills For Apps

Use Agent Skills to teach agents **how to operate** the app/project:
- how to create a widget pack;
- how to design a Director plan;
- how to test a multi-turn UI journey;
- how to add a provider adapter;
- how to decide SDK vs MCP vs provider API.

Skills are not runtime application code. They are workflow knowledge for AI agents.

## Adapter Shape For Adaptive-UI

A Copilot SDK adapter should look like this conceptually:

```ts
export function createCopilotResponder(/* sdk deps */): Responder {
  return async ({ messages, context }) => {
    // call SDK session, stream or collect text
    // return ChatReply
  };
}

export function createCopilotDirector(/* sdk deps */): Director {
  return async ({ messages, context, mounted, availableKinds }) => {
    // call SDK/tool-enabled session
    // parse JSON plan with parsePlan()
    // return UIPlan or Result-wrapped failure
  };
}
```

Rules:
- Keep provider errors as typed `Result`/adapter errors, not raw throws.
- Never let model JSON bypass schema parsing.
- Never let a model invent widget kinds not registered locally.
- Keep deterministic fake adapters for tests.

## Security And UX

- Avoid `approveAll` in production SDK integrations.
- Prefer explicit tool allowlists and permission handlers.
- Persist sessions only when user-visible continuity is intended.
- Surface streaming reply and UI-plan latency separately in the app.
- Keep the user in control: undo, dismiss, pin, clarify intent.
