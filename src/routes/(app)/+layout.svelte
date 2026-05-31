<script lang="ts">
	import { page } from '$app/stores';
	import { sidebar } from '$lib/stores/sidebar.js';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';

	let { children, data } = $props();

	let isMobile = $state(false);

	onMount(() => {
		sidebar.initialize();
		const mq = window.matchMedia('(max-width: 768px)');
		isMobile = mq.matches;
		const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

<div class="app-shell">
	{#if !isMobile}
		<Sidebar user={data.user} collapsed={$sidebar.isCollapsed} currentPath={$page.url.pathname} />
	{/if}

	<div class="app-main" class:sidebar-collapsed={$sidebar.isCollapsed} class:mobile={isMobile}>
		<TopBar user={data.user} {isMobile} />
		<main class="app-content">
			{@render children()}
		</main>
	</div>

	{#if isMobile}
		<MobileNav currentPath={$page.url.pathname} />
	{/if}
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
		background: var(--color-bg);
	}
	.app-main {
		flex: 1;
		margin-left: 260px;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		transition: margin-left var(--transition-base);
	}
	.app-main.sidebar-collapsed {
		margin-left: 72px;
	}
	.app-main.mobile {
		margin-left: 0;
	}
	.app-content {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}
	@media (max-width: 768px) {
		.app-content {
			padding: 1rem;
			padding-bottom: 5rem;
		}
	}
</style>
