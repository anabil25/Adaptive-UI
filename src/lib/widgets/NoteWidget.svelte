<script lang="ts">
	import type { WidgetProps } from '../core/types';

	interface NoteProps extends Record<string, unknown> {
		title: string;
		body: string;
	}

	let { instance }: WidgetProps<NoteProps> = $props();
	const p = $derived(instance.props);
</script>

<div class="note">
	<span class="title">{p.title}</span>
	<p class="body">{p.body}</p>
</div>

<style>
	.note {
		display: grid;
		gap: var(--space-2xs);
		border-inline-start: 2px solid var(--color-accent);
		padding-inline-start: var(--space-sm);
	}
	.title {
		font-size: var(--text-base);
		font-weight: 600;
	}
	.body {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
