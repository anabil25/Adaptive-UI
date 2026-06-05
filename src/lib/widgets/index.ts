/* =====================================================================
   Default widget pack — example WidgetDefinitions wired to the kit's
   demo widgets. Apps can use this pack as-is, extend it, or replace it.
   ===================================================================== */

import type { WidgetDefinition } from '../core/types';
import MetricWidget from './MetricWidget.svelte';
import TrendWidget from './TrendWidget.svelte';
import TaskListWidget from './TaskListWidget.svelte';
import WeatherWidget from './WeatherWidget.svelte';
import NoteWidget from './NoteWidget.svelte';

export const defaultWidgets: WidgetDefinition[] = [
	{ kind: 'metric', label: 'Metric', component: MetricWidget, defaultZone: 'primary', defaultSpan: 1 },
	{ kind: 'trend', label: 'Trend chart', component: TrendWidget, defaultZone: 'primary', defaultSpan: 2 },
	{ kind: 'tasklist', label: 'Task list', component: TaskListWidget, defaultZone: 'primary', defaultSpan: 2 },
	{ kind: 'weather', label: 'Weather', component: WeatherWidget, defaultZone: 'rail', defaultSpan: 1 },
	{ kind: 'note', label: 'Note', component: NoteWidget, defaultZone: 'banner', defaultSpan: 2 }
];

export { MetricWidget, TrendWidget, TaskListWidget, WeatherWidget, NoteWidget };
