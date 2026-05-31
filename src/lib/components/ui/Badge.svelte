<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
		size?: 'sm' | 'md';
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'md',
		class: className = '',
		children
	}: Props = $props();

	const variants = {
		default: 'bg-[var(--color-surface-hover)] text-secondary border-default',
		primary: 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border-[var(--color-accent-light)]',
		success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border-[var(--color-success-light)]',
		warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border-[var(--color-warning-light)]',
		danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border-[var(--color-danger-light)]',
		info: 'bg-[var(--color-info-light)] text-[var(--color-info)] border-[var(--color-info-light)]'
	};

	const sizes = {
		sm: 'px-1.5 py-0.5 text-[10px]',
		md: 'px-2.5 py-0.5 text-xs'
	};
</script>

<span
	class="inline-flex items-center rounded-full border font-medium transition-colors {variants[
		variant
	]} {sizes[size]} {className}"
>
	{@render children?.()}
</span>
