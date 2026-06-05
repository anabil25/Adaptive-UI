<script lang="ts">
	import type { Workspace } from '../core/workspace.svelte';
	import type { ZoneId } from '../core/types';
	import WidgetFrame from './WidgetFrame.svelte';

	interface Props {
		workspace: Workspace;
		zone: ZoneId;
	}

	let { workspace, zone }: Props = $props();

	const widgets = $derived(workspace.widgetsInZone(zone));
</script>

<section class="zone" data-zone={zone} aria-label={`${zone} widgets`}>
	{#each widgets as instance (instance.id)}
		<WidgetFrame {workspace} {instance} />
	{/each}
</section>

<style>
	.zone {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--widget-min)), 1fr));
		gap: var(--zone-gap);
		align-content: start;
		min-inline-size: 0;
	}

	/* Banner spans the top in a single calm row. */
	.zone[data-zone='banner'] {
		grid-template-columns: 1fr;
	}

	/* Rail is a narrow stacked column. */
	.zone[data-zone='rail'] {
		grid-template-columns: 1fr;
	}

	.zone:empty {
		display: none;
	}
</style>
