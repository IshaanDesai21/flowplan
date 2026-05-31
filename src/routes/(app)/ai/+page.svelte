<script lang="ts">
	import { afterUpdate } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();
	
	let messages = $state(data.conversation.messages);
	let inputMessage = $state('');
	let isLoading = $state(false);
	let messagesContainer: HTMLDivElement;

	const suggestionChips = [
		"What should I work on first today?",
		"Help me fit these tasks into my week.",
		"Generate a study plan.",
		"How can I avoid missing deadlines?"
	];

	afterUpdate(() => {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});

	async function sendMessage(content: string) {
		if (!content.trim() || isLoading) return;

		const userMsg = { role: 'user', content };
		messages = [...messages, userMsg];
		inputMessage = '';
		isLoading = true;

		try {
			const res = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					conversationId: data.conversation.id,
					message: content
				})
			});

			if (!res.ok) throw new Error('API error');
			
			const responseData = await res.json();
			messages = [...messages, responseData.message];
		} catch (error) {
			messages = [...messages, { role: 'system', content: 'Sorry, I encountered an error. Please try again.' }];
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>AI Assistant | FlowPlan</title>
</svelte:head>

<div class="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-surface border border-default rounded-xl shadow-sm overflow-hidden">
	<!-- Header -->
	<div class="h-14 border-b border-default bg-[var(--color-surface-hover)] flex items-center px-4 shrink-0">
		<div class="h-8 w-8 rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center mr-3">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
		</div>
		<div>
			<h2 class="font-semibold text-primary">FlowPlan Assistant</h2>
			<p class="text-xs text-secondary flex items-center gap-1">
				<span class="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block"></span> Online
			</p>
		</div>
	</div>

	<!-- Messages -->
	<div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-4 space-y-6">
		{#each messages as msg}
			{#if msg.role === 'user'}
				<div class="flex justify-end animate-slide-in-up">
					<div class="bg-[var(--color-accent)] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-sm">
						{msg.content}
					</div>
				</div>
			{:else if msg.role === 'assistant'}
				<div class="flex justify-start animate-slide-in-up">
					<div class="bg-[var(--color-surface-hover)] border border-default text-primary px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[80%] text-sm shadow-sm prose prose-sm dark:prose-invert">
						{msg.content}
					</div>
				</div>
			{:else}
				<div class="flex justify-center my-2">
					<span class="bg-[var(--color-danger-light)] text-[var(--color-danger)] text-xs px-2 py-1 rounded-full">{msg.content}</span>
				</div>
			{/if}
		{/each}
		
		{#if isLoading}
			<div class="flex justify-start animate-fade-in">
				<div class="bg-[var(--color-surface-hover)] border border-default text-primary px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
					<div class="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style="animation-delay: 0ms"></div>
					<div class="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style="animation-delay: 150ms"></div>
					<div class="w-1.5 h-1.5 bg-tertiary rounded-full animate-bounce" style="animation-delay: 300ms"></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Suggestions & Input -->
	<div class="p-4 bg-page border-t border-default shrink-0">
		<div class="flex flex-wrap gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
			{#each suggestionChips as chip}
				<button 
					class="whitespace-nowrap text-xs text-[var(--color-accent)] bg-[var(--color-accent-light)] hover:bg-[var(--color-accent)] hover:text-white border border-[var(--color-accent-light)] px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
					onclick={() => sendMessage(chip)}
				>
					{chip}
				</button>
			{/each}
		</div>
		
		<form 
			class="flex items-center gap-2 relative"
			onsubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }}
		>
			<input 
				type="text" 
				bind:value={inputMessage}
				placeholder="Message FlowPlan AI..." 
				class="flex-1 bg-surface border border-default rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-primary placeholder:text-tertiary transition-all"
				disabled={isLoading}
			/>
			<button 
				type="submit" 
				disabled={!inputMessage.trim() || isLoading}
				class="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-accent-hover)] transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
			</button>
		</form>
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
