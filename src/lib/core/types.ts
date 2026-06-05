import type { Component } from 'svelte';

/**
 * Core domain types for intent-ui-kit.
 *
 * The kit runs a two-call loop per user turn:
 *  - Responder → a chat reply (prose, streams into the transcript)
 *  - Director  → an untrusted UIPlan (the desired end-state of the canvas)
 * The engine diffs the plan against what is mounted and reconciles
 * (materialize / persist / dissolve). Both seams are plain function types
 * so a mock and a real LLM are interchangeable.
 */

/* ------------------------------------------------------------------ *
 * Result (no throw for expected I/O failures)
 * ------------------------------------------------------------------ */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/* ------------------------------------------------------------------ *
 * Zones — engine-owned regions around the center conversation
 * ------------------------------------------------------------------ */
export const Zone = {
	banner: 'banner',
	primary: 'primary',
	side: 'side',
	rail: 'rail'
} as const;
export type ZoneId = (typeof Zone)[keyof typeof Zone];

export const ZONE_ORDER: readonly ZoneId[] = ['banner', 'rail', 'primary', 'side'];

/* ------------------------------------------------------------------ *
 * Widget registry — kind → props correlation (consumer-extensible)
 * ------------------------------------------------------------------ */
export interface MetricProps extends Record<string, unknown> {
	label: string;
	value: string;
	delta?: string;
	trend?: 'up' | 'down' | 'flat';
}

export interface TableProps extends Record<string, unknown> {
	title?: string;
	columns: string[];
	rows: Array<Array<string | number>>;
}

export interface ChartProps extends Record<string, unknown> {
	title: string;
	series: number[];
	baseline?: number[];
	unit?: string;
}

export interface FormField {
	name: string;
	label: string;
	type?: 'text' | 'number' | 'email';
	placeholder?: string;
}
export interface FormProps extends Record<string, unknown> {
	title: string;
	fields: FormField[];
	submitLabel?: string;
}

export interface NoteProps extends Record<string, unknown> {
	title: string;
	body: string;
	source?: string;
}

/**
 * The extensible kind→props map. Consumers augment this interface via
 * module augmentation to register their own widget kinds.
 */
export interface WidgetPropMap {
	metric: MetricProps;
	table: TableProps;
	chart: ChartProps;
	form: FormProps;
	note: NoteProps;
}

export type WidgetKind = keyof WidgetPropMap;
export type AnyWidgetProps = WidgetPropMap[WidgetKind];

/* ------------------------------------------------------------------ *
 * Lifecycle
 * ------------------------------------------------------------------ */
export type WidgetPhase = 'present' | 'exiting';

/** A mounted widget — runtime state the canvas renders. */
export interface WidgetInstance {
	id: string;
	kind: WidgetKind;
	zone: ZoneId;
	span: number;
	props: AnyWidgetProps;
	phase: WidgetPhase;
	pinned: boolean;
	rationale?: string;
}

/** What a widget component receives. Narrow `instance.props` by kind inside. */
export interface WidgetRenderProps {
	instance: WidgetInstance;
}

export interface WidgetDef {
	kind: WidgetKind;
	label: string;
	component: Component<WidgetRenderProps>;
	defaultZone: ZoneId;
	defaultSpan: number;
}

/* ------------------------------------------------------------------ *
 * Director output (untrusted until parsed) → reconcile input
 * ------------------------------------------------------------------ */
export interface PlannedWidget<K extends WidgetKind = WidgetKind> {
	id: string;
	kind: K;
	zone?: ZoneId;
	span?: number;
	props: WidgetPropMap[K];
	rationale?: string;
}

export interface UIPlan {
	widgets: PlannedWidget[];
	contextPatch?: Partial<RunningContext>;
	rationale?: string;
}

/* ------------------------------------------------------------------ *
 * Conversation + running context
 * ------------------------------------------------------------------ */
export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
	id: string;
	role: ChatRole;
	content: string;
	streaming?: boolean;
}

/** A small persistent model of the user's goal, read by both calls. */
export interface RunningContext {
	goal?: string;
	topics: string[];
	facts: Record<string, unknown>;
}

/* ------------------------------------------------------------------ *
 * Pluggable seams — typed contracts (mock or real LLM)
 * ------------------------------------------------------------------ */
export interface ResponderInput {
	messages: ChatMessage[];
	context: RunningContext;
	signal?: AbortSignal;
}

export interface ChatReply {
	text: string;
}

/** A compact view of the canvas the Director sees each turn. */
export interface MountedSummary {
	id: string;
	kind: WidgetKind;
	zone: ZoneId;
	pinned: boolean;
}

export interface DirectorInput {
	messages: ChatMessage[];
	context: RunningContext;
	mounted: MountedSummary[];
	signal?: AbortSignal;
}

export type Responder = (input: ResponderInput) => Promise<ChatReply>;

/**
 * The Director returns *untrusted* raw output (JSON-shaped). It is parsed at
 * the boundary (`parsePlan`) before it reaches the reconciler.
 */
export type Director = (input: DirectorInput) => Promise<unknown>;
