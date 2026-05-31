<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		hover?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		class: className = '',
		padding = 'md',
		hover = false,
		onclick,
		children
	}: Props = $props();

	const paddings = {
		none: '',
		sm: 'p-3',
		md: 'p-5',
		lg: 'p-8'
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="rounded-[var(--radius-lg)] border border-default bg-surface shadow-sm transition-all
		{paddings[padding]}
		{hover ? 'hover:border-[var(--color-accent)] hover:shadow-md cursor-pointer' : ''}
		{className}"
	{onclick}
>
	{@render children?.()}
</div>
