<script lang="ts">
	import type { WidgetProps } from '../core/types';

	interface WeatherProps extends Record<string, unknown> {
		place: string;
		temp: number;
		summary: string;
	}

	let { instance }: WidgetProps<WeatherProps> = $props();
	const p = $derived(instance.props);
</script>

<div class="weather">
	<span class="place">{p.place}</span>
	<span class="temp">{p.temp}°</span>
	<span class="summary">{p.summary}</span>
</div>

<style>
	.weather {
		display: grid;
		gap: var(--space-2xs);
	}
	.place {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	.temp {
		font-size: var(--text-xl);
		font-weight: 700;
		line-height: 1;
	}
	.summary {
		font-size: var(--text-sm);
		color: var(--color-text);
	}
</style>
