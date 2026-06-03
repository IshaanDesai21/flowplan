<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	let { data } = $props();

	function getIntensityLevel(count: number) {
		if (count === 0) return 'level-0';
		if (count <= 2) return 'level-1';
		if (count <= 4) return 'level-2';
		if (count <= 6) return 'level-3';
		return 'level-4';
	}
</script>

<svelte:head>
	<title>Analytics & Statistics — FlowPlan</title>
</svelte:head>

<div class="analytics-page">
	<header class="page-header">
		<h1 class="page-title">Analytics</h1>
		<p class="page-subtitle">Track your productivity and habits over time.</p>
	</header>

	<div class="stats-grid">
		<Card class="stat-card">
			<div class="stat-icon" style="background:color-mix(in srgb, var(--color-accent) 15%, transparent)">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
			</div>
			<div class="stat-content">
				<span class="stat-value">{data.stats.totalCompleted}</span>
				<span class="stat-label">Tasks Completed</span>
			</div>
		</Card>
		
		<Card class="stat-card">
			<div class="stat-icon" style="background:color-mix(in srgb, var(--color-accent) 15%, transparent)">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
			</div>
			<div class="stat-content">
				<span class="stat-value">{data.stats.completionRate}%</span>
				<span class="stat-label">Completion Rate</span>
			</div>
		</Card>

		<Card class="stat-card">
			<div class="stat-icon" style="background:color-mix(in srgb, var(--color-accent) 15%, transparent)">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
			</div>
			<div class="stat-content">
				<span class="stat-value">{data.stats.totalCreated}</span>
				<span class="stat-label">Total Tasks Tracked</span>
			</div>
		</Card>
	</div>

	<Card class="heatmap-card">
		<div class="heatmap-header">
			<h2 class="heatmap-title">Activity Heatmap</h2>
			<p class="heatmap-desc">Last 60 days of task completions</p>
		</div>
		
		<div class="heatmap-container">
			<div class="heatmap-grid">
				{#each data.heatmapData as day}
					<div 
						class="heatmap-cell {getIntensityLevel(day.count)}"
						title="{day.date}: {day.count} tasks completed"
					></div>
				{/each}
			</div>
			<div class="heatmap-legend">
				<span>Less</span>
				<div class="heatmap-cell level-0"></div>
				<div class="heatmap-cell level-1"></div>
				<div class="heatmap-cell level-2"></div>
				<div class="heatmap-cell level-3"></div>
				<div class="heatmap-cell level-4"></div>
				<span>More</span>
			</div>
		</div>
	</Card>
</div>

<style>
	.analytics-page {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding-top: 2rem;
		padding-bottom: 2rem;
	}
	.page-header {
		margin-bottom: 0.5rem;
	}
	.page-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.25rem;
		letter-spacing: -0.02em;
	}
	.page-subtitle {
		color: var(--color-text-secondary);
		font-size: 0.95rem;
		margin: 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.25rem;
	}
	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1.25rem;
		padding: 2rem 1.75rem 1.75rem;
	}
	.stat-icon {
		font-size: 2rem;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		border-radius: var(--radius-lg);
		flex-shrink: 0;
	}
	.stat-content {
		display: flex;
		flex-direction: column;
	}
	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-text);
		line-height: 1.1;
		margin-top: 1.25rem;
	}
	.stat-label {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	.heatmap-card {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.heatmap-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.heatmap-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}
	.heatmap-desc {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.heatmap-container {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		align-items: flex-start;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}
	.heatmap-grid {
		display: grid;
		grid-template-rows: repeat(7, 1fr);
		grid-auto-flow: column;
		gap: 8px;
	}
	.heatmap-cell {
		width: 15px;
		height: 15px;
		border-radius: 4px;
		transition: all 0.2s ease;
	}
	.heatmap-cell:hover {
		transform: scale(1.2);
		box-shadow: 0 0 8px rgba(0,0,0,0.2);
		z-index: 2;
		position: relative;
	}

	/* Color Levels */
	.level-0 { background: var(--color-surface-hover); border: 1px solid var(--color-border); }
	.level-1 { background: color-mix(in srgb, var(--color-accent) 30%, transparent); }
	.level-2 { background: color-mix(in srgb, var(--color-accent) 55%, transparent); }
	.level-3 { background: color-mix(in srgb, var(--color-accent) 80%, transparent); }
	.level-4 { background: var(--color-accent); box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent) 40%, transparent); }

	.heatmap-legend {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	.heatmap-legend .heatmap-cell {
		width: 12px;
		height: 12px;
	}
	.heatmap-legend .heatmap-cell:hover { transform: none; box-shadow: none; }
</style>
