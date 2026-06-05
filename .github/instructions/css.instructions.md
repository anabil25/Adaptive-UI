---
description: "CSS / visual standards for intent-ui-kit: design tokens, fluid spacing, intrinsic layout, container queries, materialize/dissolve motion, OKLCH color derivation, elevation. Use when authoring or editing any CSS, :root tokens, or the <style> block of a Svelte component."
applyTo: "**/*.css, **/*.svelte"
---

# CSS & Visual Standards — intent-ui-kit

The canvas is a living surface: widgets **materialize, persist, and dissolve** across zones (`banner`, `primary`, `side`, `rail`) around a center chat. Layout must stay calm as content count changes every turn. All values come from `:root` in `src/lib/styles/global.css`.

## 1. Tokens are the single source of truth
- **Never** write a one-off structural value in component CSS. Consume a token, a `clamp()`/`min()`/`max()` expression, intrinsic sizing, or add a new **semantic** token to `:root`.
- Raw pixels are allowed **only** for true hairlines, icon strokes, and tiny non-layout details.
- Layer tokens: *primitive* (raw scale) → *semantic* (named for intent). Reference semantic tokens in components, never primitives directly.
- Register animatable/typed tokens with `@property` so they interpolate and validate:
  ```css
  @property --widget-span { syntax: "<integer>"; inherits: false; initial-value: 1; }
  ```

## 2. Fluid scales, not breakpoints
- Spacing/type scales use `clamp(min, preferred, max)` so they scale without media queries.
  ```css
  --space-md: clamp(1rem, 1.8vw, 1.5rem);
  --widget-min: clamp(15rem, 24vw, 22rem);
  ```
- **No media query may re-declare padding/gap/margin.** Media/container queries are for **layout changes only** (column count, zone collapse, dock mode).

## 3. Single owner per axis
Each spacing axis is owned by exactly one element:
- **Side gutters** → the workspace shell: `padding-inline: var(--gutter)`.
- **Bottom safe area** → the shell: `padding-block-end` (+ `env(safe-area-inset-bottom)` for the sticky composer).
- **Between stacked items** → the container: `display: grid; gap`.
- Child widgets set structural `padding: 0`; they own only their internal layout. `WidgetFrame` owns the frame padding, not the widget.

## 4. Intrinsic layout over breakpoints
Reach for these before any viewport breakpoint:
```css
.zone {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--widget-min)), 1fr));
  gap: var(--zone-gap);
  grid-auto-rows: max-content; /* widgets keep their own height; no stretch */
}
.zone:empty { display: none; } /* collapse empty zones, zero residual space */
```
- Use `minmax(0, 1fr)` to prevent grid blowout, `aspect-ratio`, `fit-content`, and **`subgrid`** (Baseline) for cross-card alignment.
- **Keep DOM order = reading order.** `auto-fit` (and any `order`/`grid-area` placement) can make visual order diverge from source order, which strands keyboard/SR users. Author the markup in the intended reading order; only realign visual→a11y order with `reading-flow` as progressive enhancement. See `html-a11y.instructions.md` §1.
- **Masonry / grid-lanes** is shipping unevenly (Safari first, others stabilizing through 2026). Treat it as **progressive enhancement**, never a base dependency — the auto-fit grid above is the floor, masonry is the upgrade:
  ```css
  @supports (grid-template-rows: masonry) {
    .zone { grid-template-rows: masonry; } /* packs tighter where supported */
  }
  ```

## 5. Container queries for component responsiveness
A widget that reflows because *its own* width changed uses container queries, not viewport queries.
```css
.zone-side { container-type: inline-size; container-name: side; }
@container side (min-width: 22rem) { .metric { grid-template-columns: 1fr auto; } }
```
- Name each zone container. Use `cqi` units for container-relative sizing.
- **Style queries** are limited to custom properties in 2026 — use only for token-driven variants, not arbitrary props.
- **Scroll-state queries** (`container-type: scroll-state`) style an element by its *scroll position* — no JS scroll listeners. Use for the sticky composer's "stuck" shadow and stuck zone headers (progressive enhancement; degrades to always-on shadow):
  ```css
  .composer-shell { container-type: scroll-state; }
  @container scroll-state(stuck: bottom) { .composer { box-shadow: var(--shadow-md); } }
  ```

## 6. Materialize / dissolve motion (CSS-first, no JS timers)
Prefer pure-CSS enter/exit via `@starting-style` + `transition-behavior: allow-discrete` (**Baseline 2024** — Chrome 117+, Safari 17.5+, Firefox 129+):
```css
.widget {
  opacity: 1; transform: translateY(0) scale(1);
  transition: opacity var(--life-enter), transform var(--life-enter),
              display var(--life-enter) allow-discrete;
}
@starting-style { .widget { opacity: 0; transform: translateY(10px) scale(0.98); } }
.widget[data-phase="exiting"] {
  opacity: 0; transform: translateY(-8px) scale(0.98);
  transition: opacity var(--life-exit), transform var(--life-exit);
}
```
- For coordinated **reorders**, use the View Transitions API (`document.startViewTransition`, same-document Baseline) — not manual FLIP. View Transitions Level 2 also covers cross-document (MPA) navigations via `@view-transition { navigation: auto }` — relevant only if the demo ever spans real routes.
- Keyframe `animation` driven by a `data-phase` attribute is acceptable when the frame must call back on `animationend` (the current `WidgetFrame` pattern).
- **Animating to/from `auto`** (e.g. a widget expanding to its natural height) finally works with `interpolate-size: allow-keywords` — set it once on `:root` and height/`grid-template-rows` transitions interpolate. Progressive enhancement (Chromium-led, stabilizing via Interop 2026); without it the transition simply snaps:
  ```css
  :root { interpolate-size: allow-keywords; }
  ```
- `will-change: transform, opacity` on actively animating frames only.

## 7. `prefers-reduced-motion` is first-class
Motion collapses to ~1ms, it is not removed ad hoc:
```css
@media (prefers-reduced-motion: reduce) {
  :root { --life-enter: 1ms; --life-exit: 1ms; }
}
```
Keep functional transitions (focus rings); drop decorative flourishes.

## 8. Derive color, never hand-pick it
- One source token per hue; derive tints/soft/hover with `color-mix(in oklch, …)` or relative color syntax:
  ```css
  --color-accent-soft: color-mix(in oklch, var(--color-accent) 16%, transparent);
  --color-accent-hover: oklch(from var(--color-accent) calc(l - 0.08) c h);
  ```
- Mix/derive in **oklch/oklab**, never sRGB (sRGB mixing greys out). `oklch()`, `color-mix()`, relative color, and `light-dark()` are all Baseline in 2026.
- **Foreground on derived surfaces:** prefer `contrast-color()` to auto-pick accessible text over an accent, but it is **not yet baseline** (Safari/Firefox 2025; Chrome via Interop 2026) — ship it as progressive enhancement over a token fallback, never as the only path:
  ```css
  .btn-accent { background: var(--color-accent); color: var(--color-on-accent); }
  @supports (color: contrast-color(red)) {
    .btn-accent { color: contrast-color(var(--color-accent)); }
  }
  ```
- **Never convey state by color alone** (WCAG 1.4.1). `--color-positive/warning/danger` always pair with an icon, text, or border so the meaning survives color-blindness and `forced-colors` (see `html-a11y.instructions.md` §7).
- Reserve `:root` source colors for hex/hsl; everything else is derived.
- Wrap library styles in `@layer` so consumers can override predictably:
  ```css
  @layer reset, base, components, utilities;
  ```
- **Scoping:** Svelte already scopes component `<style>`. Reach for `@scope` only inside `global.css` for donut-scoping a region (`@scope (.zone) to (.widget) { … }`); don't duplicate Svelte's component isolation.

## 9. Elevation & transient surfaces
- Floating chat/widgets layer with `--shadow-sm/md/lg` + `backdrop-filter` on overlay surfaces.
- Modals/menus/tooltips use the **top layer** — native `<dialog>` (`::backdrop`) and the `popover` attribute — so there are **no z-index wars**. Use `z-index` only for same-layer stacking.
- Animate dialog/popover with `@starting-style` + `overlay`/`display` `allow-discrete`.
- **Tether floating surfaces with CSS anchor positioning — not a JS positioning library.** Bind a popover/menu/tooltip to its trigger with `anchor-name` + `position-anchor`, place it with `position-area`, and self-correct overflow with `position-try-fallbacks`. Progressive enhancement (Chromium shipped; Safari/Firefox stabilizing via Interop 2026) — pair with the top-layer fallback so unsupported browsers still center/stack sanely:
  ```css
  .trigger { anchor-name: --trigger; }
  .menu[popover] {
    position-anchor: --trigger;
    position-area: block-end span-inline-end;
    position-try-fallbacks: flip-block, flip-inline;
  }
  ```

## 10. Logical properties always
`padding-inline`, `margin-block`, `inset-inline-start`, `border-inline-start`, `inline-size`, `block-size` — never physical `left/right/top/bottom/width/height` for layout.

## 11. Zero layout shift on reflow
- New widgets **append**; existing widgets must not jump. `grid-auto-rows: max-content`, reserve space with skeletons during the 1–10s hydrate window, `:empty { display: none }`.
- Use `scroll-margin-block-start` on scroll targets so the floating composer never covers them.

## 12. Touch & hover parity
- Hover is **never** the only path. Under `@media (hover: none) and (pointer: coarse)`, widget controls (pin/dismiss/rationale) are shown via `:focus-within` or always visible.
- Interactive targets ≥ `var(--tap-target)` (44–48px); ≥ 8px between targets.

## 13. Scroll-driven reveal (zones & transcript)
For reveal-on-scroll and scroll-progress effects in scrolling zones/transcript, bind animation to a scroll/view timeline instead of JS scroll listeners or `IntersectionObserver`. Always gate behind reduced-motion **and** `@supports` so it is purely additive:
```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .msg {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 60%;
    }
    @keyframes reveal { from { opacity: 0; translate: 0 8px; } to { opacity: 1; translate: 0 0; } }
  }
}
```
For DOM-order stagger, prefer `nth-child()`-based delays (Baseline). Avoid `sibling-index()`/`sibling-count()` stagger for now — Chromium-only, not GA.

## 14. Form controls & typography
- **Auto-growing composer:** `field-sizing: content` makes the textarea grow with input — no JS resize. Cap it so it never eats the canvas:
  ```css
  .composer textarea { field-sizing: content; min-block-size: 2lh; max-block-size: 8lh; }
  ```
- **Typography:** `text-wrap: balance` on headings; `text-wrap: pretty` on body/widget prose to avoid orphans in variable-width cards. Both degrade to normal wrapping.

## 15. Progressive-rendering surfaces (skeletons & off-screen widgets)
The loading→content flow is orchestrated in Svelte (`<svelte:boundary>` `pending`/`failed`; see `svelte.instructions.md` §9–10) — CSS owns its visuals:
- **Skeleton shimmer is pure CSS** (no JS timer). Honor "no skeleton under ~1s" with `animation-delay`, not JS:
  ```css
  .skeleton {
    background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-raised) 50%, var(--color-surface) 75%);
    background-size: 200% 100%;
    opacity: 0;
    animation: shimmer 1.5s infinite, sk-fade 0.2s 1s forwards; /* skeleton only appears after 1s */
  }
  @keyframes shimmer { to { background-position: -200% 0; } }
  @keyframes sk-fade { to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) { .skeleton { animation: sk-fade 0.2s 1s forwards; } }
  ```
  Mark skeletons `aria-hidden="true"` (decorative) — see `html-a11y.instructions.md` §2.
- **Off-screen widgets in scrolling zones** use `content-visibility: auto` + `contain-intrinsic-block-size` to skip render work while staying in the DOM/a11y tree and reserving height (no scroll jump):
  ```css
  .widget-frame {
    --widget-estimated-block: 12rem;
    content-visibility: auto;
    contain-intrinsic-block-size: auto var(--widget-estimated-block);
  }
  ```
- The skeleton→content swap entrance uses `@starting-style` (§6); height settling from fixed skeleton to natural `auto` uses `interpolate-size: allow-keywords` (§6).

## Right primitive for the job
CSS Grid for 2D (zones, modals, card grids); Flexbox for 1D (button rows, metadata rows, wrapping clusters). Prefer global `.cluster` / `.stack` primitives over local wrappers.

## Verify
After any layout change: `npm run check` → `npm run build`, then inspect the demo at mobile/tablet/desktop for overflow, overlap, dock/composer behavior, calm zone reflow as widgets enter/leave, and modal/popover behavior.

## Not yet — do not depend on (revisit as they reach GA)
Chromium-only or experimental as of 2026; do not build core patterns on these: native `@function`, `@mixin`/`@apply`, inline `if()`, `sibling-index()`/`sibling-count()`, advanced typed `attr()`, gap decorations (`row-rule`/`column-rule`), `corner-shape`, `appearance: base-select`. Use only behind `@supports` as throwaway enhancement, never as a dependency.
