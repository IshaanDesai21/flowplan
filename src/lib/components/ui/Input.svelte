<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time';
		name?: string;
		placeholder?: string;
		value?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		label?: string;
		error?: string;
		oninput?: (e: Event) => void;
	}

	let {
		id,
		type = 'text',
		name,
		placeholder,
		value = $bindable(''),
		required = false,
		disabled = false,
		class: className = '',
		label,
		error,
		oninput
	}: Props = $props();

	const inputId = id || crypto.randomUUID();
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-secondary">
			{label}
			{#if required}
				<span class="text-[var(--color-danger)]">*</span>
			{/if}
		</label>
	{/if}
	<input
		{type}
		id={inputId}
		{name}
		{placeholder}
		{required}
		{disabled}
		bind:value
		oninput={oninput}
		class="flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-primary transition-colors
			{error
			? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]'
			: 'border-default focus-visible:ring-[var(--color-accent)]'}"
	/>
	{#if error}
		<span class="text-xs text-[var(--color-danger)]">{error}</span>
	{/if}
</div>
