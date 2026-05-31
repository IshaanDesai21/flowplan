<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Tab {
		id: string;
		label: string;
		icon?: string;
	}

	interface Props {
		tabs: Tab[];
		activeId: string;
		class?: string;
		onchange: (id: string) => void;
	}

	let {
		tabs,
		activeId,
		class: className = '',
		onchange
	}: Props = $props();
</script>

<div class="flex space-x-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-active)] p-1 {className}">
	{#each tabs as tab}
		<button
			type="button"
			class="flex-1 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface-active)]
				{activeId === tab.id
				? 'bg-surface text-primary shadow-sm'
				: 'text-tertiary hover:text-secondary hover:bg-[var(--color-surface-hover)]'}"
			onclick={() => onchange(tab.id)}
		>
			<div class="flex items-center justify-center gap-2">
				{#if tab.icon}
					<!-- Icon slot could go here -->
				{/if}
				{tab.label}
			</div>
		</button>
	{/each}
</div>
