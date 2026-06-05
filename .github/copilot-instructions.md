# Blog-Svelte — Coding Conventions

## Svelte Version
- **Always Svelte 5 syntax**: `$state`, `$props`, `$derived`, `$effect`, `onclick`, `class:`, `{@render}`.
- Never use `<svelte:component>`, `createEventDispatcher`, `on:click`, `export let`, `$$props`.
- Key every `{#each}` block: `{#each items as item (item.id)}`.

## Spacing & Layout System

### Tokens (single source of truth)
All spacing, layout sizing, and reusable measure values live in `:root` in `src/lib/styles/global.css`.
Do not create one-off structural spacing values in route or component CSS.

| Token | Value | Purpose |
|---|---|---|
| `--nav-height` | `68px` | Fixed nav clearance |
| `--gutter` | `clamp(1.5rem, 4vw, 3rem)` | Side padding (24px → 48px) |
| `--space-section` | `clamp(3rem, 6vw, 4.5rem)` | Vertical gap between sections (48px → 72px) |
| `--space-page-top` | `calc(var(--nav-height) + clamp(1rem, 3vw, 2rem))` | Top padding below fixed nav |
| `--space-page-bottom` | `calc(var(--space-section) + env(safe-area-inset-bottom))` | Bottom padding for route shells and mobile safe area |
| `--content-max` | `1100px` | Main content max-width |
| `--content-narrow` | `760px` | Blog/prose max-width |
| `--space-2xs` → `--space-2xl` | fluid `clamp()` scale | Component spacing, internal rhythm, and responsive padding |
| `--gap-tight`, `--gap-normal`, `--gap-spacious` | aliases for spacing scale | Reusable component/grid gaps |
| `--grid-gap-row`, `--grid-gap-column` | fluid gap scale | Intrinsic grids |
| `--nav-block-padding`, `--footer-block-padding` | fluid block padding | Nav/footer internal spacing |
| `--card-padding`, `--panel-padding-*` | fluid padding | Cards, fact rows, panels |
| `--modal-gutter`, `--modal-padding`, `--modal-padding-wide` | fluid modal sizing | Modal overlay/content spacing |
| `--measure-*`, `--toc-width`, `--auto-grid-min`, `--ideas-grid-min`, `--list-grid-min`, `--stack-grid-min` | fluid/semantic measures | Content and intrinsic layout sizing |
| `--tap-target`, `--rule-size`, `--dot-size` | reusable dimensions | Touch targets, hairlines, small UI markers |

### Rules

1. **Never hard-code structural `padding`, `gap`, `margin`, `width`, `max-width`, grid min widths, or positioning offsets as raw pixels.**
  Use the tokens above, `clamp()`, `min()`, `max()`, intrinsic grid sizing, or a new semantic token in `:root`.
  Fixed pixel values are acceptable only for true hairlines, icon strokes, decorative borders, and tiny non-layout details.

2. **Single owner per axis.** Each spacing axis (top, bottom, sides) is owned by exactly one element:
  - **Side gutters** → the route page shell, via `padding-inline: var(--gutter)`.
  - **Top offset below nav** → the route page shell, via `padding-block-start: var(--space-page-top)`.
  - **Bottom safe area** → the route page shell, via `padding-block-end: var(--space-page-bottom)`.
  - **Between sections** → the route stack, via `display: grid; gap: var(--space-section)`.
   - Child components set `padding: 0` for structural spacing; they only control their internal layout.

3. **Every route has a page shell.** Do not rely on the last section, footer, or an individual card/grid to create bottom breathing room. The route shell owns top/bottom/page gutters; sections inside it use `padding: 0`.

4. **No mobile media queries for spacing.** The `clamp()` tokens scale fluidly. Media queries are only for
   **layout changes** (column count, grid collapse, hiding the TOC, etc.), never for re-declaring padding values.

5. **`scroll-margin-top`** uses `var(--nav-height)` or `var(--space-page-top)` so anchor links clear the fixed nav.

6. **Prefer intrinsic layout over breakpoint layout.** Use `repeat(auto-fit, minmax(min(100%, var(--auto-grid-min)), 1fr))`, `minmax(0, 1fr)`, `aspect-ratio`, `fit-content`, and semantic min-width tokens before adding viewport breakpoints.

7. **Use container queries for component responsiveness.** If a component changes because its own available width changes, use `container-type: inline-size` and `@container`. Use viewport media queries only for truly viewport-owned behavior such as global nav mode or hiding the lists TOC.

8. **Use logical properties for layout.** Prefer `padding-inline`, `margin-block`, `inset-inline-start`, `border-inline-start`, `inline-size`, and `block-size` over `left`, `right`, `top`, `bottom`, `width`, and `height` when the property describes layout direction or position.

9. **Choose the right layout primitive.** Use CSS Grid for two-dimensional layouts (page/sidebar layouts, modals, card grids) and Flexbox for one-dimensional alignment (button rows, nav links, metadata rows, wrapping tag clusters).

10. **Hover must not be the only path to content.** For touch/coarse-pointer interactions, add `@media (hover: none) and (pointer: coarse)` behavior so overlays or descriptions remain discoverable.

11. **Modals use tokenized, container-aware sizing.** Modal overlays use `--modal-gutter`; modal content uses `min()` and semantic max widths; two-column modal bodies use CSS Grid and collapse with `@container`, not fixed viewport-only breakpoints.

12. **Verify layout work.** After layout changes, run `npm run check` and `npm run build`, then inspect `/`, `/blog`, one `/blog/[slug]`, and `/lists` at mobile/tablet/desktop widths for overflow, overlap, nav/menu behavior, sticky TOC behavior, cards, and modals.

### Shared Layout Primitives

Prefer the global utilities in `src/lib/styles/global.css` before writing local wrapper CSS:

| Class | Purpose |
|---|---|
| `.page-shell` | Route shell for pages that start below fixed nav |
| `.page-shell-after-hero` | Route shell for content after the homepage hero |
| `.page-stack` | Vertical section stack with `--space-section` gap |
| `.page-section` | Section reset plus fixed-nav scroll margin |
| `.content-wide` | Centered content capped at `--content-max` |
| `.content-narrow` | Centered content capped at `--content-narrow` |
| `.auto-grid` | Intrinsic responsive grid using `--auto-grid-min` |
| `.sidebar-layout` | Tokenized sidebar/content grid using `--toc-width` by default |
| `.cluster` | Wrapping flex row using `--cluster-gap` |
| `.divider-stack` | Repeated items separated by the border hairline |
| `.prose` | Shared article/content rhythm for mdsvex and blog bodies |

### Page Template
```svelte
<div class="page-shell">
  <div class="page-stack">
    <section class="page-section">
      <div class="content-wide">
        <!-- content -->
      </div>
    </section>
  </div>
</div>

<style>
  /* Add only route-specific styling here. The shell/stack/section/content classes are global. */
</style>
```

For pages that start directly below the nav (blog, lists — no hero):
```svelte
<section class="page-shell">
  <div class="content-narrow">
    <!-- content -->
  </div>
</section>
```

For homepage content after `Hero.svelte`:
```svelte
<div class="page-shell-after-hero">
  <div class="page-stack">
    <!-- sections -->
  </div>
</div>
```

### What lives where

| Element | Owns | Does NOT own |
|---|---|---|
| `Nav.svelte` | its own internal padding (via `--gutter`) | nothing below itself |
| `Hero.svelte` | `min-height: 100svh`, side padding `--gutter` | vertical section spacing |
| `+page.svelte` (homepage) | `.page-shell-after-hero` owns gutters and bottom safe area; `.page-stack` owns section gaps | individual sections do not set padding |
| `+page.svelte` (blog list) | `.page-shell` owns page top, gutters, and bottom safe area | child post list does not add heading top gap |
| `+page.svelte` (lists) | `.page-shell.sidebar-layout` owns route shell and sidebar/content grid; `.page-stack` owns section gaps | sections do not set bottom padding |
| `About.svelte` | internal grid gap only | no section padding |
| `SectionHeader.svelte` | internal gap + bottom margin (both via clamp) | no section padding |
| `Footer.svelte` | its own padding via `--gutter` | nothing above itself |

## Color Tokens
Use CSS custom properties from `:root` — never hard-code hex for structural colors.
Exception: one-off decorative values (gradients, shadows) can use rgba/hex inline.

## File Structure
- Data files: `src/lib/data/`
- Components: `src/lib/components/`
- Global styles: `src/lib/styles/global.css`
- Route pages: `src/routes/`
