<script lang="ts">
	import type { WidgetProps } from '../core/types';

	interface MetricProps extends Record<string, unknown> {
		label: string;
		value: string;
		delta?: string;
		trend?: 'up' | 'down' | 'flat';
	}

	let { instance }: WidgetProps<MetricProps> = $props();
	const p = $derived(instance.props);
</script>

<div class="metric">
	<span class="label">{p.label}</span>
	<span class="value">{p.value}</span>
	{#if p.delta}
		<span class="delta" data-trend={p.trend ?? 'flat'}>
			{p.trend === 'down' ? '↓' : p.trend === 'up' ? '↑' : '→'}
			{p.delta}
		</span>
	{/if}
</div>

<style>
	.metric {
		display: grid;
		gap: var(--space-2xs);
	}
	.label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	.value {
		font-size: var(--text-xl);
		font-weight: 700;
		line-height: 1.1;
	}
	.delta {
		font-size: var(--text-sm);
		font-weight: 600;
		justify-self: start;
		padding: 2px var(--space-xs);
		border-radius: var(--radius-pill);
	}
	.delta[data-trend='up'] {
		color: var(--color-positive);
		background: hsl(150 60% 55% / 0.14);
	}
	.delta[data-trend='down'] {
		color: var(--color-danger);
		background: hsl(355 80% 66% / 0.14);
	}
	.delta[data-trend='flat'] {
		color: var(--color-text-muted);
		background: var(--color-surface-raised);
	}
</style>
