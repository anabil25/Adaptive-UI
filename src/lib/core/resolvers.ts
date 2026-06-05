/* =====================================================================
   Resolvers — the two pluggable LLM calls.

   Call A  respond()   : conversation        -> assistant reply
   Call B  directUI()  : conversation + ctx  -> desired canvas (UIPlan)

   The implementations below are MOCKS so the kit runs fully offline.
   Swap each for a real LLM call by implementing the Responder / Director
   contracts in `types.ts` — nothing else in the engine changes.
   ===================================================================== */

import type {
	Director,
	DirectorInput,
	PlannedWidget,
	Responder,
	ResponderInput,
	UIPlan,
	ZoneId
} from './types';

/* ---------------------------------------------------------------------
   Mock Responder (call A)
   ------------------------------------------------------------------- */

export const mockResponder: Responder = async ({ messages }: ResponderInput) => {
	const last = [...messages].reverse().find((m) => m.role === 'user');
	const text = last?.content.trim() ?? '';
	await delay(280);

	if (!text) {
		return { content: 'Tell me what you want to do and I will bring the right surface to you.' };
	}
	return {
		content: composeReply(text)
	};
};

function composeReply(text: string): string {
	const t = text.toLowerCase();
	if (/\b(revenue|sales|q[1-4]|metric|kpi|growth)\b/.test(t)) {
		return 'Pulling the figures up now — the key metrics and the trend are on the canvas. Want a year-over-year comparison layered in?';
	}
	if (/\b(task|todo|plan|backlog|sprint)\b/.test(t)) {
		return 'Here is the working set. I kept your active items and surfaced what looks next.';
	}
	if (/\b(weather|forecast|temp)\b/.test(t)) {
		return 'Got it — current conditions are up. Say the word and I will add the week ahead.';
	}
	if (/\b(clear|reset|clean|hide|dismiss)\b/.test(t)) {
		return 'Cleared the canvas. Fresh slate whenever you are ready.';
	}
	return 'On it. I have surfaced what seems most relevant — steer me and the workspace will reshape.';
}

/* ---------------------------------------------------------------------
   Mock Director (call B)
   Reads the latest message + running context, decides the DESIRED
   canvas. Returns the full set of widgets that should be present now;
   the reconciler diffs it against what is mounted. Stable ids let a
   widget persist and evolve across turns instead of being rebuilt.
   ------------------------------------------------------------------- */

export const mockDirector: Director = async ({
	messages,
	context,
	mounted
}: DirectorInput): Promise<UIPlan> => {
	const last = [...messages].reverse().find((m) => m.role === 'user');
	const text = (last?.content ?? '').toLowerCase();
	await delay(360);

	// Explicit clear intent: empty canvas.
	if (/\b(clear|reset|clean slate|start over|dismiss all)\b/.test(text)) {
		return { widgets: [], rationale: 'User asked to clear the canvas.' };
	}

	// Start from what is already present so views persist across turns.
	const keep = new Map<string, PlannedWidget>(
		mounted.map((w) => [w.id, { id: w.id, kind: w.kind, zone: w.zone, span: w.span, props: w.props }])
	);

	const add = (w: PlannedWidget) => keep.set(w.id, w);
	const goals = new Set(context.goals);

	if (/\b(revenue|sales|q[1-4]|metric|kpi|growth|finance)\b/.test(text)) {
		goals.add('review revenue');
		add(planned('metric-revenue', 'metric', 'primary', 2, {
			label: 'Quarterly Revenue',
			value: '$4.82M',
			delta: '+12.4%',
			trend: 'up'
		}));
		add(planned('chart-trend', 'trend', 'primary', 2, {
			title: 'Revenue trend',
			series: [31, 38, 35, 44, 41, 52, 48]
		}));
		add(planned('metric-margin', 'metric', 'side', 1, {
			label: 'Gross margin',
			value: '61%',
			delta: '+1.8pts',
			trend: 'up'
		}));
	}

	if (/\b(compare|year.?over.?year|yoy|last year|versus|vs)\b/.test(text)) {
		goals.add('compare to last year');
		add(planned('chart-compare', 'trend', 'primary', 2, {
			title: 'This year vs last',
			series: [31, 38, 35, 44, 41, 52, 48],
			baseline: [28, 30, 33, 35, 37, 40, 42]
		}));
	}

	if (/\b(task|todo|plan|backlog|sprint|work)\b/.test(text)) {
		goals.add('manage work');
		add(planned('tasks-main', 'tasklist', 'primary', 2, {
			title: 'Active work',
			items: [
				{ label: 'Draft transfer-task pairs', done: false },
				{ label: 'Wire director seam', done: true },
				{ label: 'Pilot recruitment email', done: false }
			]
		}));
	}

	if (/\b(weather|forecast|temp|conditions)\b/.test(text)) {
		goals.add('check weather');
		add(planned('weather-now', 'weather', 'rail', 1, {
			place: 'San Francisco',
			temp: 17,
			summary: 'Low cloud, clearing'
		}));
	}

	// Cold-start hint banner only when the canvas is otherwise empty.
	if (keep.size === 0) {
		add(planned('hint', 'note', 'banner', 2, {
			title: 'Intent-first workspace',
			body: 'Try: "show Q3 revenue", "compare to last year", "plan my tasks", or "clear".'
		}));
	} else {
		keep.delete('hint');
	}

	return {
		widgets: [...keep.values()],
		contextPatch: {
			goals: [...goals].slice(-5),
			turn: context.turn + 1,
			summary: summarize(goals)
		},
		rationale: `Matched intents -> ${[...goals].join(', ') || 'none'}.`
	};
};

function planned(
	id: string,
	kind: string,
	zone: ZoneId,
	span: number,
	props: Record<string, unknown>
): PlannedWidget {
	return { id, kind, zone, span, props };
}

function summarize(goals: Set<string>): string {
	if (goals.size === 0) return '';
	return `User is working on: ${[...goals].join('; ')}.`;
}

function delay(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}
