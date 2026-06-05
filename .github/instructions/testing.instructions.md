---
description: "Testing standards for intent-ui-kit: the test pyramid/ownership map, Vitest projects (node engine + browser components), reconcile/registry/parse-boundary unit tests, vitest-browser-svelte component tests, runes/.svelte.ts store testing, Playwright journey e2e, axe a11y, async <svelte:boundary> + cancellation tests, schema/property fuzzing, mocked LLM seams, visual/motion regression, and CI gates. Use when authoring or editing any test (*.test.ts, *.spec.ts, *.svelte.test.ts, *.test-d.ts, e2e specs) or test config."
applyTo: "**/*.test.ts, **/*.spec.ts, **/*.svelte.test.ts, **/*.test-d.ts, **/*.e2e.ts, **/vitest.config.*, **/playwright.config.*"
---

# Testing Standards — intent-ui-kit

This file owns **test routing, determinism, assertions, and gates**. It does **not** restate domain rules — the sibling docs remain the single source of truth for what correct *looks* like:
- `css.instructions.md` — tokens, motion, layout, materialize/dissolve visuals.
- `html-a11y.instructions.md` — semantics, live regions, focus, keyboard, WCAG.
- `svelte.instructions.md` — runes, component authoring, the autofixer workflow.
- `typescript.instructions.md` — `Result`, parse-at-boundary, discriminated unions, registry typing.

## 0. First principle: test behavior, not machinery
Assert what a package consumer or end user can observe — public contracts and user-visible outcomes — never private state, rune mechanics, or incidental DOM.
- **Never** assert "`$derived` recomputed" or read a private field. Mutate the input and assert the **rendered text / fired callback / ARIA state / exported getter**.
- Select by **role + accessible name** (`getByRole('button', { name: /send/i })`), not CSS/XPath/class hashes. Use `data-testid` only when a user-facing selector genuinely can't express the contract (and the `data-*` is a documented lifecycle contract).
- Don't snapshot everything — large snapshots hide bugs and invite blind updates.

## 0a. Test integrity — no reward hacking
A failing test is a **signal**, not an obstacle. When a test fails, fix the **code under test** — do not weaken, skip, or rewrite the test to manufacture a green run.
- **Never** make a test pass by: loosening an assertion to something trivially true, deleting/`.skip`/`.todo`/`.only`-quarantining a failing case, `expect(true).toBe(true)`, widening a snapshot to swallow the bug, catching-and-ignoring the thrown error, removing the broken scenario, or stubbing the very behavior under test so it can't fail.
- **Never** inflate a coverage/mutation number with assertion-free tests that execute code without checking outcomes.
- A test may **legitimately** be changed only when the test itself is wrong or the **intended contract** genuinely changed — e.g. a spec/requirement update, an intentional API change, a flaky/incorrect assertion, or an outdated fixture. In that case: state *why* in the change, update the test to reflect the **new correct behavior** (not merely "what the code now does"), and keep it a real assertion.
- If you can't make a test pass and aren't sure the test is wrong, **stop and surface it** — report the failure and your diagnosis rather than editing around it. A red test left honest is better than a green test that lies.
- The same applies to the static gates: don't silence type/lint/a11y failures with blanket `// @ts-ignore`, `eslint-disable`, `as any`, or `disableRules()` to get a pass — fix the cause or, if truly warranted, narrowly scope and justify the exception.

## 1. The pyramid & ownership map
This kit is a **heavy pure-TS core + thin reactive components**, so it skews to fast engine unit tests. Target distribution and what each layer owns:

| Layer | ~Share | Owns (test it HERE, not elsewhere) |
|---|---:|---|
| **Static** | gate always | `svelte-check`/`tsc`, ESLint, the Svelte autofixer, public-export contract, `*.test-d.ts` type tests |
| **Engine unit** (Node) | ~50% | `reconcile()` diff, `registry`, `parsePlan()` boundary, `Result` combinators, the `Workspace` two-call loop with injected fakes |
| **Component** (browser) | ~25% | DOM output, focus, ARIA, callback props, lifecycle phase classes, `$effect` side effects, dynamic `Component<P>` render |
| **E2E journey** (Playwright) | ~5–10% | multi-turn chat flows; widget materialize → persist → dissolve across turns; the running-context evolution |
| **Visual** | ~5% | curated settled-state snapshots at key viewports/zone states |
| **A11y** | ~5–8% | axe scans on rendered states + keyboard/focus + manual SR checks |

Routing rule: if invalid plans are rejected → **engine unit**, not e2e. If `reconcile` preserves shared widgets → **engine unit**, not component or e2e. If a widget focuses/announces/calls back → **component**, not engine. If a chat turn persists widgets across zones → **e2e**, once.

## 2. Vitest projects (one config, two environments)
Use **Vitest 4.x** `test.projects` (the deprecated `workspace` is gone; `vitest-browser-svelte` requires Vitest ≥ 4). Split a fast **Node** project (framework-agnostic engine) from a **browser** project (components). Engine tests must not pay for DOM/Svelte transforms.
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    coverage: { provider: 'v8', include: ['src/lib/**/*.{ts,svelte}'], exclude: ['**/*.{test,spec}.*', 'src/routes/**'] },
    projects: [
      { extends: true, test: { name: 'engine', environment: 'node',
          include: ['src/lib/core/**/*.{test,spec}.ts'],
          exclude: ['src/lib/**/*.svelte.{test,spec}.ts'] } },
      { extends: true, test: { name: 'components',
          include: ['src/lib/**/*.svelte.{test,spec}.ts'],
          setupFiles: ['vitest-browser-svelte'],
          browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] } } }
    ]
  }
});
```
- Vitest 4: the browser `provider` takes the **`playwright()` object** (from `@vitest/browser-playwright`), not the `'playwright'` string; Browser Mode ships built-in (no separate `@vitest/browser` install).
- File naming: `*.test.ts` for pure TS; **`*.svelte.test.ts`** when the test file itself uses runes or renders a `.svelte` component; `*.test-d.ts` for type tests (`vitest --typecheck`); Playwright specs live **outside** `src/lib`.

## 3. Engine unit tests (the highest-value layer)
- **Table-driven the reducer.** Test `reconcile(plan, mounted)` by **identity**, not position: stable id → keep/update, new id → materialize, absent id → dissolve. Use `test.each`.
- **Assert invariants, not just examples:** idempotency (reconciling an already-applied result emits no ops), plan ordering preserved, no mutation of inputs.
- **Inject deterministic fakes** for the `Responder`/`Director` seams — never a real model, never module-mock what you can pass as a dependency. `vi.fn()` to assert call order/payloads (`toHaveBeenNthCalledWith`).
- Use `toStrictEqual` for exact reducer output, `toMatchObject` for semantic shape ignoring timestamps/metadata.
- **Determinism:** freeze time (`vi.useFakeTimers()` + `vi.setSystemTime(...)`) for anything touching `Date`/ids/latency; restore in `afterEach`. Seed any shuffle. No real timers/network/UUIDs.
```ts
test.each([
  { name: 'keeps stable id',     plan:[{id:'a',kind:'metric'}], mounted:[{id:'a',kind:'metric'}], op:'keep' },
  { name: 'materializes new id', plan:[{id:'b',kind:'metric'}], mounted:[],                       op:'materialize' },
  { name: 'dissolves absent id', plan:[],                       mounted:[{id:'c',kind:'metric'}], op:'dissolve' },
])('$name', ({ plan, mounted, op }) => {
  expect(reconcile(plan, mounted)).toMatchObject([{ op }]);
});
```

## 4. Parse-boundary & property/fuzz tests (the trust boundary)
The Director's `UIPlan` is untrusted LLM JSON (see `typescript.instructions.md` §4). Test the **parser contract**, not schema-library internals.
- Valid plan → typed canonical output (extras stripped). Malformed-known → rejected `Result`, **no throw**. Unknown `kind` → dropped, valid siblings kept, `reconcile()` never sees it.
- **Property-test totality with fast-check** (`@fast-check/vitest`): `fc.jsonValue()` inputs → the parser **never throws** and always returns valid-canonical **or** rejected `Result`. Seed it; bound `numRuns`/`maxDepth` for CI.
- **Adversarial fixtures** as data only: prompt-injection-shaped strings, `__proto__`/`constructor` keys (assert no prototype pollution), huge/deeply-nested arrays (bounded failure), unicode/astral/RTL/lone-surrogates.
- **Type tests** (`*.test-d.ts`, `expectTypeOf`/`assertType` + `@ts-expect-error`): the kind→props correlation holds and `NoInfer` blocks widening.
```ts
import { test, fc } from '@fast-check/vitest';
test.prop([fc.jsonValue({ maxDepth: 6 })], { seed: 0x5eed, numRuns: 500 })(
  'parsePlan is total for arbitrary JSON',
  (input) => { const r = parsePlan(input, registry); expect(r.ok === true || r.ok === false).toBe(true); }
);
```

## 5. Component tests (vitest-browser-svelte, real browser)
Use **`vitest-browser-svelte`** (Browser Mode, Playwright provider) for component DOM behavior — jsdom has no layout/animation/`matchMedia`/observers, so push those cases to the browser project or e2e.
- `await render(...)`; assert with retryable `await expect.element(locator)...`; query by role/label/text. No `act`, no `container.querySelector`.
- **Callback props (not events):** spy and assert it fires with expected args after user input.
- **Dynamic registry render:** pass an actual `Component<P>` and assert user-visible output (`<Widget />`, never `<svelte:component>`).
- **`$effect` side effects** (autoscroll, `animationend` → phase advance): drive the real event, then `await expect.poll(...)` / `tick()` / `settled()`.
- **Reactive `.svelte.ts` stores** outside a component: wrap in **`$effect.root(() => { … })`**, drive state, `flushSync()` for synchronous assertions, and call the returned `destroy()` in `finally`. Test files need the `.svelte.test.ts` extension so runes compile. (`effect_orphan`/`rune_outside_svelte` errors = missing root or wrong filename.)
- **`flushSync()` is required after manipulating *external* (`.svelte.ts`) state** — even after a click that mutates a store — before asserting. Component-*internal* state applies automatically via the locator/retry flow; the universal-store case does not.
- **Wrap `$derived` reads in `untrack()`** when asserting them in a test, so reading the value doesn't register the test as a reactive dependency and cause unexpected re-runs: `expect(untrack(() => store.total)).toBe(3)`.
```ts
test('composer submits via callback prop', async () => {
  const onsubmit = vi.fn();
  const screen = await render(ChatComposer, { onsubmit });
  await screen.getByRole('textbox', { name: /message/i }).fill('show budget');
  await screen.getByRole('button', { name: /send/i }).click();
  expect(onsubmit).toHaveBeenCalledWith('show budget');
});
```

## 6. Async / progressive-rendering / cancellation tests
Mirrors `svelte.instructions.md` §9–10. Only widgets that `await` need this; static widgets render synchronously with no skeleton.
- **`<svelte:boundary>` contract:** `pending` shows on first creation then is replaced once awaits settle; a thrown error renders `failed(error, reset)`; `reset` recreates content once.
- **Subsequent async (not first load):** the `pending` snippet shows **only** on first creation — assert later in-flight updates via **`$effect.pending()`** (count of unresolved promises in the boundary) driving a "refreshing" indicator, not a re-shown skeleton.
- **Control time explicitly:** use **deferred promises** (manual resolve) for data; fake timers only for app-owned delays (the "no skeleton under 1s" reveal lives outside `pending`). Advance with `vi.advanceTimersByTimeAsync(...)`, flush with `settled()`.
- **Cancellation/races:** assert a superseded fetch's signal aborts on rapid rerender (`getAbortSignal()`), and stale data **never** overwrites fresh UI. Treat `AbortError` as cancellation, not a widget failure.
- **Fault wall:** a bad payload yields the `failed` retry surface (`role="alert"`), never a blank or hallucinated render; assert failed → reset → success.
- Gotcha: inside a `pending` snippet, lifecycle (`$effect`/`onMount`/`@attach`) does **not** run — assert visible DOM only there.

## 7. Mocked LLM seams (determinism over the model)
- **Primary strategy = the DI seam.** Pass scripted fake `Responder`/`Director` impls in unit/component tests; no model is ever called. Golden fixtures capture representative `(messages,context,mounted) → (replyChunks, UIPlan)` (frozen ids/time, redacted).
- **Streaming as data:** represent a reply as `AsyncIterable`/`ReadableStream`; drive chunk timing with fake timers; assert intermediate UI states, not just the final text.
- **Network layer only when a real adapter exists:** MSW 2.x (`setupServer`, `http.post`, `HttpResponse` with a `ReadableStream` for SSE) for unit/component; Playwright `page.route`/`routeFromHAR`/`routeWebSocket` for e2e.
- **Contract suite:** one shared spec every `Responder`/`Director` impl (mock or real) must pass — ordered chunks, schema-valid plan, honors `AbortSignal`, no input mutation.
- **Evals ≠ tests.** Keep non-deterministic model-quality evals (LLM-as-judge, task pass-rates) in a separate, non-CI job. Promote a real failure into a deterministic fixture whenever it can be a stable assertion.

## 8. E2E journeys (Playwright)
Test **flows, not pages**: intent → streamed reply → widget materializes → act → persists/dissolves.
- Web-first auto-retrying assertions only (`toBeVisible`, `toHaveCount`, `toBeHidden`); **never** `waitForTimeout`/`networkidle`. Use `expect.poll`/`toPass` for app-level eventual state.
- **Kill animation flake:** `page.emulateMedia({ reducedMotion: 'reduce' })` + a zero-duration style tag; assert the **settled** DOM. Test motion *correctness* separately (§9), don't pixel-diff it.
- Assert **both channels** each turn: the `role="log"` reply and the surfaced widget. Assert persistence across the next turn and dissolution on "clear"/dismiss by accessible name/id.
- Offline mock resolvers are the golden path; if a real seam exists, intercept it — never let live model output decide CI. Thin Page Objects name user operations (`sendIntent`, `dismissWidget`), not DOM plumbing.

## 9. Accessibility tests (automated + honest limits)
- **axe** via `@axe-core/playwright` (e2e) and `axe-core` (component), gated on `violations.length === 0` with WCAG tags `wcag2a/2aa/21a/21aa/22aa`. Scan **rendered** states (open the dialog/menu/skeleton first); scope with `.include()`. Axe catches ~30–57% of issues — **never** claim conformance from a green axe run.
- **Focus management** (the kit's hard part, per `html-a11y.instructions.md` §3): assert materializing a widget does **not** move focus; a dialog moves focus in, traps Tab, and **restores to the opener** on Esc; the composer stays focused after send.
- **Live region:** assert `role="log"` and explicit `aria-live="polite"` (per `html-a11y.instructions.md` §2), no `aria-atomic`, `aria-busy` toggles during stream, and skeletons are `aria-hidden`. Announcement *quality* is manual (NVDA/VoiceOver/JAWS).
- **Display prefs:** `page.emulateMedia({ reducedMotion, forcedColors, colorScheme, contrast })` — assert motion collapses (computed `*-duration` ≈ 0) and meaning is never color-only.
- **Keyboard-only** flows and target size (≥24px AA geometry gate) are automatable; translation quality and icon-label meaning are manual.

## 10. Visual / token / CSS tests (real browser only)
jsdom has **no layout engine** — token resolution, container queries, `clamp()`, grid, and reflow assertions **must** run in Playwright.
- **Snapshots:** `toHaveScreenshot()` on **settled** state and **scoped to a stable element**, not whole pages; mask dynamic regions; set a sane `maxDiffPixelRatio`; scope to one engine to cut OS flake.
- **Tokens/layout via computed style:** `getComputedStyle().getPropertyValue('--token')`; assert no horizontal overflow/overlap; assert `:empty` zones collapse; resize a **container** (not just viewport) to verify container-query variants.
- **Static guard:** stylelint forbids raw px / one-off hex / physical properties — catches token violations with no browser (cheap, run in CI). Storybook is optional for a kit this size; Playwright screenshots are sufficient.

## 11. CI & publish gates
Order: typecheck → lint → engine unit (+coverage) → component → build → package checks → e2e.
- `pnpm run check` (svelte-check) · `pnpm run lint` · `vitest --project engine --coverage` · `vitest --project components` · `pnpm run build` · **`publint --strict`** + **`@arethetypeswrong/cli`** on the packed tarball · `playwright test`.
- **Public API contract test:** snapshot `Object.keys(import * from 'src/lib/index.ts')` so accidental export changes fail loudly. Exclude all test files from the published package (`files` allowlist).
- Coverage is **visibility, not a vanity gate** — set focused thresholds on `src/lib/core/**`, not a global %. Consider **Stryker mutation testing** (nightly/pre-release) on the high-value pure logic (`reconcile`, parser, registry, `Result`) — skip it for layout/mocks/visuals.
- Playwright `retries: 2` in CI to *classify* flake (not hide it); shard only when runtime justifies it.

## Don't over-test
Generated/mock code, third-party libs, trivial getters/barrels, exact class names (unless a documented `data-state` contract), and snapshot-everything are all smells. Coverage % is not the goal — behavior is.
