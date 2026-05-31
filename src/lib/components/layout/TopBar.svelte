<script lang="ts">
	import { page } from '$app/stores';
	import { sidebar } from '$lib/stores/sidebar.js';

	interface Props {
		user: { id: string; name: string; email: string; avatarUrl: string | null };
		isMobile: boolean;
	}

	let { user, isMobile }: Props = $props();

	const pageTitle = $derived(() => {
		const path = $page.url.pathname;
		const map: Record<string, string> = {
			'/dashboard': 'Dashboard',
			'/calendar': 'Calendar',
			'/tasks': 'Tasks',
			'/checklists': 'Checklists',
			'/meetings': 'Meetings',
			'/ai': 'AI Assistant',
			'/analytics': 'Analytics',
			'/settings': 'Settings'
		};
		return map[path] || 'FlowPlan';
	});
</script>

<header class="topbar">
	<div class="topbar-left">
		{#if isMobile}
			<button class="menu-btn" onclick={() => sidebar.toggle()}>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>
		{/if}
		<h1 class="page-title">{pageTitle()}</h1>
	</div>

	<div class="topbar-right">
		<!-- Search placeholder -->
		<div class="search-box">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.35-4.35" />
			</svg>
			<span>Search...</span>
			<kbd>⌘K</kbd>
		</div>

		<!-- Quick add -->
		<button class="icon-btn" title="Quick Add" id="topbar-quick-add">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
		</button>

		<!-- User menu -->
		<div class="user-chip">
			<div class="avatar-sm">
				{user.name.charAt(0).toUpperCase()}
			</div>
		</div>
	</div>
</header>

<style>
	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1.5rem;
		border-bottom: 1px solid var(--color-border-light);
		background: color-mix(in srgb, var(--color-bg) 80%, transparent);
		backdrop-filter: blur(12px);
		position: sticky;
		top: 0;
		z-index: 30;
	}
	.topbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.page-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
		letter-spacing: -0.01em;
	}
	.menu-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem;
		border-radius: var(--radius-md);
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.menu-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}
	.topbar-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.search-box {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text-tertiary);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 200px;
	}
	.search-box:hover {
		border-color: var(--color-accent);
	}
	.search-box kbd {
		margin-left: auto;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		font-size: 0.65rem;
		font-family: inherit;
	}
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.icon-btn:hover {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
	.user-chip {
		display: flex;
		align-items: center;
	}
	.avatar-sm {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-full);
		background: var(--color-accent-light);
		color: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 700;
	}
	@media (max-width: 768px) {
		.search-box { display: none; }
		.topbar { padding: 0.75rem 1rem; }
	}
</style>
