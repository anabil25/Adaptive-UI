<script lang="ts">
	import type { Workspace } from '../core/workspace.svelte';

	interface Props {
		workspace: Workspace;
	}

	let { workspace }: Props = $props();

	let scroller = $state<HTMLDivElement | null>(null);
	const messages = $derived(workspace.messages);

	// Auto-scroll to the newest message.
	$effect(() => {
		void messages.length;
		void workspace.thinking;
		if (scroller) scroller.scrollTop = scroller.scrollHeight;
	});
</script>

<section class="transcript" aria-label="Conversation">
	<div class="log" bind:this={scroller} role="log" aria-live="polite">
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
</section>

<style>
	.transcript {
		display: grid;
		min-block-size: 0;
		block-size: 100%;
	}

	.log {
		overflow-y: auto;
		padding: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		align-content: end;
	}

	.msg {
		max-inline-size: min(62ch, 90%);
	}

	.msg[data-role='user'] {
		justify-self: end;
	}

	.msg p {
		margin: 0;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-lg);
		font-size: var(--text-base);
		line-height: 1.5;
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
</style>
