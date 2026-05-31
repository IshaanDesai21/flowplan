<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		onclick
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

	const variants = {
		primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
		secondary:
			'bg-[var(--color-surface-active)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]',
		outline:
			'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]',
		ghost: 'bg-transparent hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]',
		danger: 'bg-[var(--color-danger)] text-white hover:opacity-90'
	};

	const sizes = {
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 py-2 text-sm',
		lg: 'h-12 px-8 text-base',
		icon: 'h-10 w-10'
	};
</script>

<button
	{type}
	{disabled}
	class="{baseClasses} {variants[variant]} {sizes[size]} {className}"
	{onclick}
>
	{@render children?.()}
</button>
