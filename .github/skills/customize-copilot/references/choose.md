# Choose A Primitive

Use this matrix before creating or editing any Copilot customization.

## Choose The Primitive

| User intent | Correct primitive | Why |
|---|---|---|
| "Always follow these repo rules" | `copilot-instructions.md` / `AGENTS.md` | Always-on architectural and behavioral context |
| "For Svelte/CSS/tests, use these rules" | `.github/instructions/*.instructions.md` | File or domain scoped, auto-attached by `applyTo` |
| "Make this reusable prompt" | `.github/prompts/*.prompt.md` | Single focused manual task with variables |
| "Create a reusable workflow with references/templates/scripts" | `.github/skills/<name>/SKILL.md` | On-demand capability, progressive loading, portable |
| "Create a specialist reviewer/planner with tool restrictions" | `.github/agents/*.agent.md` | Persistent persona, tools, model, handoffs |
| "Run a formatter/block dangerous commands every time" | `.github/hooks/*.json` | Deterministic enforcement at lifecycle events |
| "Give Copilot access to this API/database/browser/GitHub operation" | MCP server/config | External tool/data access |
| "Build an app that embeds Copilot's agent runtime" | Copilot SDK | Application runtime integration |
| "Ship a bundle of skills/agents/hooks/MCP to others" | Plugin | Installable package of customizations |

## Decision Rules

- If it is **policy**, use instructions.
- If it is **procedure**, use a skill.
- If it is **one prompt**, use a prompt file.
- If it is **persona + tool permissions**, use a custom agent.
- If it must **always run**, use a hook.
- If it needs **external capability**, use MCP.
- If your **application hosts the agent runtime**, use the Copilot SDK.
- If you need **distribution of many primitives**, use a plugin.

## Adaptive-UI Examples

| Task | Primitive |
|---|---|
| Svelte 5 coding conventions | Already covered by `.github/instructions/svelte.instructions.md` |
| Creating an intent-widget authoring workflow | Skill |
| Creating a UI design review persona | Custom agent |
| Calling a live analytics/data source for a Director | MCP server + app adapter |
| Embedding Copilot sessions in a demo app | Copilot SDK adapter behind `Responder`/`Director` |
| Blocking test reward hacking automatically | Hook, if instructions are not enough |

## Avoid

- Do not create a skill for simple always-on coding rules.
- Do not create MCP servers for pure documentation or workflow knowledge.
- Do not create hooks unless deterministic enforcement is worth the execution/security cost.
- Do not create a plugin until there are multiple related primitives to distribute.
