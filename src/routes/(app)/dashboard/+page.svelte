<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { formatTime, formatDate } from '$lib/utils/dates.js';
	import { TASK_STATUS_COLORS, PRIORITY_COLORS } from '$lib/types/index.js';

	let { data } = $props();

	const greeting = $derived(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	});
</script>

<svelte:head>
	<title>Dashboard — FlowPlan</title>
</svelte:head>

<div class="dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div>
			<h1 class="greeting">{greeting()}, {data.user.name.split(' ')[0]}</h1>
			<p class="date-subtitle">{formatDate(new Date())}</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" size="sm">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
				Focus Mode
			</Button>
			<Button variant="primary" size="sm">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
					<path d="M12 5v14M5 12h14" />
				</svg>
				New Task
			</Button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<Card class="stat-card" padding="sm">
			<div class="stat-icon" style="background: rgba(99,102,241,0.15); color: #818cf8;">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
			</div>
			<div class="stat-content">
				<p class="stat-label">Completed this week</p>
				<p class="stat-value">{data.stats.completedTasksThisWeek}</p>
			</div>
		</Card>

		<Card class="stat-card" padding="sm">
			<div class="stat-icon" style="background: rgba(245,158,11,0.15); color: #fbbf24;">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
			</div>
			<div class="stat-content">
				<p class="stat-label">Pending tasks today</p>
				<p class="stat-value">{data.todayTasks.length}</p>
			</div>
		</Card>

		<Card class="stat-card" padding="sm">
			<div class="stat-icon" style="background: rgba(34,197,94,0.15); color: #4ade80;">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M2 20h20M5 20V4M19 20V8M9 20v-8M14 20v-4" />
				</svg>
			</div>
			<div class="stat-content">
				<p class="stat-label">Productivity Score</p>
				<p class="stat-value">{data.stats.productivityScore}%</p>
			</div>
		</Card>
	</div>

	<!-- Main Grid -->
	<div class="dashboard-grid">
		<!-- Left Column -->
		<div class="col-left">
			<!-- Today's Schedule -->
			<section class="widget">
				<div class="widget-header">
					<h2>Today's Schedule</h2>
					<a href="/calendar" class="view-all">View Calendar</a>
				</div>
				<Card padding="none" class="widget-card">
					{#if data.todayEvents.length === 0}
						<div class="empty-state">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="empty-icon">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
							<p>No events scheduled for today.</p>
							<Button variant="ghost" size="sm" class="mt-2 text-accent">Schedule an event</Button>
						</div>
					{:else}
						<div class="event-list">
							{#each data.todayEvents as event}
								<div class="event-item">
									<div class="event-time">
										<span>{formatTime(event.startTime)}</span>
										<span class="time-end">{formatTime(event.endTime)}</span>
									</div>
									<div class="event-divider">
										<div class="event-dot" style="background-color: {event.color}"></div>
										<div class="event-line"></div>
									</div>
									<div class="event-details">
										<div class="event-card" style="border-left-color: {event.color}; background-color: color-mix(in srgb, {event.color} 10%, transparent)">
											<p class="event-title">{event.title}</p>
											{#if event.location}
												<p class="event-meta">
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
														<circle cx="12" cy="10" r="3" />
													</svg>
													{event.location}
												</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card>
			</section>

			<!-- Recent AI Conversation -->
			<section class="widget mt-6">
				<div class="widget-header">
					<h2>AI Assistant</h2>
					<a href="/ai" class="view-all">New Chat</a>
				</div>
				<Card padding="md" class="widget-card bg-surface hover:border-accent transition-colors cursor-pointer" onclick={() => location.href='/ai'}>
					<div class="ai-preview">
						<div class="ai-icon">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
						</div>
						<div class="ai-info">
							<p class="ai-title">{data.recentAiConversation ? data.recentAiConversation.title : 'Start a new conversation'}</p>
							<p class="ai-desc">Ask FlowPlan AI to help schedule your week or break down tasks.</p>
						</div>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-tertiary">
							<path d="M9 18l6-6-6-6" />
						</svg>
					</div>
				</Card>
			</section>
		</div>

		<!-- Right Column -->
		<div class="col-right">
			<!-- Today's Tasks -->
			<section class="widget">
				<div class="widget-header">
					<h2>Due Today</h2>
					<a href="/tasks" class="view-all">View All</a>
				</div>
				<Card padding="none" class="widget-card">
					{#if data.todayTasks.length === 0}
						<div class="empty-state">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="empty-icon">
								<path d="M9 11l3 3L22 4" />
								<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
							</svg>
							<p>All caught up for today!</p>
						</div>
					{:else}
						<ul class="task-list">
							{#each data.todayTasks as task}
								<li class="task-item">
									<label class="task-checkbox-container">
										<input type="checkbox" class="task-checkbox" />
										<span class="checkmark"></span>
									</label>
									<div class="task-content">
										<p class="task-title">{task.title}</p>
										<div class="task-meta">
											{#if task.priority && task.priority !== 'MEDIUM'}
												<span class="task-priority" style="color: {PRIORITY_COLORS[task.priority]}">
													{task.priority.toLowerCase()}
												</span>
											{/if}
											{#if task.category}
												<span class="task-category">{task.category}</span>
											{/if}
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>
			</section>

			<!-- Upcoming Tasks -->
			<section class="widget mt-6">
				<div class="widget-header">
					<h2>Upcoming</h2>
				</div>
				<Card padding="none" class="widget-card">
					{#if data.upcomingTasks.length === 0}
						<div class="empty-state">
							<p>No upcoming tasks.</p>
						</div>
					{:else}
						<ul class="task-list">
							{#each data.upcomingTasks as task}
								<li class="task-item">
									<label class="task-checkbox-container">
										<input type="checkbox" class="task-checkbox" />
										<span class="checkmark"></span>
									</label>
									<div class="task-content">
										<p class="task-title">{task.title}</p>
										<div class="task-meta">
											<span class="task-date">{formatDate(task.dueDate)}</span>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</Card>
			</section>
		</div>
	</div>
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Header */
	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.greeting {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.25rem;
		letter-spacing: -0.02em;
	}
	.date-subtitle {
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}
	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
	}
	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.stat-label {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin: 0 0 0.25rem;
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	/* Main Grid */
	.dashboard-grid {
		display: grid;
		grid-template-columns: 2fr 1.2fr;
		gap: 1.5rem;
	}
	.widget {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.mt-6 {
		margin-top: 1.5rem;
	}
	.widget-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.widget-header h2 {
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}
	.view-all {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-accent);
		text-decoration: none;
	}
	.view-all:hover {
		text-decoration: underline;
	}
	.widget-card {
		flex: 1;
		min-height: 200px;
	}
	
	/* Empty States */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
		color: var(--color-text-tertiary);
	}
	.empty-icon {
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	/* Schedule Widget */
	.event-list {
		padding: 1.25rem 1rem;
		display: flex;
		flex-direction: column;
	}
	.event-item {
		display: flex;
		min-height: 60px;
	}
	.event-time {
		width: 70px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		padding-top: 0.25rem;
		text-align: right;
		padding-right: 0.75rem;
	}
	.time-end {
		color: var(--color-text-tertiary);
		font-size: 0.75rem;
	}
	.event-divider {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 20px;
		flex-shrink: 0;
	}
	.event-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid var(--color-surface);
		z-index: 2;
		margin-top: 0.35rem;
	}
	.event-line {
		width: 2px;
		flex: 1;
		background: var(--color-border);
		margin-top: -8px;
		margin-bottom: -10px;
	}
	.event-item:last-child .event-line {
		display: none;
	}
	.event-details {
		flex: 1;
		padding-left: 1rem;
		padding-bottom: 1.5rem;
	}
	.event-card {
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		border-left: 4px solid;
	}
	.event-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.25rem;
	}
	.event-meta {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
	}

	/* Tasks Widget */
	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.task-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border-light);
		transition: background-color var(--transition-fast);
	}
	.task-item:last-child {
		border-bottom: none;
	}
	.task-item:hover {
		background: var(--color-surface-hover);
	}
	.task-checkbox-container {
		display: block;
		position: relative;
		cursor: pointer;
		width: 20px;
		height: 20px;
		margin-top: 0.1rem;
	}
	.task-checkbox {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}
	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 20px;
		width: 20px;
		background-color: var(--color-bg);
		border: 2px solid var(--color-border);
		border-radius: 4px;
		transition: all 0.2s;
	}
	.task-checkbox-container:hover input ~ .checkmark {
		border-color: var(--color-accent);
	}
	.task-checkbox:checked ~ .checkmark {
		background-color: var(--color-success);
		border-color: var(--color-success);
	}
	.checkmark:after {
		content: "";
		position: absolute;
		display: none;
		left: 5px;
		top: 1px;
		width: 6px;
		height: 12px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}
	.task-checkbox:checked ~ .checkmark:after {
		display: block;
	}
	.task-content {
		flex: 1;
	}
	.task-title {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--color-text);
		margin: 0 0 0.25rem;
	}
	.task-meta {
		display: flex;
		gap: 0.75rem;
		font-size: 0.75rem;
	}
	.task-priority {
		font-weight: 600;
		text-transform: capitalize;
	}
	.task-category, .task-date {
		color: var(--color-text-secondary);
	}

	/* AI Preview */
	.ai-preview {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}
	.ai-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-full);
		background: linear-gradient(135deg, var(--color-accent), #a855f7);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.ai-info {
		flex: 1;
	}
	.ai-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.25rem;
	}
	.ai-desc {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
