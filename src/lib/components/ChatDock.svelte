<script lang="ts">
	import type { Workspace } from '../core/workspace.svelte';

	interface Props {
		workspace: Workspace;
		placeholder?: string;
	}

	let { workspace, placeholder = 'State your intent…' }: Props = $props();

	let draft = $state('');
	let scroller = $state<HTMLDivElement | null>(null);

	const messages = $derived(workspace.messages);

	// Auto-scroll to the newest message.
	$effect(() => {
		// Touch length so the effect re-runs as messages arrive.
		void messages.length;
		void workspace.thinking;
		if (scroller) scroller.scrollTop = scroller.scrollHeight;
	});

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

<section class="dock" aria-label="Conversation">
	<header class="dock-head">
		<span class="dot" aria-hidden="true"></span>
		<span class="dock-title">Workspace</span>
		{#if workspace.context.goals.length}
			<span class="goal" title="Running context">{workspace.context.goals.at(-1)}</span>
		{/if}
	</header>

	<div class="messages" bind:this={scroller} role="log" aria-live="polite">
		{#each messages as message (message.id)}
			<div class="msg" data-role={message.role}>
				<p>{message.content}</p>
			</div>
		{/each}
		{#if workspace.thinking}
			<div class="msg" data-role="assistant">
				<p class="typing" aria-label="Assistant is responding">
					<span></span><span></span><span></span>
				</p>
			</div>
		{/if}
	</div>

	<form class="composer" onsubmit={submit}>
		<textarea
			bind:value={draft}
			onkeydown={onKeydown}
			{placeholder}
			rows="1"
			aria-label="Message"
		></textarea>
		<button type="submit" disabled={workspace.thinking || !draft.trim()} aria-label="Send">
			↑
		</button>
	</form>
</section>

<style>
	.dock {
		display: grid;
		grid-template-rows: auto 1fr auto;
		inline-size: var(--chat-dock-width);
		max-inline-size: 100%;
		block-size: min(var(--chat-dock-height), 70vh);
		background: var(--color-surface-overlay);
		backdrop-filter: blur(12px);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}

	.dock-head {
		display: flex;
		align-items: center;
		gap: var(--gap-tight);
		padding: var(--space-sm) var(--space-md);
		border-block-end: 1px solid var(--color-border);
	}

	.dot {
		inline-size: 8px;
		block-size: 8px;
		border-radius: var(--radius-pill);
		background: var(--color-positive);
		box-shadow: 0 0 8px var(--color-positive);
	}

	.dock-title {
		font-size: var(--text-sm);
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.goal {
		margin-inline-start: auto;
		font-size: var(--text-xs);
		color: var(--color-accent-text);
		background: var(--color-accent-soft);
		padding: 2px var(--space-xs);
		border-radius: var(--radius-pill);
		max-inline-size: 14ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.messages {
		overflow-y: auto;
		padding: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.msg {
		max-inline-size: 90%;
	}

	.msg[data-role='user'] {
		justify-self: end;
	}

	.msg p {
		margin: 0;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.msg[data-role='user'] p {
		background: var(--color-accent);
		color: hsl(222 40% 10%);
		border-end-end-radius: var(--radius-xs);
	}

	.msg[data-role='assistant'] p {
		background: var(--color-surface-raised);
		color: var(--color-text);
		border-end-start-radius: var(--radius-xs);
	}

	.typing {
		display: inline-flex;
		gap: 4px;
	}

	.typing span {
		inline-size: 6px;
		block-size: 6px;
		border-radius: var(--radius-pill);
		background: var(--color-text-faint);
		animation: blink 1.2s var(--ease-out) infinite;
	}

	.typing span:nth-child(2) {
		animation-delay: 0.18s;
	}
	.typing span:nth-child(3) {
		animation-delay: 0.36s;
	}

	@keyframes blink {
		0%,
		60%,
		100% {
			opacity: 0.25;
		}
		30% {
			opacity: 1;
		}
	}

	.composer {
		display: flex;
		align-items: end;
		gap: var(--gap-tight);
		padding: var(--space-sm);
		border-block-start: 1px solid var(--color-border);
	}

	textarea {
		flex: 1;
		resize: none;
		max-block-size: 6lh;
		background: var(--color-bg);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-xs) var(--space-sm);
		font: inherit;
		font-size: var(--text-sm);
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
