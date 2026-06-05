/* =====================================================================
   Intent UI Kit — core type contracts
   The whole kit is built on these. Two LLM calls produce two outputs:
     1. respond()   -> ChatReply         (what the user reads)
     2. directUI()  -> UIPlan            (what the user sees materialize)
   ===================================================================== */

import type { Component } from 'svelte';

/* ---------------------------------------------------------------------
   Conversation
   ------------------------------------------------------------------- */

export type Role = 'user' | 'assistant';

export interface ChatMessage {
	id: string;
	role: Role;
	content: string;
	createdAt: number;
}

/** Output of the Responder call (call A). */
export interface ChatReply {
	content: string;
}

/* ---------------------------------------------------------------------
   Zones — engine-owned layout regions around the center chat dock.
   The UI Director places widgets into zones; the engine reflows them.
   ------------------------------------------------------------------- */

export type ZoneId = 'primary' | 'side' | 'rail' | 'banner';

export const ZONES: ZoneId[] = ['banner', 'primary', 'side', 'rail'];

/* ---------------------------------------------------------------------
   Widgets — author-registered UI primitives the Director can summon.
   ------------------------------------------------------------------- */

/** A widget definition registered by the app author. */
export interface WidgetDefinition<P extends Record<string, unknown> = Record<string, unknown>> {
	/** Stable kind id the Director references, e.g. "metric", "table". */
	kind: string;
	/** Human label used in registry/debugging. */
	label: string;
	/** The Svelte component rendered for this widget. */
	component: Component<WidgetProps<P>>;
	/** Default zone if the Director does not specify one. */
	defaultZone?: ZoneId;
	/** Relative layout weight within a zone (1 = normal, 2 = double). */
	defaultSpan?: number;
}

/** Props every widget component receives. */
export interface WidgetProps<P extends Record<string, unknown> = Record<string, unknown>> {
	/** The live instance backing this render. */
	instance: WidgetInstance<P>;
}

/** A mounted, on-screen widget instance. */
export interface WidgetInstance<P extends Record<string, unknown> = Record<string, unknown>> {
	/** Director-assigned stable id. Identity for the diff/reconcile pass. */
	id: string;
	kind: string;
	zone: ZoneId;
	span: number;
	props: P;
	/** Lifecycle phase, drives enter/exit animation. */
	phase: 'entering' | 'present' | 'exiting';
	/** Turn index when this instance first appeared. */
	bornAt: number;
}

/* ---------------------------------------------------------------------
   UI Plan — declarative output of the Director call (call B).
   The Director emits the DESIRED end-state of the canvas. The engine
   diffs it against what is mounted: absent -> dissolve, new -> mount,
   shared -> update in place. The Director never issues remove commands.
   ------------------------------------------------------------------- */

/** One widget the Director wants present after this turn. */
export interface PlannedWidget<P extends Record<string, unknown> = Record<string, unknown>> {
	id: string;
	kind: string;
	zone?: ZoneId;
	span?: number;
	props: P;
}

/** Full desired canvas state for a turn. */
export interface UIPlan {
	widgets: PlannedWidget[];
	/** Optional partial update the Director makes to the running context. */
	contextPatch?: Partial<RunningContext>;
	/** Optional short rationale, surfaced in dev/debug overlays. */
	rationale?: string;
}

/* ---------------------------------------------------------------------
   Running Context — the system's persistent model of the user's goal.
   Read AND written by the Director across turns. This is what lets the
   canvas keep the Q3 view and layer in the comparison, instead of
   rebuilding from scratch every message.
   ------------------------------------------------------------------- */

export interface RunningContext {
	/** Inferred active goals, most recent first. */
	goals: string[];
	/** Salient entities the user has referenced (ids, names, filters). */
	entities: Record<string, unknown>;
	/** Rolling natural-language summary of the session so far. */
	summary: string;
	/** Turn counter, incremented each user message. */
	turn: number;
}

export function emptyContext(): RunningContext {
	return { goals: [], entities: {}, summary: '', turn: 0 };
}

/* ---------------------------------------------------------------------
   Resolver seams — the two pluggable LLM calls.
   Mock implementations satisfy these now; a real LLM drops in later
   without touching the engine or components.
   ------------------------------------------------------------------- */

export interface ResponderInput {
	messages: ChatMessage[];
	context: RunningContext;
}

export interface DirectorInput {
	messages: ChatMessage[];
	context: RunningContext;
	/** Kinds the Director is allowed to use (the registered widgets). */
	availableKinds: string[];
	/** Currently mounted widgets, so the Director can keep/evolve them. */
	mounted: WidgetInstance[];
}

/** Call A: conversation -> assistant reply. */
export type Responder = (input: ResponderInput) => Promise<ChatReply>;

/** Call B: conversation + context -> desired canvas state. */
export type Director = (input: DirectorInput) => Promise<UIPlan>;
