/* =====================================================================
   intent-ui-kit — public API

   An intent-first UI kit: a chat surface drives a workspace where
   widgets materialize, persist, and dissolve around the conversation.

   Two pluggable LLM calls per turn:
     respond()   -> assistant reply   (Responder)
     directUI()  -> desired canvas     (Director)

   Quick start:
     import {
       createWorkspace, createRegistry, defaultWidgets,
       mockResponder, mockDirector, WorkspaceCanvas
     } from 'intent-ui-kit';
   ===================================================================== */

// Core engine
export { Workspace, createWorkspace } from './core/workspace.svelte';
export { WidgetRegistry, createRegistry } from './core/registry';
export { mockResponder, mockDirector } from './core/resolvers';
export { emptyContext, ZONES } from './core/types';
export type {
	Role,
	ChatMessage,
	ChatReply,
	ZoneId,
	WidgetDefinition,
	WidgetProps,
	WidgetInstance,
	PlannedWidget,
	UIPlan,
	RunningContext,
	ResponderInput,
	DirectorInput,
	Responder,
	Director
} from './core/types';
export type { WorkspaceOptions } from './core/workspace.svelte';

// Components
export { default as WorkspaceCanvas } from './components/WorkspaceCanvas.svelte';
export { default as ChatDock } from './components/ChatDock.svelte';
export { default as Zone } from './components/Zone.svelte';
export { default as WidgetFrame } from './components/WidgetFrame.svelte';

// Default widget pack
export {
	defaultWidgets,
	MetricWidget,
	TrendWidget,
	TaskListWidget,
	WeatherWidget,
	NoteWidget
} from './widgets';
