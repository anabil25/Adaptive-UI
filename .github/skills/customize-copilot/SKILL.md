---
name: customize-copilot
description: "Create, review, debug, and adapt GitHub Copilot customizations and app extensibility: Agent Skills, instructions, prompts, custom agents, hooks, MCP configs, plugins, and Copilot SDK adapters. Use when asked to create a skill, update Copilot instructions, build a prompt/agent, add MCP, choose skill vs SDK vs extension, or integrate Copilot-like agent behavior into an app."
argument-hint: "[customization or app extensibility goal]"
user-invocable: true
---

# Customize Copilot

Use this skill when the user asks to create, review, debug, install, or choose among GitHub Copilot customizations, or when they ask how to expose Copilot-like extensibility inside an app.

## Mission

Pick the smallest correct primitive, implement it with valid structure, and validate that it actually loads or works. For app work, separate **workflow knowledge** from **external tools** and from **embedded agent runtime**.

## Non-goals

- Do not restate Adaptive-UI implementation standards. Route to the repo instructions instead:
  - `.github/copilot-instructions.md`
  - `.github/instructions/css.instructions.md`
  - `.github/instructions/html-a11y.instructions.md`
  - `.github/instructions/svelte.instructions.md`
  - `.github/instructions/typescript.instructions.md`
  - `.github/instructions/testing.instructions.md`
- Do not add SDK, MCP, hooks, plugins, or custom agents when a prompt or skill is enough.
- Review, adapt, attribute, and validate any community skill before adopting it.
- Do not put secrets, tokens, API keys, or tenant-specific credentials into customization files.

## Workflow

1. **Classify the request.** Use [choose.md](./references/choose.md).
2. **Inspect existing local customizations.** Check `.github/copilot-instructions.md`, `.github/instructions/`, `.github/skills/`, `.github/prompts/`, `.github/agents/`, `.github/hooks/`, and MCP config if present.
3. **Choose the smallest primitive.** Prefer instructions for standards, skills for workflows, MCP for external tools/data, and SDK only when an app embeds an agent runtime.
4. **If the user cares about app extensibility, load** [app-patterns.md](./references/app-patterns.md).
5. **If SDK implementation is involved, load** [sdk.md](./references/sdk.md) and confirm the installed SDK types before coding.
  - If exact Copilot CLI/SDK API, event, option, hook, plugin, MCP, or generated protocol details are needed, use the `copilot-refs` skill and the local `copilot-references/` folder first.
6. **If adopting upstream customizations, load** [adopt.md](./references/adopt.md).
7. **Validate before declaring done.** Use [validate.md](./references/validate.md).
8. **When creating a new skill, start from** [SKILL.template.md](./templates/SKILL.template.md).

## Primitive Summary

| Need | Use |
|---|---|
| Broad repo-wide standards | `.github/copilot-instructions.md` or `AGENTS.md` |
| File/domain-specific standards | `.github/instructions/*.instructions.md` |
| One reusable prompt users invoke manually | `.github/prompts/*.prompt.md` |
| Multi-step reusable workflow with references/scripts/templates | `.github/skills/<name>/SKILL.md` |
| Specialized persona, model, tools, handoffs | `.github/agents/*.agent.md` |
| Deterministic lifecycle enforcement | `.github/hooks/*.json` |
| External APIs, data, tools, browser, GitHub operations | MCP server/config |
| App embeds Copilot agent runtime | Copilot SDK adapter |
| Distributable bundle of skills/agents/hooks/MCP | Plugin |

## App Extensibility Rule

For Adaptive-UI and intent-based UI apps, keep the app's own seam first:

```txt
Responder(messages, context) -> chat reply
Director(messages, context, mounted) -> UIPlan
```

A Copilot SDK integration should be an **adapter behind those seams**, not the core engine. MCP should expose external tools/data used by those adapters. Agent Skills should teach workflows and operating procedures; they are not runtime UI code.

## Gotchas

- **Skill folder name must match `name`.** `customize-copilot/SKILL.md` must say `name: customize-copilot`.
- **Descriptions are routing.** Copilot often sees only `name` and `description` during discovery. Include trigger words.
- **Resources do not load unless referenced.** Link reference files from `SKILL.md` with relative Markdown links.
- **SDK examples are not authority.** Confirm installed `@github/copilot-sdk` types and local `copilot-references/` before writing code.
- **MCP is executable capability.** Treat local MCP servers and hooks like code dependencies: review args, pin versions, avoid broad toolsets, never hardcode secrets.
- **Do not reward-hack validation.** If a customization does not load, fix the structure or description; do not claim success from an unverified file.

## Output Expectations

When this skill is used, return:

- the chosen primitive and why;
- files created/updated;
- validation performed;
- any security, compatibility, or version constraints;
- follow-up options only if they materially change the path.
