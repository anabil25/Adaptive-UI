<script lang="ts">
	import type { Workspace } from '../core/workspace.svelte';
	import { ZONES } from '../core/types';
	import Zone from './Zone.svelte';
	import ChatDock from './ChatDock.svelte';

	interface Props {
		workspace: Workspace;
		placeholder?: string;
	}

	let { workspace, placeholder }: Props = $props();

	const has = (zone: string) => workspace.widgetsInZone(zone).length > 0;
</script>

<div class="canvas">
	{#if has('banner')}
		<div class="region region-banner">
			<Zone {workspace} zone="banner" />
		</div>
	{/if}

	<div class="region region-side">
		<Zone {workspace} zone="side" />
	</div>

	<div class="region region-primary">
		<Zone {workspace} zone="primary" />
	</div>

	<div class="region region-rail">
		<Zone {workspace} zone="rail" />
	</div>

	<div class="dock-anchor">
		<ChatDock {workspace} {placeholder} />
	</div>
</div>

<!-- keep a stable reference to ZONES so future zones render automatically -->
{#if false}
	{#each ZONES as z (z)}<span>{z}</span>{/each}
{/if}

<style>
	.canvas {
		position: relative;
		min-block-size: 100svh;
		max-inline-size: var(--workspace-max);
		margin-inline: auto;
		padding: var(--gutter);
		padding-block-end: calc(var(--chat-dock-height) * 0.5 + var(--space-2xl));
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 2.2fr) minmax(0, 1fr);
		grid-template-areas:
			'banner banner banner'
			'side primary rail';
		gap: var(--zone-gap);
		align-content: start;
	}

	.region-banner {
		grid-area: banner;
	}
	.region-side {
		grid-area: side;
	}
	.region-primary {
		grid-area: primary;
	}
	.region-rail {
		grid-area: rail;
	}

	.region:empty {
		display: none;
	}

	/* Chat dock floats over the canvas, anchored bottom-center. */
	.dock-anchor {
		position: fixed;
		inset-block-end: var(--space-lg);
		inset-inline: 0;
		display: flex;
		justify-content: center;
		padding-inline: var(--gutter);
		pointer-events: none;
		z-index: 50;
	}

	.dock-anchor :global(.dock) {
		pointer-events: auto;
	}

	/* Collapse rail/side under the primary column on narrow viewports. */
	@media (max-width: 60rem) {
		.canvas {
			grid-template-columns: 1fr;
			grid-template-areas:
				'banner'
				'primary'
				'side'
				'rail';
		}
	}
</style>
