<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant' | 'system';
		content: string;
	}

	let messages = $state<ChatMessage[]>([]);
	
	$effect.pre(() => {
		if (messages.length === 0 && data.conversation?.messages) {
			messages = (data.conversation.messages as any[]).map((m: any) => ({
				id: m.id ?? crypto.randomUUID(),
				role: m.role,
				content: m.content
			}));
		}
	});
	let inputMessage = $state('');
	let isLoading = $state(false);
	let streamingId = $state<string | null>(null);
	let messagesContainer: HTMLDivElement;
	let abortController: AbortController | null = null;

	const suggestionChips = [
		'What should I work on first today?',
		'Help me plan my week.',
		'What are my highest priority tasks?',
		'Give me productivity tips.',
		'Do I have any scheduling conflicts?'
	];

	let isScrolledUp = $state(false);

	function handleScroll(e: Event) {
		const target = e.target as HTMLElement;
		isScrolledUp = target.scrollHeight - target.scrollTop - target.clientHeight > 50;
	}

	$effect(() => {
		messages;
		if (messagesContainer && !isScrolledUp) {
			requestAnimationFrame(() => {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			});
		}
	});

	/** Render markdown: bold, bullets, headers, newlines */
	function renderMarkdown(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/^#{1,3}\s+(.+)$/gm, '<strong class="md-heading">$1</strong>')
			.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
			.replace(/(<li>[\s\S]*?<\/li>)+/g, (m) => `<ul class="md-list">${m}</ul>`)
			.replace(/\n/g, '<br>');
	}

	async function sendMessage(content: string) {
		if (!content.trim() || isLoading || streamingId) return;

		const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content };
		messages = [...messages, userMsg];
		inputMessage = '';
		isLoading = true;

		const aiId = crypto.randomUUID();

		abortController = new AbortController();

		try {
			const res = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: content }),
				signal: abortController.signal
			});

			if (!res.ok) throw new Error(`API error ${res.status}`);
			if (!res.body) throw new Error('No response body');

			// Add empty AI message — will fill via streaming
			messages = [...messages, { id: aiId, role: 'assistant', content: '' }];
			streamingId = aiId;
			isLoading = false;

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let fullContent = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				fullContent += decoder.decode(value, { stream: true });
				// Reactive update — Svelte re-renders each chunk
				messages = messages.map((m) =>
					m.id === aiId ? { ...m, content: fullContent } : m
				);
			}
		} catch (err: any) {
			if (err.name === 'AbortError') {
				// User manually aborted the stream
				messages = messages.map(m => m.id === aiId ? { ...m, content: m.content + ' *(Generation stopped by user)*' } : m);
			} else {
				console.error('Chat error:', err);
				messages = messages.filter((m) => m.id !== aiId);
				messages = [
					...messages,
					{
						id: crypto.randomUUID(),
						role: 'system',
						content: 'Something went wrong. Please try again.'
					}
				];
			}
			isLoading = false;
		} finally {
			streamingId = null;
			abortController = null;
		}
	}

	function stopGeneration() {
		if (abortController) {
			abortController.abort();
		}
	}
</script>

<svelte:head>
	<title>AI Assistant | FlowPlan</title>
</svelte:head>

<div class="ai-page">
	<div class="chat-window">
		<!-- Header -->
		<div class="chat-header">
			<div class="ai-avatar">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
				</svg>
			</div>
			<div>
				<h2 class="chat-title">FlowPlan Assistant</h2>
				<p class="chat-status">
					<span class="status-dot"></span>
					NVIDIA Llama 3.1 70B
				</p>
			</div>
		</div>

		<!-- Messages -->
		<div bind:this={messagesContainer} class="messages-area" onscroll={handleScroll}>
			{#each messages as msg (msg.id)}
				{#if msg.role === 'user'}
					<div class="msg-row user-row">
						<div class="msg user-msg">{msg.content}</div>
					</div>
				{:else if msg.role === 'assistant'}
					<div class="msg-row ai-row">
						<div class="ai-bubble">
							<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
							</svg>
						</div>
						<div class="msg ai-msg">
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							{@html renderMarkdown(msg.content)}
							{#if streamingId === msg.id}
								<span class="cursor-blink">▍</span>
							{/if}
						</div>
					</div>
				{:else}
					<div class="msg-row center-row">
						<span class="error-pill">{msg.content}</span>
					</div>
				{/if}
			{/each}

			{#if isLoading}
				<div class="msg-row ai-row">
					<div class="ai-bubble">
						<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
						</svg>
					</div>
					<div class="msg ai-msg typing-dots">
						<span></span><span></span><span></span>
					</div>
				</div>
			{/if}
		</div>

			<!-- Input Area -->
		<div class="input-area">
			{#if streamingId || isLoading}
				<div class="stop-container">
					<button class="stop-btn" onclick={stopGeneration}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
						Stop Generating
					</button>
				</div>
			{/if}
			<div class="chips">
				{#each suggestionChips as chip}
					<button class="chip" onclick={() => sendMessage(chip)} disabled={!!streamingId || isLoading}>
						{chip}
					</button>
				{/each}
			</div>
			<form class="input-form" onsubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }}>
				<input
					type="text"
					bind:value={inputMessage}
					placeholder="Message FlowPlan AI..."
					class="input-field"
					disabled={isLoading || !!streamingId}
				/>
				<button
					type="submit"
					disabled={!inputMessage.trim() || isLoading || !!streamingId}
					class="send-btn"
					aria-label="Send message"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<line x1="22" y1="2" x2="11" y2="13"/>
						<polygon points="22 2 15 22 11 13 2 9 22 2"/>
					</svg>
				</button>
			</form>
		</div>
	</div>
</div>

<style>
	.ai-page {
		height: calc(100vh - 120px);
		display: flex;
		flex-direction: column;
		max-width: 860px;
		margin: 0 auto;
		width: 100%;
	}
	.chat-window {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		overflow: hidden;
		min-height: 0;
	}

	/* Header */
	.chat-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface-hover);
		flex-shrink: 0;
	}
	.ai-avatar {
		width: 34px;
		height: 34px;
		border-radius: var(--radius-md);
		background: var(--color-accent-light);
		color: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.chat-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}
	.chat-status {
		font-size: 0.72rem;
		color: var(--color-text-secondary);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-success);
		display: inline-block;
	}

	/* Messages */
	.messages-area {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 0;
		scroll-behavior: smooth;
	}
	.msg-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
	}
	.user-row { justify-content: flex-end; }
	.ai-row { justify-content: flex-start; }
	.center-row { justify-content: center; }

	.ai-bubble {
		width: 26px;
		height: 26px;
		border-radius: var(--radius-md);
		background: var(--color-accent-light);
		color: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-bottom: 2px;
	}

	.msg {
		max-width: min(78%, 580px);
		padding: 0.7rem 0.95rem;
		border-radius: 1.1rem;
		font-size: 0.875rem;
		line-height: 1.6;
	}
	.user-msg {
		background: var(--color-accent);
		color: white;
		border-bottom-right-radius: 0.25rem;
	}
	.ai-msg {
		background: var(--color-surface-hover);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		border-bottom-left-radius: 0.25rem;
	}

	:global(.ai-msg ul.md-list) {
		list-style: disc;
		padding-left: 1.25rem;
		margin: 0.25rem 0;
	}
	:global(.ai-msg strong) { font-weight: 700; }
	:global(.ai-msg strong.md-heading) {
		display: block;
		font-size: 0.9rem;
		margin: 0.25rem 0;
	}

	.cursor-blink {
		display: inline-block;
		color: var(--color-accent);
		animation: blink 0.7s step-end infinite;
		font-size: 0.9rem;
		margin-left: 1px;
	}
	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	.error-pill {
		background: var(--color-danger-light);
		color: var(--color-danger);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.78rem;
	}

	/* Typing dots */
	.typing-dots {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0.75rem 1rem !important;
	}
	.typing-dots span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-text-tertiary);
		animation: bounce 1.2s infinite;
	}
	.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
	.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); }
		30% { transform: translateY(-5px); }
	}

	/* Input */
	.input-area {
		padding: 0.875rem 1.25rem;
		border-top: 1px solid var(--color-border);
		background: var(--color-bg);
		flex-shrink: 0;
	}
	.chips {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		margin-bottom: 0.625rem;
	}
	.chip {
		font-size: 0.72rem;
		padding: 0.3rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}
	.chip:hover:not(:disabled) {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: var(--color-accent-light);
	}
	.chip:disabled { opacity: 0.45; cursor: not-allowed; }
	.input-form {
		display: flex;
		align-items: center;
		position: relative;
	}
	.input-field {
		flex: 1;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		padding: 0.7rem 3rem 0.7rem 1.1rem;
		font-size: 0.875rem;
		color: var(--color-text);
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.input-field:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-light);
	}
	.input-field::placeholder { color: var(--color-text-tertiary); }
	.send-btn {
		position: absolute;
		right: 5px;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: var(--color-accent);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, transform 0.1s;
	}
	.send-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
		transform: scale(1.05);
	}
	.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	.stop-container {
		display: flex;
		justify-content: center;
		margin-bottom: 0.75rem;
	}
	.stop-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		padding: 0.35rem 0.875rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		box-shadow: var(--shadow-sm);
	}
	.stop-btn:hover {
		border-color: var(--color-danger);
		color: var(--color-danger);
	}
</style>
