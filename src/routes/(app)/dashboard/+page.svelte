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

	// Typewriter for AI summary
	let displayedSummary = $state('');
	let summaryFull = $state('');

	function startTypewriter(text: string) {
		summaryFull = text;
		displayedSummary = '';
		let i = 0;
		const interval = setInterval(() => {
			i++;
			displayedSummary = text.slice(0, i);
			if (i >= text.length) clearInterval(interval);
		}, 22);
	}

	// Circle checkbox with undo-delay (matches tasks page behavior)
	let completingIds = $state(new Map<string, ReturnType<typeof setTimeout>>());

	function handleCheck(taskId: string) {
		if (completingIds.has(taskId)) {
			clearTimeout(completingIds.get(taskId)!);
			const next = new Map(completingIds);
			next.delete(taskId);
			completingIds = next;
			return;
		}
		const timer = setTimeout(() => {
			const next = new Map(completingIds);
			next.delete(taskId);
			completingIds = next;
			// optimistic remove from list
			data = { ...data, todayTasks: data.todayTasks.filter((t: any) => t.id !== taskId), upcomingTasks: data.upcomingTasks.filter((t: any) => t.id !== taskId) };
			fetch(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'DONE' }) }).catch(console.error);
		}, 700);
		const next = new Map(completingIds);
		next.set(taskId, timer);
		completingIds = next;
	}
</script>

<svelte:head>
	<title>Dashboard — FlowPlan</title>
</svelte:head>

<div class="dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-left">
			<div class="greeting-container">
				<h1 class="greeting">{greeting()}, {data.user.name.split(' ')[0]}</h1>
				<p class="date-subtitle">{formatDate(new Date())}</p>
			</div>
			{#if data.streamed?.aiSummary}
				<div class="ai-summary">
					<div class="ai-badge">FlowPlan AI</div>
					<div class="summary-content">
						{#await data.streamed.aiSummary}
							<div class="summary-skeleton">
								<div class="skeleton-line" style="width: 80%"></div>
							</div>
						{:then aiSummary}
							{@const _ = (() => { startTypewriter(aiSummary); return ''; })()}
							<p class="typewriter-text">{displayedSummary}<span class="cursor" class:hidden={displayedSummary === summaryFull}></span></p>
						{:catch}
							<p>Ready to tackle your tasks today?</p>
						{/await}
					</div>
				</div>
			{/if}
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
					<div class="flex items-center gap-3">
						<a href="/calendar?view=agenda" class="text-accent hover:underline text-sm font-medium">Agenda</a>
						<a href="/calendar" class="view-all">Full Calendar</a>
					</div>
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
								<div class="event-row">
									<div class="event-time-col">
										<span class="event-time-start">{formatTime(event.startTime)}</span>
										<span class="event-time-end">{formatTime(event.endTime)}</span>
									</div>
									<div class="event-accent-bar" style="background: {event.color}"></div>
									<div class="event-info">
										<span class="event-name">{event.title}</span>
										{#if event.location}
											<span class="event-location">{event.location}</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</Card>
			</section>

			<!-- AI Card -->
			<section class="widget mt-6">
				<a href="/ai" class="ai-gradient-card" aria-label="Chat with AI">
					<div class="ai-card-glow"></div>
					<div class="ai-card-inner">
						<div class="ai-card-icon">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
								<path d="M12 3l-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
							</svg>
						</div>
						<div class="ai-card-text">
							<p class="ai-card-title">FlowPlan AI</p>
							<p class="ai-card-sub">Ask anything — tasks, schedule, advice</p>
						</div>
						<div class="ai-card-cta">
							Chat
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
						</div>
					</div>
				</a>
			</section>
		</div>

		<!-- Right Column -->
		<div class="col-right">
			<!-- Today's Tasks -->
			<section class="widget">
				<div class="widget-header">
					<h2>Due Today</h2>
					<div class="flex items-center gap-3">
						<a href="/tasks?new=true" class="text-accent hover:underline text-sm font-medium flex items-center gap-1">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
							New Task
						</a>
						<a href="/tasks" class="view-all">View All</a>
					</div>
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
							{#each data.todayTasks as task (task.id)}
								<li class="task-item" class:completing={completingIds.has(task.id)}>
									<button
										class="circle-check"
										class:checked={completingIds.has(task.id)}
										onclick={() => handleCheck(task.id)}
										aria-label="Complete task"
									>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
									</button>
									<div class="task-content">
										<p class="task-title" class:strike={completingIds.has(task.id)}>{task.title}</p>
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
									{#if completingIds.has(task.id)}
										<button class="undo-btn" onclick={() => handleCheck(task.id)}>Undo</button>
									{/if}
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
							{#each data.upcomingTasks as task (task.id)}
								<li class="task-item" class:completing={completingIds.has(task.id)}>
									<button
										class="circle-check"
										class:checked={completingIds.has(task.id)}
										onclick={() => handleCheck(task.id)}
										aria-label="Complete task"
									>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
									</button>
									<div class="task-content">
										<p class="task-title" class:strike={completingIds.has(task.id)}>{task.title}</p>
										<div class="task-meta">
											<span class="task-date">{formatDate(task.dueDate)}</span>
										</div>
									</div>
									{#if completingIds.has(task.id)}
										<button class="undo-btn" onclick={() => handleCheck(task.id)}>Undo</button>
									{/if}
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
	.header-left {
		display: flex;
		align-items: center;
		gap: 2rem;
		flex-wrap: wrap;
		flex: 1;
	}
	.greeting-container {
		display: flex;
		flex-direction: column;
	}
	.greeting {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.25rem;
		letter-spacing: -0.02em;
	}
	.date-subtitle {
		color: var(--color-text-secondary);
		font-size: 0.95rem;
		margin: 0;
	}
	.ai-summary {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-left: 3px solid var(--color-accent);
		border-radius: var(--radius-md);
		font-size: 0.9rem;
		color: var(--color-text);
		flex: 1;
	}
	.ai-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.5rem;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		color: var(--color-accent);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		flex-shrink: 0;
		white-space: nowrap;
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
	}
	.summary-content p, .typewriter-text { margin: 0; font-weight: 500; line-height: 1.5; flex: 1; }
	.cursor {
		display: inline-block;
		width: 2px;
		height: 0.9em;
		background: var(--color-accent);
		border-radius: 1px;
		margin-left: 1px;
		vertical-align: middle;
		animation: blink 0.7s steps(1) infinite;
	}
	.cursor.hidden { display: none; }
	@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
	
	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}
	.stat-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.5rem 1.75rem;
	}
	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.stat-label {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin: 0;
		white-space: nowrap;
	}
	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-text);
		margin: 0;
		letter-spacing: -0.03em;
		line-height: 1;
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
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.event-row {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border-light);
		transition: background var(--transition-fast);
	}
	.event-row:last-child { border-bottom: none; }
	.event-row:hover { background: var(--color-surface-hover); }
	.event-time-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		width: 56px;
		flex-shrink: 0;
		gap: 2px;
	}
	.event-time-start {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text);
	}
	.event-time-end {
		font-size: 0.72rem;
		color: var(--color-text-tertiary);
	}
	.event-accent-bar {
		width: 3px;
		height: 32px;
		border-radius: 99px;
		flex-shrink: 0;
	}
	.event-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}
	.event-name {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.event-location {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	/* Circle checkboxes (match tasks page) */
	.circle-check {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid var(--color-text-tertiary);
		background: var(--color-bg);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: transparent;
		transition: all 0.15s;
		flex-shrink: 0;
		margin-top: 0.1rem;
	}
	.circle-check:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
	.circle-check.checked {
		background: var(--color-success);
		border-color: var(--color-success);
		color: white;
	}
	.task-item.completing { opacity: 0.7; }
	.task-title.strike {
		text-decoration: line-through;
		color: var(--color-text-tertiary);
	}
	.undo-btn {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		border: none;
		padding: 0.2rem 0.5rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}
	.undo-btn:hover { background: var(--color-accent); color: white; }

	/* AI gradient card */
	.ai-gradient-card {
		display: block;
		position: relative;
		border-radius: var(--radius-lg);
		text-decoration: none;
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		border: 1px solid var(--color-border);
	}
	.ai-gradient-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px color-mix(in srgb, var(--color-accent) 20%, transparent);
		border-color: var(--color-accent);
	}
	.ai-card-glow {
		position: absolute;
		inset: 0;
		background: var(--color-surface);
		z-index: 0;
	}
	.ai-card-inner {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
	}
	.ai-card-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
		color: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.ai-card-text { flex: 1; }
	.ai-card-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.15rem;
	}
	.ai-card-sub {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	.ai-card-cta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.35rem 0.75rem;
		border-radius: 9999px;
		transition: background 0.15s;
		white-space: nowrap;
	}
	.ai-gradient-card:hover .ai-card-cta {
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
