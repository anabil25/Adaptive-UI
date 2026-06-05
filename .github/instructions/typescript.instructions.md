---
description: "TypeScript type-architecture standards for intent-ui-kit: discriminated unions + exhaustiveness, kind→props widget registry typing, pluggable Responder/Director seams, parse-at-boundary validation of untrusted UIPlan, Result-over-throw, strictness flags, and library export discipline. Use when authoring or editing any .ts file in the core engine, registry, resolvers, or types."
applyTo: "**/*.ts"
---

# TypeScript Standards — intent-ui-kit

The core engine (`src/lib/core/`) is framework-agnostic TypeScript: the two-call loop, the declarative `UIPlan`, the reconcile diff, the widget registry, and the pluggable resolver seams. Types are the contract the whole kit rests on.

**Targets TypeScript 6.0+** (released March 2026). 6.0 flipped nine config defaults (`strict`, `isolatedModules`, `moduleResolution: bundler`, `esModuleInterop`, `target: es2025`, `module: esnext`, `types: []`, `rootDir: .` …) and deprecates syntax that becomes a hard error in 7.0 (the Go compiler). Write for that baseline — see §6 and §9.

## 1. Discriminated unions + exhaustiveness
Model the domain as unions keyed by a literal `kind` / `phase` (widgets, lifecycle phases, plan ops, resolver results). Branch with `switch` and make a missing case a **compile error**:
```ts
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

switch (widget.phase) {
  case 'entering': return enter(widget);
  case 'present':  return update(widget);
  case 'exiting':  return dissolve(widget);
  default:         return assertNever(widget.phase);
}
```
Enable `noFallthroughCasesInSwitch` so fallthrough is caught too.

## 2. Registry typing (kind → props correlation)
Map each widget `kind` to its prop type so `kind` and `props` correlate at every call site. Use a registry interface + lookup types, and let consumers **extend via module augmentation** instead of `any`:
```ts
// The extensible map. Consumers augment this interface to register their kinds.
export interface WidgetPropMap {
  metric: { label: string; value: string; delta?: string };
  trend:  { title: string; series: number[]; baseline?: number[] };
  // …
}

export type WidgetKind = keyof WidgetPropMap;

export interface PlannedWidget<K extends WidgetKind = WidgetKind> {
  id: string;
  kind: K;
  zone?: ZoneId;
  span?: number;
  props: WidgetPropMap[K];
}

// Type-safe factory: props are checked against the kind.
// `NoInfer` (TS 5.4+) forces inference to flow from `kind` only — without it,
// TS could infer K from `props` and defeat the kind↔props correlation.
export function planned<K extends WidgetKind>(
  id: string, kind: K, props: NoInfer<WidgetPropMap[K]>, zone?: ZoneId, span?: number
): PlannedWidget<K> {
  return { id, kind, props, zone, span };
}
```
Consumer extension:
```ts
declare module 'intent-ui-kit' {
  interface WidgetPropMap { gauge: { min: number; max: number; value: number } }
}
```

## 3. Pluggable seams are typed contracts
`Responder` and `Director` are **function types**, so a mock and a real LLM impl are interchangeable. Inject them; never hard-code:
```ts
export type Responder = (input: ResponderInput) => Promise<ChatReply>;
export type Director  = (input: DirectorInput) => Promise<UIPlan>;
```
The `Workspace` receives both via options — it never imports a concrete resolver.

## 4. Validate at the boundary, trust within ("parse, don't validate")
The Director's `UIPlan` is **untrusted** LLM/JSON. Parse it with a schema validator (Zod / Valibot / ArkType) into typed domain objects **before** it reaches the reconciler. Use **branded types** for ids:
```ts
import { z } from 'zod';

// Stage 1 is structural: unknown kinds are non-fatal noise from the model.
// Do not use z.enum(...) here or one unknown widget would reject the whole plan.
const PlannedWidgetShape = z.object({
  id: z.string().min(1),
  kind: z.string(),
  zone: z.enum(['banner', 'primary', 'side', 'rail']).optional(),
  span: z.number().int().positive().optional(),
  props: z.record(z.unknown())
});

const UIPlanShape = z.object({
  widgets: z.array(PlannedWidgetShape),
  contextPatch: z.record(z.unknown()).optional(),
  rationale: z.string().optional()
});

export function parsePlan(raw: unknown, registry: WidgetRegistry): Result<UIPlan, ParseIssue[]> {
  const parsed = UIPlanShape.safeParse(raw);
  if (!parsed.success) return err(toParseIssues(parsed.error));

  // Stage 2: drop unknown kinds, then validate known-kind props with that kind's schema.
  const widgets = parsed.data.widgets.flatMap((w) => {
    const def = registry.get(w.kind);
    if (!def) return [];
    const props = def.propsSchema.safeParse(w.props);
    return props.success ? [{ ...w, kind: w.kind as WidgetKind, props: props.data }] : [];
  });

  return ok({ ...parsed.data, widgets });
}
```
- Prefer libraries that implement the **Standard Schema** interface so validators are swappable. If you reference Zod directly, target **v4** (2025; changed API surface) — otherwise stay Standard-Schema-agnostic.
- `JSON.parse()` is still typed `any` in TS 6.0 — wrap it so untrusted input enters as `unknown`: `const parseJSON = (t: string): unknown => JSON.parse(t);`, then schema-parse.

## 5. Result over throw for async seams
Resolver outcomes use a discriminated `Result<T, E>` (or a typed error union) so callers must handle every failure mode:
```ts
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type DirectorError =
  | { kind: 'network'; status: number }
  | { kind: 'invalid-plan'; issues: string[] }
  | { kind: 'timeout' };
```
Throwing is reserved for genuine programmer errors (`assertNever`), not expected I/O failures.

**Ship combinators with the type** — without them every caller accumulates `if (!r.ok) return r` and reverts to try/catch within a week:
```ts
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function mapOk<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}
export function flatMapOk<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  return r.ok ? fn(r.value) : r;
}
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}
```

## 6. Strictness (tsconfig, TS 6.0 baseline)
TS 6.0 makes `strict`, `isolatedModules`, `esModuleInterop`, and `moduleResolution: bundler` (via `module: esnext`) **defaults** — don't list those; they're noise now. Mandate the flags that are **still opt-in** and matter for this kit:
```jsonc
{
  "noUncheckedIndexedAccess": true,   // the registry/zone lookups are index access
  "exactOptionalPropertyTypes": true, // widget props distinguish 'missing' from 'undefined'
  "noFallthroughCasesInSwitch": true, // guards the reconcile/phase switches
  "noImplicitReturns": true,
  "noImplicitOverride": true,
  "verbatimModuleSyntax": true,       // forces `import type`; still opt-in
  "types": []                         // 6.0 default; list env types explicitly only where needed
}
```
- `satisfies` over annotation for literal config (keeps narrow inference while checking shape).
- `const` type params for inference-preserving generics; `NoInfer<T>` to pin which parameter drives inference (see §2).
- `useUnknownInCatchVariables` (on under `strict`) — narrow caught errors before use.
- Add environment types only where they are actually needed (`node` for config/tests, DOM for browser code). In SvelteKit's root `tsconfig`, don't force `rootDir: "./src"` if config files live at the repo root; make `rootDir` explicit only in emit/package-specific configs.

## 7. Library export discipline
- The public surface is **only** what `src/lib/index.ts` exports. Don't leak internal engine types.
- Mark type-only exports with `export type` (required under `verbatimModuleSyntax`).
- Keep `core/` and `components/` internals private unless deliberately published.
- Generated `.d.ts` (via `svelte-package`) must carry full prop intellisense — export every public `Props`/contract interface.

## 8. Style
- No `any`. Use `unknown` at boundaries and narrow. Wrap `any`-returning third-party libs in a typed facade (`unknown` in → schema-parse → typed out); never let `any` leak inward.
- No non-null `!` to silence the compiler — handle the `undefined` (`noUncheckedIndexedAccess` will surface it).
- Narrow caught errors immediately: `const msg = e instanceof Error ? e.message : String(e);`.
- **Erasable syntax only** (the library must run under Node/Deno/Bun native type-stripping, no compile step). Banned non-erasable constructs:
  - **No `enum`** — use an `as const` object + derived type:
    ```ts
    export const Zone = { banner: 'banner', primary: 'primary', side: 'side', rail: 'rail' } as const;
    export type ZoneId = (typeof Zone)[keyof typeof Zone];
    ```
  - **No `namespace`** — use ES modules. **No parameter properties** (`constructor(public x)`) — assign explicitly. **No `import … assert`** — use `import … with` (assert is deprecated in 6.0, errors in 7.0).
- **`satisfies` for config maps** — check shape without widening:
  ```ts
  const ZONE_CONFIG = {
    banner:  { maxWidgets: 1, defaultSpan: 4 },
    primary: { maxWidgets: 4, defaultSpan: 2 },
    side:    { maxWidgets: 3, defaultSpan: 1 },
    rail:    { maxWidgets: 2, defaultSpan: 1 },
  } satisfies Record<ZoneId, { maxWidgets: number; defaultSpan: number }>;
  ```
- **Time types use Temporal, never `Date`** in public interfaces. Widget props with dates/durations/time-series use `Temporal.ZonedDateTime` / `Temporal.Duration` (TS 6.0 `es2025` lib; `temporal-polyfill` until runtime support is universal).
- **Resource cleanup via `using` / `await using`.** Anything needing teardown (abort controllers, subscriptions, connections in resolvers) implements `Disposable`/`AsyncDisposable` rather than manual cleanup:
  ```ts
  class DataFetcher implements Disposable {
    #ac = new AbortController();
    get signal() { return this.#ac.signal; }
    [Symbol.dispose]() { this.#ac.abort(); }
  }
  // in a resolver:
  function fetchWidget(instance: WidgetInstance) {
    using f = new DataFetcher();           // auto-aborts on scope exit
    return fetch(`/api/${instance.kind}/${instance.id}`, { signal: f.signal });
  }
  ```
  (This is the core-engine/resolver layer; the Svelte component layer uses `getAbortSignal()` — see `svelte.instructions.md` §9.)
- Name reactive engine state in `.svelte.ts` modules; see the Svelte instructions for rune typing.

## 9. TS 7.0 readiness
7.0 (Go compiler) turns 6.0's deprecations into hard removals. Stay ahead: no import assertions (`with` only), erasable syntax only (§8), no `target: es5` (removed), and don't depend on the current TS plugin API. Code written to these rules upgrades without churn.

Run `npm run check` after edits; it must be clean before presenting code.
