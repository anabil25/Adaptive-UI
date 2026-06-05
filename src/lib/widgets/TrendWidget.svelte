<script lang="ts">
	import type { WidgetProps } from '../core/types';

	interface TrendProps extends Record<string, unknown> {
		title: string;
		series: number[];
		baseline?: number[];
	}

	let { instance }: WidgetProps<TrendProps> = $props();
	const p = $derived(instance.props);

	const W = 260;
	const H = 90;

	function path(values: number[]): string {
		if (values.length < 2) return '';
		const max = Math.max(...values, ...(p.baseline ?? []));
		const min = Math.min(...values, ...(p.baseline ?? []));
		const span = max - min || 1;
		const step = W / (values.length - 1);
		return values
			.map((v, i) => {
				const x = i * step;
				const y = H - ((v - min) / span) * H;
				return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	const main = $derived(path(p.series));
	const base = $derived(p.baseline ? path(p.baseline) : '');
</script>

<div class="trend">
	<span class="title">{p.title}</span>
	<svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={p.title}>
		{#if base}
			<path class="baseline" d={base} />
		{/if}
		<path class="line" d={main} />
	</svg>
	{#if base}
		<div class="legend">
			<span><i class="swatch now"></i>This year</span>
			<span><i class="swatch was"></i>Last year</span>
		</div>
	{/if}
</div>

<style>
	.trend {
		display: grid;
		gap: var(--space-sm);
	}
	.title {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	svg {
		inline-size: 100%;
		block-size: clamp(70px, 12vw, 110px);
		overflow: visible;
	}
	.line {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.baseline {
		fill: none;
		stroke: var(--color-text-faint);
		stroke-width: 1.5;
		stroke-dasharray: 4 4;
	}
	.legend {
		display: flex;
		gap: var(--space-md);
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
	}
	.swatch {
		inline-size: 12px;
		block-size: 3px;
		border-radius: var(--radius-pill);
	}
	.swatch.now {
		background: var(--color-accent);
	}
	.swatch.was {
		background: var(--color-text-faint);
	}
</style>
