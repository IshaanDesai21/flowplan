<script lang="ts">
	interface Props {
		currentPath: string;
	}

	let { currentPath }: Props = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
		{ href: '/calendar', label: 'Calendar', icon: 'M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM16 2v4M8 2v4M3 10h18' },
		{ href: '/tasks', label: 'Tasks', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
		{ href: '/ai', label: 'AI', icon: 'M12 2a8 8 0 00-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 00-8-8zM12 10a2 2 0 110 4 2 2 0 010-4z' },
		{ href: '/settings', label: 'More', icon: 'M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z' }
	];

	function isActive(href: string) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<nav class="mobile-nav">
	{#each navItems as item}
		<a href={item.href} class="mobile-nav-item" class:active={isActive(item.href)}>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d={item.icon} />
			</svg>
			<span>{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	.mobile-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 0.5rem 0;
		padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
		background: color-mix(in srgb, var(--color-surface) 90%, transparent);
		backdrop-filter: blur(16px);
		border-top: 1px solid var(--color-border);
		z-index: 50;
	}
	.mobile-nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		padding: 0.375rem 0.75rem;
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: var(--color-text-tertiary);
		font-size: 0.65rem;
		font-weight: 500;
		transition: all var(--transition-fast);
	}
	.mobile-nav-item.active {
		color: var(--color-accent);
	}
	.mobile-nav-item:hover {
		color: var(--color-text);
	}
</style>
