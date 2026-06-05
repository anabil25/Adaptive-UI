# intent-ui-kit — Project Overview & Standards Router

> A chat-first, intent-driven UI kit (SvelteKit 5 component library). The user states intent in a chat; **two LLM calls per turn** produce (a) a chat reply (`Responder`) and (b) a declarative UI plan (`Director`). Widgets **materialize, persist, and dissolve** across layout **zones** (`banner`, `primary`, `side`, `rail`) around the conversation. A persistent **running context** models the user's goal so the canvas evolves across turns instead of resetting.

## Non-negotiables (apply everywhere)
- **Svelte 5 runes only.** `$state`, `$props`, `$derived`, `$effect`, `$bindable`, `onclick`, `class:`, `{@render}`, `{#snippet}`.
- **Never legacy.** No `export let`, `$:`, `on:click`, `createEventDispatcher`, `<svelte:component>`, `<slot>`, `$$props`, `$$restProps`, `beforeUpdate`/`afterUpdate`.
- **Run the Svelte autofixer on every component you write or edit** (`svelte-mcp` → `svelte-autofixer`). Keep calling it until it returns zero issues and zero suggestions *before* presenting code. Then run `npm run check`.
- **Key every `{#each}`**: `{#each items as item (item.id)}`.
- **Tokens are law.** All spacing, color, sizing, motion, and type values come from `:root` in `src/lib/styles/global.css`. No raw structural pixels, no one-off hex.
- This is a **library**: `src/lib` is the published package; `src/routes` is the demo. The public API is exactly what `src/lib/index.ts` exports — keep it deliberate.

## Domain standards (auto-attach by file type)
Detailed, current best practices live in scoped instruction files under `.github/instructions/`. They attach automatically when you touch matching files — read them when working in that domain:

| File | Applies to | Covers |
|---|---|---|
| `instructions/css.instructions.md` | `*.css`, `*.svelte` | Design tokens, fluid scales, single-owner-per-axis, intrinsic layout, container queries, `@starting-style`/View Transitions motion, OKLCH/`color-mix` derivation, `@layer`, elevation |
| `instructions/html-a11y.instructions.md` | `*.svelte` | Landmarks, `role="log"` streaming live regions, focus management for materialize/dissolve, `<dialog>`/`popover`/`inert`, WCAG 2.2, and the generative-UI "feel" (persist-don't-reset, density caps, optimistic latency, no thrash) |
| `instructions/typescript.instructions.md` | `*.ts` | **TS 6.0 baseline**; discriminated unions + exhaustiveness, kind→props registry typing (`NoInfer`), pluggable `Responder`/`Director` seams, parse-at-boundary validation, `Result` + combinators, erasable-syntax-only, `using`/Temporal, export discipline |
| `instructions/svelte.instructions.md` | `*.svelte`, `*.svelte.ts` | Typed `$props`, `$state`/`$derived`/`$effect` (+ teardown), `.svelte.ts` getter stores, `Component<P>` dynamic rendering, snippets, callback-prop events, async Svelte (`await` + `<svelte:boundary>`), attachments (`@attach`), the autofixer workflow |
| `instructions/testing.instructions.md` | `*.test.ts`, `*.spec.ts`, `*.svelte.test.ts`, `*.test-d.ts`, e2e/test config | Test pyramid + ownership map, Vitest projects (node engine + browser components), reconcile/registry/parse-boundary units, `vitest-browser-svelte` + runes/store tests, Playwright journeys, axe a11y, async `<svelte:boundary>`/cancellation, schema/property fuzzing, mocked LLM seams, visual/CSS, CI gates |

## Architecture at a glance
```
user message
   ├─► Responder(messages, context) ──────────► chat reply (streams)
   └─► Director(messages, context, mounted) ──► UIPlan ──► reconcile(diff vs mounted)
                                                  │           absent → dissolve
                                                  │           new    → materialize
                                                  │           shared → update in place
                                                  └─► updates running context
```
The Director emits the **desired end-state** of the canvas; the engine diffs it (never imperative removes). Both calls are mocked offline now (`mockResponder`, `mockDirector`) with one clean seam each for a real LLM.

**Progressive rendering** (skeleton → hydrate → materialize) is the kit's core cross-layer pattern: Svelte owns orchestration (`<svelte:boundary>` `pending`/`failed`), CSS owns the visuals (skeleton shimmer, `content-visibility`, `@starting-style`), HTML owns the a11y (`aria-busy`, skeletons `aria-hidden`). See `svelte.instructions.md` §10.

## File structure
- Core engine (framework-agnostic TS): `src/lib/core/` — `types.ts`, `registry.ts`, `resolvers.ts`, `workspace.svelte.ts`
- Components (shell / canvas / chat): `src/lib/components/`
- Widget pack: `src/lib/widgets/`
- Global tokens & primitives: `src/lib/styles/global.css`
- Public API barrel: `src/lib/index.ts`
- Demo app: `src/routes/`

## What lives where
| Element | Owns | Does NOT own |
|---|---|---|
| `WorkspaceCanvas.svelte` | zone grid, gutters (`--gutter`), bottom safe area, dock/composer placement | individual widget internals |
| `Zone.svelte` | the intrinsic grid of one region (`--zone-gap`, `--widget-min`); collapses when `:empty` | page gutters, widget content |
| `WidgetFrame.svelte` | enter/exit lifecycle + frame chrome (surface, radius, shadow, padding) | the widget's content |
| `widgets/*.svelte` | internal content layout only | placement, outer spacing, lifecycle |
| `ChatTranscript.svelte` | scrolling `role="log"` + auto-scroll | the composer, widget zones |
| `ChatComposer.svelte` | input surface + submit | the transcript; policy beyond calling `workspace.send()` |
| `Workspace` (core) | reactive state, the two-call loop, the reconcile diff | any DOM/CSS |

## Verify
After changes: run the **autofixer** on touched components → `npm run check` → `npm run build`. Inspect the demo at mobile/tablet/desktop for overflow, overlap, dock/composer behavior, and calm zone reflow as widgets enter and leave.

When writing tests, follow `instructions/testing.instructions.md`: engine logic (reconcile/registry/parse) as fast Node unit tests, components via `vitest-browser-svelte`, and multi-turn journeys via Playwright — deterministic always (injected fake `Responder`/`Director`, never a real model).
