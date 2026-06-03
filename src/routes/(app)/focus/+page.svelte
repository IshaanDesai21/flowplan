<script lang="ts">
	import { PRIORITY_COLORS } from '$lib/types/index.js';
	let { data } = $props();
	let mode = $state<'focus' | 'short' | 'long'>('focus');
	let isRunning = $state(false);
	let seconds = $state(25 * 60);
	let totalSeconds = $state(25 * 60);
	let interval: ReturnType<typeof setInterval> | null = null;
	let sessionsCompleted = $state(0);
	let currentTaskLabel = $state('');

	const modes = [
		{ id: 'focus' as const, label: 'Focus', minutes: 25 },
		{ id: 'short' as const, label: 'Short Break', minutes: 5 },
		{ id: 'long' as const, label: 'Long Break', minutes: 15 }
	];

	function setMode(m: typeof mode) {
		stop();
		mode = m;
		const mins = modes.find(x => x.id === m)!.minutes;
		seconds = mins * 60;
		totalSeconds = mins * 60;
	}

	function start() {
		isRunning = true;
		interval = setInterval(() => {
			if (seconds <= 0) {
				stop();
				if (mode === 'focus') sessionsCompleted++;
				// Auto-notify
				if ('Notification' in window && Notification.permission === 'granted') {
					new Notification('FlowPlan Focus', {
						body: mode === 'focus' ? '🎉 Focus session complete! Take a break.' : '⏱ Break over. Back to work!',
						icon: '/favicon.png'
					});
				}
				return;
			}
			seconds--;
		}, 1000);
	}

	function stop() {
		isRunning = false;
		if (interval) { clearInterval(interval); interval = null; }
	}

	function toggle() {
		isRunning ? stop() : start();
	}

	function reset() {
		stop();
		const mins = modes.find(x => x.id === mode)!.minutes;
		seconds = mins * 60;
		totalSeconds = mins * 60;
	}

	function requestNotifications() {
		if ('Notification' in window) Notification.requestPermission();
	}

	import { onDestroy } from 'svelte';

	$effect(() => {
		requestNotifications();
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	const displayMin = $derived(String(Math.floor(seconds / 60)).padStart(2, '0'));
	const displaySec = $derived(String(seconds % 60).padStart(2, '0'));
	const progress = $derived(1 - seconds / totalSeconds);
	const circumference = 2 * Math.PI * 110;
	const dashOffset = $derived(circumference * (1 - progress));
</script>

<svelte:head>
	<title>Focus Timer — FlowPlan</title>
</svelte:head>

<div class="focus-page">
	<header class="focus-header">
		<div>
			<h1 class="page-title">Focus Timer</h1>
			<p class="page-subtitle">Pomodoro-style deep work sessions</p>
		</div>
		<div class="session-counter">
			<span class="sessions-label">Sessions today</span>
			<span class="sessions-count">{sessionsCompleted}</span>
		</div>
	</header>

	<div class="focus-body">
		<!-- Mode Selector -->
		<div class="mode-tabs">
			{#each modes as m}
				<button
					class="mode-tab"
					class:active={mode === m.id}
					onclick={() => setMode(m.id)}
				>
					{m.label}
				</button>
			{/each}
		</div>

		<!-- Timer Ring -->
		<div class="timer-container">
			<svg class="timer-ring" viewBox="0 0 260 260">
				<!-- Background track -->
				<circle
					cx="130" cy="130" r="110"
					stroke="var(--color-border)"
					stroke-width="12"
					fill="none"
				/>
				<!-- Progress arc -->
				<circle
					cx="130" cy="130" r="110"
					stroke="var(--color-accent)"
					stroke-width="12"
					fill="none"
					stroke-linecap="round"
					stroke-dasharray={circumference}
					stroke-dashoffset={dashOffset}
					style="transform: rotate(-90deg); transform-origin: 130px 130px; transition: stroke-dashoffset 0.5s ease"
					class:running={isRunning}
				/>
			</svg>
			<div class="timer-display">
				<div class="time-text">{displayMin}:{displaySec}</div>
				<div class="mode-label">{modes.find(m2 => m2.id === mode)?.label}</div>
			</div>
		</div>

		<!-- Task Label -->
		<div class="task-input-row">
			<input
				type="text"
				bind:value={currentTaskLabel}
				placeholder="What are you working on? (optional)"
				class="task-input"
			/>
		</div>

		<!-- Controls -->
		<div class="controls">
			<button class="ctrl-btn reset-btn" onclick={reset} title="Reset">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
					<path d="M3 3v5h5"/>
				</svg>
			</button>
			<button class="ctrl-btn play-btn" onclick={toggle}>
				{#if isRunning}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
					</svg>
				{:else}
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
						<polygon points="5 3 19 12 5 21 5 3"/>
					</svg>
				{/if}
			</button>
			<button class="ctrl-btn skip-btn" title="Skip to next" onclick={() => {
				stop();
				if (mode === 'focus') { sessionsCompleted++; setMode('short'); }
				else setMode('focus');
			}}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
				</svg>
			</button>
		</div>

		<!-- Task Suggestions -->
		<div class="task-suggestions">
			<h3 class="suggestions-title">Suggestions for Focus</h3>
			{#if !data.topTasks || data.topTasks.length === 0}
				<div class="no-suggestions">No urgent tasks right now. Great job!</div>
			{:else}
				<div class="suggestions-grid">
					{#each data.topTasks as task}
						<button class="suggestion-card" onclick={() => currentTaskLabel = task.title}>
							<div class="sugg-header">
								<span class="sugg-prio" style="color: {PRIORITY_COLORS[task.priority]}">
									{task.priority === 'HIGH' ? '🔥' : task.priority === 'MEDIUM' ? '⚡️' : '🌱'}
									{task.priority.toLowerCase()}
								</span>
								{#if task.category}
									<span class="sugg-cat">{task.category}</span>
								{/if}
							</div>
							<div class="sugg-title">{task.title}</div>
							<div class="sugg-action">Set as Focus <span>→</span></div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.focus-page {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.focus-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.page-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.25rem;
	}
	.page-subtitle {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		margin: 0;
	}
	.session-counter {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.125rem;
	}
	.sessions-label {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.sessions-count {
		font-size: 2.25rem;
		font-weight: 800;
		color: var(--color-accent);
		line-height: 1;
	}

	.focus-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	/* Mode tabs */
	.mode-tabs {
		display: flex;
		gap: 0.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 0.25rem;
	}
	.mode-tab {
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-full);
		border: none;
		background: none;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	.mode-tab.active {
		background: var(--color-accent);
		color: white;
		box-shadow: 0 2px 8px color-mix(in srgb, var(--color-accent) 40%, transparent);
	}
	.mode-tab:hover:not(.active) {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	/* Timer ring */
	.timer-container {
		position: relative;
		width: 260px;
		height: 260px;
	}
	.timer-ring {
		width: 100%;
		height: 100%;
	}
	.timer-ring circle.running {
		filter: drop-shadow(0 0 12px var(--color-accent));
	}
	.timer-display {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}
	.time-text {
		font-size: 3.5rem;
		font-weight: 800;
		color: var(--color-text);
		letter-spacing: -0.04em;
		font-variant-numeric: tabular-nums;
	}
	.mode-label {
		font-size: 0.8rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* Task input */
	.task-input-row {
		width: 100%;
		max-width: 400px;
	}
	.task-input {
		width: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: var(--color-text);
		text-align: center;
		outline: none;
		transition: border-color 0.15s;
		box-sizing: border-box;
	}
	.task-input:focus {
		border-color: var(--color-accent);
	}
	.task-input::placeholder { color: var(--color-text-tertiary); }

	/* Controls */
	.controls {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}
	.ctrl-btn {
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
		border-radius: 50%;
	}
	.reset-btn, .skip-btn {
		width: 48px;
		height: 48px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}
	.reset-btn:hover, .skip-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}
	.play-btn {
		width: 72px;
		height: 72px;
		background: var(--color-accent);
		color: white;
		box-shadow: 0 4px 20px color-mix(in srgb, var(--color-accent) 50%, transparent);
	}
	.play-btn:hover {
		transform: scale(1.05);
		background: var(--color-accent-hover);
	}
	.play-btn:active {
		transform: scale(0.97);
	}

	/* Task suggestions */
	.task-suggestions {
		width: 100%;
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.suggestions-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}
	.no-suggestions {
		background: var(--color-surface);
		border: 1px dashed var(--color-border);
		padding: 2rem;
		text-align: center;
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}
	.suggestions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}
	.suggestion-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: 1rem;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		transition: all 0.2s;
	}
	.suggestion-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}
	.sugg-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.7rem;
		font-weight: 600;
	}
	.sugg-prio { text-transform: capitalize; }
	.sugg-cat { color: var(--color-text-tertiary); }
	.sugg-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text);
		line-height: 1.4;
	}
	.sugg-action {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-accent);
		margin-top: auto;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		opacity: 0;
		transform: translateX(-5px);
		transition: all 0.2s;
	}
	.suggestion-card:hover .sugg-action {
		opacity: 1;
		transform: translateX(0);
	}
</style>
