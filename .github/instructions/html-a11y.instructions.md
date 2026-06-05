---
description: "HTML semantics, accessibility, and generative-UI interaction standards for intent-ui-kit: landmarks, ARIA live regions for streaming chat, focus management for materializing/dissolving widgets, native dialog/popover/inert, WCAG 2.2, and the chat-first 'feel' (persist-don't-reset, density caps, optimistic latency). Use when authoring Svelte markup, chat surfaces, widgets, or any interactive UI."
applyTo: "**/*.svelte"
---

# HTML, Accessibility & Interaction Standards — intent-ui-kit

The canvas mutates **without page navigation**, so accessibility is structural, not cosmetic. Semantics and the generative-UI "feel" are part of the product's identity — encode them as rigorously as layout.

## 1. Landmarks & document structure
- One `<main>` wraps the conversation + canvas. Surrounding zones are `<aside>` / `<section>`, each with a **unique accessible name**. Prefer `aria-labelledby` pointing at visible/visually-hidden text; use `aria-label` only when no translatable label exists.
- Each widget is an `<article>` (self-contained) with an accessible name (a heading or `aria-label`).
- Provide a **"skip to conversation"** link before peripheral zones.
- **Prefer translatable names.** `aria-label` is **not** translated by browser translation tools (still true in 2026). Where a visible label or `aria-labelledby` pointing at visible text is possible, use it; reserve bare `aria-label` for icon-only controls with no visible text.
- **Heading discipline in a dynamic layout.** Widgets materialize into different zones in non-DOM-visual order, so a naive `<h2>`-per-widget outline becomes chaotic. Rules:
  - The zone is the structural level; each widget title is the **same** level within its zone (e.g. all widget titles `<h3>` under a zone's `<h2>`), regardless of mount order.
  - Don't compute heading level from runtime position. Keep it fixed by role (`banner`/`side`/`rail`/`primary`), so the outline is stable as widgets come and go.
  - A widget with no meaningful heading uses `aria-label` on its `<article>`, not an empty heading.
- **Decouple reading/tab order from visual order.** Because zones use `auto-fit` grids, visual order can diverge from DOM order. Keep DOM order = intended reading order. Where visual order must differ, `reading-flow` / `reading-order` (Chromium-led, stabilizing via Interop 2026) can realign tab + SR order to the visual grid — treat as **progressive enhancement**, and keep DOM order sensible as the baseline.
```svelte
<a class="skip-link" href="#conversation">Skip to conversation</a>
<main>
  <section id="conversation" aria-labelledby="conversation-title">
    <h2 id="conversation-title" class="sr-only">Conversation</h2>
    …
  </section>
  <aside aria-labelledby="side-widgets-title">
    <h2 id="side-widgets-title" class="sr-only">Side widgets</h2>
    …
  </aside>
  <aside aria-labelledby="rail-widgets-title">
    <h2 id="rail-widgets-title" class="sr-only">Rail widgets</h2>
    …
  </aside>
</main>
```

## 2. The chat log (streaming live region)
- Transcript container: `role="log"` — this **implies** `aria-live="polite"`. Set `aria-live="polite"` explicitly anyway for clarity and testability. Do **not** add `aria-atomic` (it would re-announce the whole log).
- Stream by **appending** message nodes; never rebuild an existing paragraph (rebuilding re-announces it).
- Reserve `aria-live="assertive"` for urgent system errors only — `assertive` interrupts and is hostile during a long reply.
- Widget zones are **not** the chat log — materializing a widget must **not** push a live-region announcement. Keep widgets outside the `role="log"` subtree.
- **Throttle streaming announcements.** Character-by-character token streaming overwhelms screen readers with constant re-announcements. Do **not** let each token announce:
  - Mark the actively streaming message `aria-busy="true"`; flip to `false` when the turn completes so the SR announces the settled message, **or**
  - batch appended text at **sentence/clause boundaries** rather than per token.
- **Honor the live-region init window.** A live region (or widget zone) injected into the DOM needs the accessibility tree to register it (~2s) before injected text reliably announces. The skeleton-before-hydrate pattern already provides this gap — keep the container mounted first, then fill it.
```svelte
<div class="log" role="log" aria-live="polite" aria-labelledby="conversation-title">
  {#each messages as m (m.id)}
    <article class="msg" data-role={m.role} aria-busy={m.streaming}><p>{m.content}</p></article>
  {/each}
</div>
```

## 3. Focus management for materialize / dissolve
- **Materializing a widget must not steal focus.** Only an explicitly user-invoked surface (opening a detail/modal) takes focus.
- A modal/detail surface uses native `<dialog>.showModal()` — it auto-`inert`s the rest of the page, traps focus, restores focus to the opener on close, and closes on Esc.
- For non-dialog overlays/drawers, set the `inert` attribute on the background and pair it with a visibly dimmed state (inertness is invisible otherwise).
- **Prefer `inert` over `aria-hidden`.** `inert` removes a subtree from the tab order **and** the accessibility tree **and** blocks pointer interaction; `aria-hidden` only hides from AT and leaves focusable controls reachable (a trap). Use `aria-hidden` only for purely decorative nodes, never to "disable" a region.
- **Never** `outline: none` without a `:focus-visible` replacement.
- Honor **WCAG 2.2 §2.4.11 "Focus Not Obscured"** — the floating composer/dock must not cover the focused element (use `scroll-margin` + ensure stacking).

## 4. Transient surfaces (dialog / popover)
- Use native `<dialog>` (+ `::backdrop`) for modals and the `popover` attribute for menus/tooltips — both render in the **top layer** (no z-index management).
- **Pick the right popover type:**
  - `popover="auto"` — menus / detail panels (light-dismiss; closes other auto popovers).
  - `popover="hint"` — widget **rationale** and tooltips. It does **not** dismiss an open `auto` popover, so a hint won't blow away an open menu/detail panel. Progressive enhancement (newer platform surface); use `popover="auto"` + focus/hover parity as the baseline where `hint` is unavailable.
  - `popover="manual"` — only when you fully own dismissal.
- **Prefer declarative invocation (Invoker Commands API).** Wire triggers with `command` / `commandfor` instead of JS `.showModal()` where supported — the browser handles top-layer, focus move/restore, and Esc. Progressive enhancement (Chromium 135+ / Safari TP in 2026); keep the `.showModal()` path as the fallback. If both `commandfor` and `popovertarget` are present, `commandfor` wins.
  ```svelte
  <button commandfor="detail" command="show-modal">Details</button>
  <dialog id="detail" closedby="closerequest">
    <button commandfor="detail" command="close">Close</button>
  </dialog>
  ```
- **`closedby` for dialogs** declares what dismisses them: `none` | `closerequest` (Esc / platform close) | `any` (adds light-dismiss) — replaces hand-rolled Esc/backdrop listeners. Progressive enhancement.
- Content-on-hover (**WCAG 1.4.13**) must be: **dismissible** (Esc), **hoverable** (cursor can reach it), **non-obscuring**, and reachable on focus/tap.
- **Attach the widget rationale with `aria-description`** (supplementary text, distinct from `aria-describedby` which references an id). It voices "showing this because you asked …" without needing a visible target node.
- Icon-only triggers need an `aria-label`. Dialogs need `aria-labelledby` (its heading) or `aria-label`.

## 5. Forms (the composer)
- Label the textarea (`aria-label` if there is no visible label).
- Keep an accessible submit control; **disable it while a turn is in flight**.
- Clear the input **optimistically** on submit; announce send failures as a status message (`role="status"`), not a thrown error.
- Auto-grow the textarea with CSS `field-sizing: content` (see CSS standards), not a JS resize handler.
```svelte
<form onsubmit={submit}>
  <textarea aria-label="Message" bind:value={draft}></textarea>
  <button type="submit" disabled={workspace.thinking || !draft.trim()} aria-label="Send">↑</button>
</form>
```

## 6. Touch & pointer
- **No hover-only affordances.** Mirror every hover control with `:focus-within` or always-visible state under `@media (hover: none) and (pointer: coarse)`.
- Tap targets ≥ 44–48px, ≥ 8px apart. Sticky bottom composer; horizontally scrollable suggestion chips (not wrapped).
- Mirror any gesture (swipe-to-dismiss) with a visible control.
- **Watch:** the Interest Invoker API (`interesttarget` + `interest-delay`) aims to make hover/focus-revealed UI a platform primitive that handles keyboard, touch, and pointer together. Early development — don't depend on it yet, but it's the eventual replacement for hand-wired hover affordances here.

## 7. Display-preference media queries
Widgets derive subtle colors (oklch). Account for the user's display environment:
- `prefers-reduced-motion: reduce` — collapse decorative motion (see CSS standards).
- `prefers-contrast: more / less` — strengthen borders/text separation when `more` is requested; don't rely on subtle tints alone to convey state.
- `forced-colors: active` — Windows High Contrast overrides your tokens entirely. Use system color keywords where needed, keep focus indicators visible, and don't encode meaning only in a derived color (pair it with text/icon/border).

## 8. WCAG 2.2 baseline (and where it's heading)
- §2.4.7 Focus Visible — every interactive element has a visible `:focus-visible` indicator.
- §2.4.11 Focus Not Obscured (AA) — focused element ≥ 50% visible.
- §2.5.8 Target Size (AA) — ≥ 24×24px minimum; this kit targets 44–48px.
- §1.4.13 Content on Hover/Focus — dismissible, hoverable, non-obscuring.
- §2.3.3 honor `prefers-reduced-motion`.
- **Trajectory (WCAG 3.0).** 2.2 AA is the legal baseline and what we ship to. WCAG 3.0 (working draft 2026; not final before ~2028) shifts from binary element-level pass/fail to **scored, journey-level outcomes** — "can a screen-reader user complete this task?" not "does every button have a label?". For a dynamic, generative UI that maps better than element checks: validate whole flows (state intent → widget materializes → act → dismiss), not just static snapshots. The W3C's emerging guidance on AI-generated content echoes our **"never render hallucinated data"** rule at the standards level.

---

# Generative-UI "feel" (interaction identity — encode it like layout)

This is what makes the kit *intent-first* rather than "a chatbot with widgets." Treat each as a rule.

- **Persist, don't reset.** A new turn **keeps** existing widgets and layers in new ones. Widgets dissolve only on explicit dismiss, a "clear" intent, or a real relevance change. Stable widget `id`s give object permanence — the reconciler keeps/updates instead of rebuilding.
- **Cap density.** Default ≤ **2 new widgets per turn**, ranked by relevance. **First turn = chat + at most one widget.** Offer "show more" rather than flooding.
- **Seed the cold start.** Never a blank canvas — seed a hint/suggestion surface that teaches intent ("try: show Q3 revenue · compare to last year · plan my tasks"). Suggestions are specific, not "ask me anything."
- **Show your work.** A materialized widget can surface a short rationale ("showing this because you asked …") plus obvious **dismiss / pin** affordances.
- **Progressive disclosure & perceived latency.**
  - 0ms: user message appears optimistically; input clears instantly.
  - ~50–150ms: Responder text starts streaming in place.
  - ~200–500ms: Director's widgets show a **skeleton** in reserved space.
  - then: skeletons **hydrate** seamlessly into real content.
  - No skeleton under ~1s; skeleton for 1–10s; explicit progress only beyond ~10s.
  - **a11y of the swap:** skeletons are decorative — `aria-hidden="true"`, no announcement. On *refresh* of an already-loaded widget, set `aria-busy="true"` on the frame until it settles. The implementation pattern (`<svelte:boundary>` `pending`/`failed`, `$effect.pending()`) lives in `svelte.instructions.md` §9–10.
- **No thrash.** Debounce rapid resubmits (<500ms); skeleton-before-hydrate so stale data never flashes; **pinned widgets are never replaced**.
- **Steerable & reversible.** Let the user correct the interpretation ("I meant weekly"), dismiss/pin widgets, and undo a turn (chat + canvas together).
- **Never render hallucinated data.** A real Director calls real data tools or stays chat-only; widgets show their source. No fabricated numbers in charts/metrics.
- **Ambient over intrusive.** Low-priority context goes inline (a sparkline in text) or to peripheral zones (`side`/`rail`), not a full center widget.

## Failure modes to avoid
- Decision paralysis from too many auto-generated widgets → enforce the density cap.
- Widget flicker/thrash on rapid corrections → debounce + skeleton-before-hydrate + never replace pinned.
- Canvas wipe on every turn → persist via stable ids and the reconcile diff.
- Over-announcing to screen readers when widgets appear → keep widgets outside `role="log"`.
- Focus theft on materialize → only user-invoked surfaces take focus.
