<script lang="ts">
	import { goto } from '$app/navigation';
	import { sidebar } from '$lib/stores/sidebar.js';
	import { NAV_ITEMS } from '$lib/types/index.js';

	interface Props {
		user: { id: string; name: string; email: string; avatarUrl: string | null };
		collapsed: boolean;
		currentPath: string;
	}

	let { user, collapsed, currentPath }: Props = $props();

	function isActive(href: string) {
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}

	const iconPaths: Record<string, string> = {
		dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
		calendar: 'M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6zM16 2v4M8 2v4M3 10h18',
		tasks: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
		checklists: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6M9 14l2 2 4-4',
		meetings: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 7a4 4 0 110 8 4 4 0 010-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
		ai: 'M12 2a8 8 0 00-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 00-8-8zM12 10a2 2 0 110 4 2 2 0 010-4z',
		analytics: 'M18 20V10M12 20V4M6 20v-6',
		settings: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z'
	};
</script>

<aside class="sidebar" class:collapsed>
	<!-- Brand -->
	<div class="sidebar-brand">
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
			<rect width="32" height="32" rx="8" fill="var(--color-accent)" />
			<path d="M8 12h16M8 16h12M8 20h8M22 18l4 4-4 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		{#if !collapsed}
			<span class="brand-name">FlowPlan</span>
		{/if}
	</div>

	<!-- Navigation -->
	<nav class="sidebar-nav">
		{#each NAV_ITEMS as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={isActive(item.href)}
				title={collapsed ? item.label : ''}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d={iconPaths[item.icon] || iconPaths.dashboard} />
				</svg>
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Footer -->
	<div class="sidebar-footer">
		<button class="collapse-btn" onclick={() => sidebar.toggleCollapse()} title={collapsed ? 'Expand' : 'Collapse'}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class:rotated={collapsed}>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>
		{#if !collapsed}
			<div class="user-info">
				<div class="user-avatar">
					{user.name.charAt(0).toUpperCase()}
				</div>
				<div class="user-details">
					<span class="user-name">{user.name}</span>
					<span class="user-email">{user.email}</span>
				</div>
			</div>
			<button class="logout-btn" onclick={handleLogout} title="Sign out">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
				</svg>
			</button>
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 260px;
		background: var(--color-sidebar-bg);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		z-index: 40;
		transition: width var(--transition-base);
	}
	.sidebar.collapsed { width: 72px; }

	.sidebar-brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 1.25rem 1rem;
		border-bottom: 1px solid var(--color-border-light);
	}
	.brand-name {
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
		white-space: nowrap;
	}

	.sidebar-nav {
		flex: 1;
		padding: 0.75rem 0.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem;
		border-radius: var(--radius-md);
		color: var(--color-sidebar-text);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}
	.nav-item:hover {
		background: var(--color-sidebar-hover);
		color: var(--color-text);
	}
	.nav-item.active {
		background: var(--color-sidebar-active);
		color: var(--color-sidebar-text-active);
		font-weight: 600;
	}

	.sidebar-footer {
		padding: 0.75rem;
		border-top: 1px solid var(--color-border-light);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.collapse-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0.5rem;
		border-radius: var(--radius-md);
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.collapse-btn:hover {
		background: var(--color-sidebar-hover);
		color: var(--color-text);
	}
	.collapse-btn :global(.rotated) {
		transform: rotate(180deg);
	}
	.user-info {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem;
	}
	.user-avatar {
		width: 34px;
		height: 34px;
		border-radius: var(--radius-full);
		background: var(--color-accent-light);
		color: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 700;
		flex-shrink: 0;
	}
	.user-details {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.user-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.user-email {
		font-size: 0.7rem;
		color: var(--color-text-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: var(--radius-md);
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.logout-btn:hover {
		background: var(--color-danger-light);
		color: var(--color-danger);
	}
</style>
