---
description: "Svelte 5 runes + TypeScript standards for intent-ui-kit: typed $props, $state/$derived/$effect discipline (incl. effect cleanup), .svelte.ts reactive stores via getters, Component<P> dynamic rendering (no svelte:component), Snippet typing, callback-prop events, async Svelte (await + <svelte:boundary>), attachments (@attach), $inspect/$state.snapshot/$state.eager, the legacy→runes ban list, and the mandatory autofixer workflow. Use when authoring or editing any .svelte component or .svelte.ts module."
applyTo: "**/*.svelte, **/*.svelte.ts"
---

# Svelte 5 Standards — intent-ui-kit

**Svelte 5 runes only.** This kit is a published library: component prop types are part of the public API, so typing is not optional.

## 0. Autofixer workflow (mandatory)
Every component you write or edit **must** be run through the Svelte autofixer (`svelte-mcp` → `svelte-autofixer`). Keep calling it until it returns **zero issues and zero suggestions** *before* presenting code. Then run `npm run check`. The autofixer catches the exact mistakes banned below.

## 1. The legacy → runes ban list
| Never (legacy) | Always (runes) |
|---|---|
| `export let prop` | `let { prop } = $props()` |
| `$: x = expr` | `let x = $derived(expr)` |
| `$: sideEffect()` | `$effect(() => sideEffect())` |
| `on:click` | `onclick` |
| `createEventDispatcher` | callback props `(arg: T) => void` |
| `<svelte:component this={C}/>` | `<C />` (direct reference) |
| `<slot/>` / `let:x` | `{@render children()}` / `{#snippet}` |
| `$$props`, `$$restProps` | `let { ...rest } = $props()` |
| `beforeUpdate` / `afterUpdate` | `$effect.pre` / `$effect` |
| `use:action` (new DOM code) | `{@attach fn}` (reactive, returns cleanup) |
| `onMount`/`onDestroy` for DOM work | `$effect` / `{@attach}` with teardown return |
| `{#await}` for new async data | `await` + `<svelte:boundary>` *(needs `experimental.async`)* |
| manual `AbortController` in fetches | `getAbortSignal()` from `svelte` |
| `$: console.log(x)` (debug) | `$inspect(x)` (dev-only, reactive) |
| `<script context="module">` | `<script module>` |

## 2. Typed props
A typed `Props` interface destructured from `$props()`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    value?: number;
    onselect?: (id: string) => void;        // events are callback props
    open?: boolean;                          // two-way → mark $bindable below
    children?: Snippet<[active: boolean]>;   // content is a typed Snippet
  }

  let { label, value = 0, onselect, open = $bindable(false), children, ...rest }: Props = $props();
</script>

{#if children}{@render children(open)}{/if}
```
- Optional callbacks replace events. Multiple handlers → wrap in one function.
- Two-way binding is **explicit** via `$bindable()`.
- Forward extra attributes with `...rest`.

## 3. Dynamic components (the widget registry)
Type stored components as `Component<P>` (from `svelte`) and render them directly — **never** `<svelte:component>`:
```svelte
<script lang="ts">
  import type { Component } from 'svelte';
  import type { WidgetInstance, WidgetProps } from '$lib/core/types';

  let { workspace, instance }: { workspace: Workspace; instance: WidgetInstance } = $props();
  const def = $derived(workspace.registry.get(instance.kind));
</script>

{#if def}
  {@const Widget = def.component}
  <Widget {instance} />
{/if}
```
Use `ComponentProps<typeof X>` when wrapping a known component.

## 4. State: `$state` / `$derived` / `$effect` discipline
- Declare reactive values with `$state<T>()` — **never a bare `let`** for anything reactive.
- `$state.raw` for large/immutable values or class instances you replace wholesale.
- **Compute with `$derived` / `$derived.by`, not `$effect`.** Deriving inside an effect is the most common autofixer flag.
- Use `$effect` **only** for genuine side effects — auto-scroll, subscriptions, external sync. Scope dependencies with `untrack`.
```svelte
<script lang="ts">
  let scroller = $state<HTMLDivElement | null>(null);
  const messages = $derived(workspace.messages);

  $effect(() => {
    void messages.length;            // track length only
    if (scroller) scroller.scrollTop = scroller.scrollHeight;  // side effect
  });
</script>
```
- `$effect` runs client-only; `$effect.pre` for pre-DOM timing (e.g. autoscroll-before-paint).
- **Always return a teardown** from effects that create intervals, subscriptions, or observers — it runs before the effect re-runs and on destroy. Missing cleanup is the most common `$effect` leak:
  ```svelte
  $effect(() => {
    const obs = new IntersectionObserver(onIntersect);
    obs.observe(node);
    return () => obs.disconnect(); // teardown
  });
  ```
- For DOM-node side effects (observers, chart libs, autoscroll on a specific element) prefer an **attachment** `{@attach}` over `$effect` — it's element-scoped, reactive, and returns its own cleanup. See §11.

## 5. `.svelte.ts` reactive stores
Reactive state in a `.svelte.ts` module is exposed via **getters/methods**, never as destructured values — **reactivity does not survive destructuring**.
```ts
// workspace.svelte.ts
export class Workspace {
  messages = $state<ChatMessage[]>([]);
  widgets  = $state<WidgetInstance[]>([]);
  thinking = $state(false);

  get registry(): WidgetRegistry { return this.#registry; }
  async send(content: string) { /* runs the two-call loop + reconcile */ }
}
export function createWorkspace(opts: WorkspaceOptions) { return new Workspace(opts); }
```
In components, read the instance and `$derived` from it — do **not** destructure:
```svelte
<script lang="ts">
  let { workspace }: { workspace: Workspace } = $props();
  const thinking = $derived(workspace.thinking);   // ✅
  // const { thinking } = workspace;                // ❌ loses reactivity
</script>
```

## 6. Snippets & content
- Content is a `Snippet<[Args]>` prop, rendered with `{@render snippet(args)}`. `children` replaces the default slot.
- Always key `{#each}`: `{#each items as item (item.id)}`.

## 7. Library authoring specifics
- `svelte` is a **peer dependency** (`^5`). Don't bundle it.
- **No `$app/*` imports inside `src/lib`** — the package must work outside SvelteKit. Use `esm-env` (`BROWSER`, `DEV`) for environment checks.
- Re-export every public component and its `Props` type from `src/lib/index.ts` so consumers get full intellisense in the generated `.d.ts`.

## 8. Widget component shape
A widget owns **only its internal content layout** — placement, frame chrome, and lifecycle belong to `WidgetFrame` + `Zone`:
```svelte
<script lang="ts">
  import type { WidgetProps } from '$lib/core/types';
  interface MetricProps extends Record<string, unknown> { label: string; value: string }
  let { instance }: WidgetProps<MetricProps> = $props();
  const p = $derived(instance.props);
</script>

<div class="metric">
  <span class="label">{p.label}</span>
  <span class="value">{p.value}</span>
</div>

<style>
  .metric { display: grid; gap: var(--space-2xs); } /* internal layout only */
</style>
```

## 9. Async, loading & errors (`await` + `<svelte:boundary>`)
**Only widgets that `await` external data need a boundary.** Most widgets (e.g. `metric`, `note`) receive fully-resolved props from the Director and render synchronously — do **not** wrap them in a `<svelte:boundary>` or a skeleton. Reach for the pattern below only when a widget fetches its own data. Defensive blanket-wrapping is an anti-pattern here.

Svelte's async model is built for this kit's data-tool calls and skeleton-before-hydrate flow. **It requires the `experimental.async` compiler flag until Svelte 6** — treat as the intended direction, opt-in, not yet on by default. When enabled:
- `await` works directly in `$derived` and markup; wrap async regions in `<svelte:boundary>` and let it drive states declaratively:
  ```svelte
  <svelte:boundary>
    {@const Widget = registry.get(instance.kind).component}
    <Widget {instance} />

    {#snippet pending()}<WidgetSkeleton kind={instance.kind} />{/snippet}
    {#snippet failed(error, reset)}
      <WidgetError {error} onretry={reset} />
    {/snippet}
  </svelte:boundary>
  ```
- **`pending` shows only on first resolution.** For *subsequent* updates use `$effect.pending()` (count of in-flight promises in the boundary) to show a subtle "refreshing" state, not a full skeleton.
- **Abort stale work with `getAbortSignal()`** (from `svelte`) — it aborts when the derived/effect re-runs, so rapid corrections cancel superseded fetches automatically. Replaces manual `AbortController`.
- **Granular boundaries, not one global one.** Wrap each widget so one slow/failed widget never blocks the others (directly serves the density/feel rules in `html-a11y.instructions.md`).
- **`failed` snippet is the widget fault wall.** Every widget that touches external data renders inside a boundary; a bad/failed payload yields a retry surface, never a blank or hallucinated render. (See the TS "never render hallucinated data" / parse-at-boundary rules.)
- **Gotcha:** inside a `pending` snippet, component DOM is created but lifecycle (`$effect`, `onMount`, `use:`, `{@attach}`) does **not** run. A delayed-skeleton must use **CSS `animation-delay`**, not an effect timer (see `css.instructions.md` §15).

## 10. Progressive rendering (the cross-layer stack)
The kit's core interaction pattern spans all three domains; assemble it from these pieces rather than hand-rolling loading booleans:
1. **Svelte** — `<svelte:boundary>` `pending`/`failed` for load/error; `await` in `$derived` + `getAbortSignal()` for fetch + cancel; `$effect.pending()` for refresh indicators.
2. **CSS** — skeleton shimmer + "no skeleton under 1s" via `animation-delay`; `@starting-style` entrance on swap; `content-visibility: auto` for off-screen widgets; `interpolate-size: allow-keywords` for skeleton→auto height (all in `css.instructions.md` §6, §15).
3. **HTML/a11y** — skeleton `aria-hidden`; `aria-busy` on refresh; widgets stay outside `role="log"` (in `html-a11y.instructions.md` §2).
Never gate the whole canvas on the slowest source; reserve space to avoid layout shift; keep optimistic UI for user actions (`$state.eager` below).

## 11. Attachments over actions (`{@attach}`)
For DOM-node work (observers, autoscroll, chart/library integration) prefer attachments to `use:` actions — they're reactive (re-run when read state changes) and return their own cleanup:
```svelte
<div {@attach (node) => {
  const obs = new IntersectionObserver(onIntersect);
  obs.observe(node);
  return () => obs.disconnect();
}}>…</div>
```
- Attachments can be declared inline, applied conditionally, and spread via `createAttachmentKey` (library-internal); convert an existing library action with `fromAction` (from `svelte/attachments`).

## 12. Debugging, snapshots & optimistic state
- **`$inspect(value)`** — dev-only, reactive logging of the workspace/registry/widget graph; auto-stripped from production. Use it instead of `$: console.log`.
- **`$state.snapshot(value)`** — unwrap a reactive proxy to a plain value before handing state to a data tool, logger, `structuredClone`, or any external API. Required whenever engine state crosses out of Svelte (ties to the TS "calls real data tools" boundary).
- **`$state.eager(value)`** — read the latest value synchronously for immediate user-action feedback (e.g. reflecting a just-sent message / active selection while an `await` resolves). Use sparingly; let Svelte coordinate updates otherwise.
- **`$props.id()`** — stable per-instance id; fits the widget object-permanence / reconcile model.
- Not targets here, noted for completeness: `$host()` (custom-element host — only if the kit ever ships web components) and `createRawSnippet` (build a snippet from JS — library internals/tests only).

See `typescript.instructions.md` for type-architecture rules, `css.instructions.md` for the `<style>` block, and `html-a11y.instructions.md` for markup semantics.
