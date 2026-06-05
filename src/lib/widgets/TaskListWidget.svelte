<script lang="ts">
	import type { WidgetProps } from '../core/types';

	interface TaskItem {
		label: string;
		done: boolean;
	}
	interface TaskListProps extends Record<string, unknown> {
		title: string;
		items: TaskItem[];
	}

	let { instance }: WidgetProps<TaskListProps> = $props();
	const p = $derived(instance.props);
</script>

<div class="tasks">
	<span class="title">{p.title}</span>
	<ul>
		{#each p.items as item, i (i)}
			<li data-done={item.done}>
				<span class="box" aria-hidden="true">{item.done ? '✓' : ''}</span>
				<span class="label">{item.label}</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.tasks {
		display: grid;
		gap: var(--space-sm);
	}
	.title {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--space-2xs);
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-2xs) 0;
		font-size: var(--text-sm);
	}
	.box {
		inline-size: 18px;
		block-size: 18px;
		flex: none;
		display: grid;
		place-items: center;
		border: 1.5px solid var(--color-border-strong);
		border-radius: var(--radius-xs);
		font-size: var(--text-xs);
		color: var(--color-positive);
	}
	li[data-done='true'] .box {
		border-color: var(--color-positive);
		background: hsl(150 60% 55% / 0.14);
	}
	li[data-done='true'] .label {
		color: var(--color-text-faint);
		text-decoration: line-through;
	}
</style>
