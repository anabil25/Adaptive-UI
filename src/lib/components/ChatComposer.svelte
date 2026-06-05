<script lang="ts">
	import type { Workspace } from '../core/workspace.svelte';

	interface Props {
		workspace: Workspace;
		placeholder?: string;
	}

	let { workspace, placeholder = 'State your intent…' }: Props = $props();

	let draft = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const text = draft;
		draft = '';
		await workspace.send(text);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
		}
	}
</script>

<form class="composer" onsubmit={submit}>
	{#if workspace.context.goals.length}
		<span class="goal" title="Running context">{workspace.context.goals.at(-1)}</span>
	{/if}
	<textarea
		bind:value={draft}
		onkeydown={onKeydown}
		{placeholder}
		rows="1"
		aria-label="Message"
	></textarea>
	<button type="submit" disabled={workspace.thinking || !draft.trim()} aria-label="Send"> ↑ </button>
</form>

<style>
	.composer {
		display: flex;
		align-items: end;
		gap: var(--gap-tight);
		inline-size: min(100%, var(--workspace-max));
		margin-inline: auto;
		padding: var(--space-sm);
		background: var(--color-surface-overlay);
		backdrop-filter: blur(12px);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
	}

	.goal {
		align-self: center;
		font-size: var(--text-xs);
		color: var(--color-accent-text);
		background: var(--color-accent-soft);
		padding: 4px var(--space-sm);
		border-radius: var(--radius-pill);
		max-inline-size: 18ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	textarea {
		flex: 1;
		resize: none;
		max-block-size: 6lh;
		background: var(--color-bg);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		font: inherit;
		font-size: var(--text-base);
	}

	textarea:focus {
		border-color: var(--color-accent);
		outline: none;
	}

	button {
		inline-size: var(--tap-target);
		block-size: var(--tap-target);
		flex: none;
		border: none;
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: hsl(222 40% 10%);
		font-size: var(--text-lg);
		font-weight: 700;
		transition: opacity 120ms ease;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
