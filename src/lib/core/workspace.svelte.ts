/* =====================================================================
   Workspace store — the engine that ties the two calls together.

   On each user message it runs BOTH calls and reconciles the result:

     user message
        ├─ respond()    -> assistant reply  (streams into chat)
        └─ directUI()   -> UIPlan ──┐
                                    └─ reconcile() diffs plan vs mounted
                                       absent -> dissolve  (phase: exiting)
                                       new    -> materialize (phase: entering)
                                       shared -> update in place

   Built on Svelte 5 runes. Returned object exposes reactive `$state`.
   ===================================================================== */

import {
	emptyContext,
	type ChatMessage,
	type Director,
	type Responder,
	type RunningContext,
	type UIPlan,
	type WidgetInstance
} from './types';
import { WidgetRegistry } from './registry';

export interface WorkspaceOptions {
	registry: WidgetRegistry;
	respond: Responder;
	directUI: Director;
	/** Optional seed widgets so the canvas is not a cold start. */
	seedPlan?: UIPlan;
	/** Optional opening assistant message. */
	greeting?: string;
}

let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export class Workspace {
	#registry: WidgetRegistry;
	#respond: Responder;
	#directUI: Director;

	messages = $state<ChatMessage[]>([]);
	widgets = $state<WidgetInstance[]>([]);
	context = $state<RunningContext>(emptyContext());
	thinking = $state(false);
	lastRationale = $state<string>('');

	constructor(opts: WorkspaceOptions) {
		this.#registry = opts.registry;
		this.#respond = opts.respond;
		this.#directUI = opts.directUI;

		if (opts.greeting) {
			this.messages.push(this.#msg('assistant', opts.greeting));
		}
		if (opts.seedPlan) {
			this.#reconcile(opts.seedPlan);
		}
	}

	get registry(): WidgetRegistry {
		return this.#registry;
	}

	/** Submit a user message: runs both calls and reshapes the workspace. */
	async send(content: string): Promise<void> {
		const trimmed = content.trim();
		if (!trimmed || this.thinking) return;

		this.messages.push(this.#msg('user', trimmed));
		this.thinking = true;

		try {
			// Two calls fire together; they are independent jobs.
			const [reply, plan] = await Promise.all([
				this.#respond({ messages: this.messages, context: this.context }),
				this.#directUI({
					messages: this.messages,
					context: this.context,
					availableKinds: this.#registry.kinds(),
					mounted: this.widgets.filter((w) => w.phase !== 'exiting')
				})
			]);

			this.messages.push(this.#msg('assistant', reply.content));
			this.#applyContextPatch(plan);
			this.#reconcile(plan);
		} finally {
			this.thinking = false;
		}
	}

	/** Diff a UIPlan against mounted widgets: mount / keep+update / dissolve. */
	#reconcile(plan: UIPlan): void {
		const planned = new Map(plan.widgets.map((w) => [w.id, w]));
		const nextIds = new Set(planned.keys());

		// 1. Dissolve widgets absent from the new plan.
		for (const w of this.widgets) {
			if (!nextIds.has(w.id) && w.phase !== 'exiting') {
				w.phase = 'exiting';
			}
		}

		// 2. Update widgets present in both.
		for (const w of this.widgets) {
			const p = planned.get(w.id);
			if (!p) continue;
			const def = this.#registry.get(p.kind);
			w.kind = p.kind;
			w.zone = p.zone ?? def?.defaultZone ?? w.zone;
			w.span = p.span ?? def?.defaultSpan ?? w.span;
			w.props = p.props;
			w.phase = 'present';
		}

		// 3. Materialize newly planned widgets.
		const existing = new Set(this.widgets.map((w) => w.id));
		for (const p of plan.widgets) {
			if (existing.has(p.id)) continue;
			const def = this.#registry.get(p.kind);
			if (!def) {
				console.warn(`[intent-ui] director planned unknown kind "${p.kind}"; skipping.`);
				continue;
			}
			this.widgets.push({
				id: p.id,
				kind: p.kind,
				zone: p.zone ?? def.defaultZone ?? 'primary',
				span: p.span ?? def.defaultSpan ?? 1,
				props: p.props,
				phase: 'entering',
				bornAt: this.context.turn
			});
		}

		if (plan.rationale) this.lastRationale = plan.rationale;
	}

	/** Called by widget frames once the exit animation completes. */
	finalizeExit(id: string): void {
		this.widgets = this.widgets.filter((w) => w.id !== id);
	}

	/** Promote an entering widget to present after its enter animation. */
	settle(id: string): void {
		const w = this.widgets.find((x) => x.id === id);
		if (w && w.phase === 'entering') w.phase = 'present';
	}

	widgetsInZone(zone: string): WidgetInstance[] {
		return this.widgets.filter((w) => w.zone === zone);
	}

	clear(): void {
		for (const w of this.widgets) w.phase = 'exiting';
	}

	#applyContextPatch(plan: UIPlan): void {
		if (!plan.contextPatch) {
			this.context = { ...this.context, turn: this.context.turn + 1 };
			return;
		}
		this.context = { ...this.context, ...plan.contextPatch };
	}

	#msg(role: ChatMessage['role'], content: string): ChatMessage {
		return { id: uid(role), role, content, createdAt: Date.now() };
	}
}

export function createWorkspace(opts: WorkspaceOptions): Workspace {
	return new Workspace(opts);
}
