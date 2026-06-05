/* =====================================================================
   Widget registry — app authors register WidgetDefinitions here, and
   the engine + Director draw from it. Keyed by `kind`.
   ===================================================================== */

import type { WidgetDefinition } from './types';

export class WidgetRegistry {
	#defs = new Map<string, WidgetDefinition>();

	register(def: WidgetDefinition): this {
		if (this.#defs.has(def.kind)) {
			console.warn(`[intent-ui] widget kind "${def.kind}" already registered; overwriting.`);
		}
		this.#defs.set(def.kind, def as WidgetDefinition);
		return this;
	}

	registerAll(defs: WidgetDefinition[]): this {
		for (const def of defs) this.register(def);
		return this;
	}

	get(kind: string): WidgetDefinition | undefined {
		return this.#defs.get(kind);
	}

	has(kind: string): boolean {
		return this.#defs.has(kind);
	}

	kinds(): string[] {
		return [...this.#defs.keys()];
	}

	all(): WidgetDefinition[] {
		return [...this.#defs.values()];
	}
}

export function createRegistry(defs: WidgetDefinition[] = []): WidgetRegistry {
	return new WidgetRegistry().registerAll(defs);
}
