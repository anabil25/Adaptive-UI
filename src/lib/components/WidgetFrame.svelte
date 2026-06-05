<script lang="ts">
	import type { Workspace } from '../core/workspace.svelte';
	import type { WidgetInstance } from '../core/types';

	interface Props {
		workspace: Workspace;
		instance: WidgetInstance;
	}

	let { workspace, instance }: Props = $props();

	const def = $derived(workspace.registry.get(instance.kind));

	// Drive the lifecycle: settle after enter, finalize after exit.
	function onAnimationEnd() {
		if (instance.phase === 'exiting') {
			workspace.finalizeExit(instance.id);
		} else if (instance.phase === 'entering') {
			workspace.settle(instance.id);
		}
	}
</script>

<article
	class="widget-frame"
	data-phase={instance.phase}
	style:--span={instance.span}
	onanimationend={onAnimationEnd}
>
	{#if def}
		{@const Widget = def.component}
		<Widget {instance} />
	{:else}
		<div class="widget-missing">Unknown widget: {instance.kind}</div>
	{/if}
</article>

<style>
	.widget-frame {
		grid-column: span min(var(--span, 1), 2);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		padding: var(--space-md);
		min-inline-size: 0;
		will-change: transform, opacity;
	}

	.widget-frame[data-phase='entering'] {
		animation: widget-in var(--life-enter) var(--ease-out) both;
	}

	.widget-frame[data-phase='exiting'] {
		animation: widget-out var(--life-exit) var(--ease-in) both;
		pointer-events: none;
	}

	.widget-missing {
		color: var(--color-danger);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	@keyframes widget-in {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes widget-out {
		from {
			opacity: 1;
			transform: none;
		}
		to {
			opacity: 0;
			transform: translateY(-8px) scale(0.98);
		}
	}
</style>
