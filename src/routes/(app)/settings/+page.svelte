<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { THEMES } from '$lib/types/index.js';
	import { toasts } from '$lib/stores/toast.js';
	import { theme } from '$lib/stores/theme.js';

	let { data } = $props();

	let isSaving = $state(false);

	async function saveTheme(themeId: string) {
		isSaving = true;

		try {
			const res = await fetch('/api/settings/theme', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ theme: themeId })
			});

			if (!res.ok) throw new Error('Failed to save theme');

			theme.set(themeId as any);
			toasts.success('Theme updated successfully');
		} catch (error) {
			toasts.error('Error saving theme');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Settings — FlowPlan</title>
</svelte:head>

<div class="settings-page max-w-4xl mx-auto h-full flex flex-col pb-8">
	<header class="page-header mb-8">
		<div>
			<h1 class="page-title text-2xl font-bold text-primary">Settings</h1>
			<p class="page-subtitle text-secondary">Manage your preferences and account</p>
		</div>
	</header>

	<div class="space-y-8">
		<!-- Appearance Section -->
		<section>
			<h2 class="text-xl font-semibold mb-4 text-primary">Appearance</h2>
			<Card padding="lg">
				<h3 class="font-medium text-primary mb-2">Color Scheme</h3>
				<p class="text-sm text-secondary mb-6">Choose how FlowPlan looks to you.</p>

				<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
					{#each THEMES as t}
						<button
							class="theme-card {$theme === t.id ? 'active' : ''}"
							onclick={() => saveTheme(t.id)}
							disabled={isSaving}
						>
							<div class="theme-preview" style="background-color: {t.bg}">
								<div class="theme-accent" style="background-color: {t.accent}"></div>
							</div>
							<span class="theme-name">{t.label}</span>
							{#if $theme === t.id}
								<div class="active-indicator">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</Card>
		</section>

		<!-- Profile Section -->
		<section>
			<h2 class="text-xl font-semibold mb-4 text-primary">Profile</h2>
			<Card padding="lg">
				<div class="flex items-center gap-6 mb-6">
					<div class="w-20 h-20 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center text-2xl font-bold border-2 border-[var(--color-accent)]">
						{data.user.name.charAt(0).toUpperCase()}
					</div>
					<div>
						<h3 class="font-semibold text-lg text-primary">{data.user.name}</h3>
						<p class="text-secondary">{data.user.email}</p>
					</div>
				</div>
				<Button variant="outline">Edit Profile</Button>
			</Card>
		</section>
	</div>
</div>

<style>
	.theme-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--radius-lg);
		border: 2px solid var(--color-border);
		background: var(--color-surface);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}
	.theme-card:hover {
		border-color: var(--color-border-light);
		transform: translateY(-2px);
	}
	.theme-card.active {
		border-color: var(--color-accent);
		background: var(--color-accent-light);
	}
	.theme-preview {
		height: 60px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		position: relative;
		overflow: hidden;
	}
	.theme-accent {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 30%;
	}
	.theme-name {
		font-weight: 500;
		color: var(--color-text);
		font-size: 0.9rem;
	}
	.active-indicator {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
	}
</style>
