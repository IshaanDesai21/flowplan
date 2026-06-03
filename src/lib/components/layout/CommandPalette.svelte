<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let { isOpen = $bindable(false) } = $props();
	let query = $state('');
	let selectedIndex = $state(0);
	let inputRef = $state<HTMLInputElement>();
	let fetchedTasks = $state<any[]>([]);
	let fetchedItems = $state<any[]>([]);
	let fetchedEvents = $state<any[]>([]);
	let isFetching = $state(false);
	let fetchTimer: ReturnType<typeof setTimeout> | null = null;

	// ── Static navigation commands ───────────────────────────────
	const navCommands = [
		{ id: 'nav-dashboard',  group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`, title: 'Dashboard',        subtitle: 'Home & overview',                 action: () => goto('/dashboard') },
		{ id: 'nav-calendar',   group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, title: 'Calendar',         subtitle: 'Schedule & events',                action: () => goto('/calendar') },
		{ id: 'nav-tasks',      group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`, title: 'Tasks',            subtitle: 'Lists & task management',          action: () => goto('/tasks') },
		{ id: 'nav-focus',      group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,  title: 'Focus Timer',      subtitle: 'Pomodoro deep work sessions',      action: () => goto('/focus') },
		{ id: 'nav-ai',         group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`, title: 'FlowPlan AI',        subtitle: 'Chat & AI assistance',             action: () => goto('/ai') },
		{ id: 'nav-analytics',  group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`, title: 'Analytics',        subtitle: 'Stats, heatmap & productivity',    action: () => goto('/analytics') },
		{ id: 'nav-settings',   group: 'Pages',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, title: 'Settings',         subtitle: 'Account & preferences',            action: () => goto('/settings') },
		{ id: 'act-new-task',   group: 'Actions', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`, title: 'New Task',         subtitle: 'Create a new task',                 action: () => goto('/tasks?new=true') },
		{ id: 'act-new-event',  group: 'Actions', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, title: 'New Event',        subtitle: 'Add a calendar event',             action: () => goto('/calendar') },
		{ id: 'act-new-list',   group: 'Actions', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`, title: 'New List',         subtitle: 'Create a task list',              action: () => goto('/tasks') },
		{ id: 'act-focus',      group: 'Actions', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`, title: 'Start Focus',      subtitle: 'Jump to the Pomodoro timer',       action: () => goto('/focus') },
		{ id: 'act-ai-chat',    group: 'Actions', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`, title: 'Chat with AI',     subtitle: 'Ask FlowPlan AI anything',         action: () => goto('/ai') },
	];

	// ── Debounced live search ────────────────────────────────────
	async function runFetch(q: string) {
		if (!q.trim()) {
			fetchedTasks = [];
			fetchedItems = [];
			fetchedEvents = [];
			return;
		}
		isFetching = true;
		try {
			const [tasksRes, checklistsRes, eventsRes] = await Promise.all([
				fetch('/api/tasks').catch(() => null),
				fetch('/api/checklists').catch(() => null),
				fetch('/api/events').catch(() => null),
			]);

			const lower = q.toLowerCase();

			if (tasksRes?.ok) {
				const data = await tasksRes.json();
				fetchedTasks = (data.tasks ?? data ?? [])
					.filter((t: any) => t.title?.toLowerCase().includes(lower) || t.notes?.toLowerCase().includes(lower))
					.slice(0, 5);
			}
			if (checklistsRes?.ok) {
				const data = await checklistsRes.json();
				const lists: any[] = data.checklists ?? data ?? [];
				const matches: any[] = [];
				for (const list of lists) {
					for (const item of list.items ?? []) {
						if (item.title?.toLowerCase().includes(lower)) {
							matches.push({ ...item, _listTitle: list.title, _listId: list.id });
						}
					}
				}
				fetchedItems = matches.slice(0, 5);
			}
			if (eventsRes?.ok) {
				const data = await eventsRes.json();
				fetchedEvents = (data.events ?? data ?? [])
					.filter((e: any) => e.title?.toLowerCase().includes(lower) || e.location?.toLowerCase().includes(lower))
					.slice(0, 4);
			}
		} catch {/* ignore */} finally {
			isFetching = false;
		}
	}

	$effect(() => {
		const q = query;
		if (fetchTimer) clearTimeout(fetchTimer);
		fetchTimer = setTimeout(() => runFetch(q), 250);
	});

	// ── Compute all results with group headers ───────────────────
	type Result = { id: string; group: string; icon: string; title: string; subtitle: string; action: () => void };

	const allResults = $derived((): Result[] => {
		const q = query.trim().toLowerCase();
		const results: Result[] = [];

		// Nav/action matches
		const navMatches = q
			? navCommands.filter(c => (c.title + c.subtitle + c.group).toLowerCase().includes(q))
			: navCommands;
		results.push(...navMatches);

		// Tasks
		for (const t of fetchedTasks) {
			results.push({
				id: `task-${t.id}`,
				group: 'Tasks',
				icon: t.status === 'DONE' ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
				title: t.title,
				subtitle: [t.priority && t.priority !== 'MEDIUM' ? t.priority.toLowerCase() : '', t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''].filter(Boolean).join(' · '),
				action: () => goto('/tasks')
			});
		}

		// Checklist items
		for (const item of fetchedItems) {
			results.push({
				id: `item-${item.id}`,
				group: 'List Items',
				icon: item.isCompleted ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
				title: item.title,
				subtitle: `In: ${item._listTitle}`,
				action: () => goto('/tasks')
			});
		}

		// Events
		for (const e of fetchedEvents) {
			results.push({
				id: `event-${e.id}`,
				group: 'Events',
				icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
				title: e.title,
				subtitle: e.startTime ? new Date(e.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
				action: () => goto('/calendar')
			});
		}

		return results;
	});

	// Group the results for display
	const groupedResults = $derived((): { group: string; items: Result[] }[] => {
		const results = allResults();
		const map = new Map<string, Result[]>();
		for (const r of results) {
			if (!map.has(r.group)) map.set(r.group, []);
			map.get(r.group)!.push(r);
		}
		return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
	});

	// Flat list for keyboard nav
	const flatResults = $derived(() => allResults());

	$effect(() => {
		query;
		selectedIndex = 0;
	});

	// ── Keyboard navigation ──────────────────────────────────────
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			isOpen = !isOpen;
			if (isOpen) {
				query = '';
				setTimeout(() => inputRef?.focus(), 50);
			}
			return;
		}
		if (!isOpen) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			isOpen = false;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % flatResults().length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + flatResults().length) % flatResults().length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const cmd = flatResults()[selectedIndex];
			if (cmd) executeCommand(cmd);
		}
	}

	function executeCommand(cmd: Result) {
		isOpen = false;
		query = '';
		cmd.action();
	}

	// Global index counter for keyboard highlight across groups
	let globalIdx = 0;

	onMount(() => window.addEventListener('keydown', handleKeydown));
	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown);
	});

	export function open() {
		isOpen = true;
		query = '';
		setTimeout(() => inputRef?.focus(), 50);
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="palette-backdrop" 
		onclick={() => isOpen = false}
	>
		<div 
			class="palette-modal" 
			role="dialog" 
			aria-modal="true" 
			aria-label="Command Palette"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Search input -->
			<div class="palette-header">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
				</svg>
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					placeholder="Search pages, tasks, events, lists…"
					class="palette-input"
				/>
				{#if isFetching}
					<div class="fetching-spinner"></div>
				{:else}
					<span class="esc-hint">ESC</span>
				{/if}
			</div>

			<!-- Results -->
			<div class="palette-results">
				{#if flatResults().length === 0}
					<div class="no-results">
						<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
						<p>No results for "<strong>{query}</strong>"</p>
					</div>
				{:else}
					{#each groupedResults() as group}
						<!-- Group header -->
						<div class="group-header">{group.group}</div>
						{#each group.items as cmd}
							{@const idx = flatResults().indexOf(cmd)}
							<button
								class="cmd-item"
								class:selected={selectedIndex === idx}
								onclick={() => executeCommand(cmd)}
								onmouseenter={() => selectedIndex = idx}
							>
								<span class="cmd-icon">{@html cmd.icon}</span>
								<div class="cmd-text">
									<div class="cmd-title">{cmd.title}</div>
									{#if cmd.subtitle}
										<div class="cmd-subtitle">{cmd.subtitle}</div>
									{/if}
								</div>
								{#if selectedIndex === idx}
									<span class="enter-hint">↵</span>
								{/if}
							</button>
						{/each}
					{/each}
				{/if}
			</div>

			<div class="palette-footer">
				<span><kbd>↑↓</kbd> Navigate</span>
				<span><kbd>↵</kbd> Open</span>
				<span><kbd>ESC</kbd> Close</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.palette-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.45);
		backdrop-filter: blur(6px);
		z-index: 1000;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 12vh;
		animation: fade-in 0.12s ease-out;
	}
	.palette-modal {
		width: 100%;
		max-width: 620px;
		background: var(--color-surface);
		border-radius: 16px;
		box-shadow:
			0 0 0 1px var(--color-border),
			0 30px 60px -12px rgba(0,0,0,0.55),
			0 8px 24px rgba(0,0,0,0.2);
		overflow: hidden;
		animation: slide-down 0.18s cubic-bezier(0.16,1,0.3,1);
		display: flex;
		flex-direction: column;
		max-height: 70vh;
	}
	.palette-header {
		display: flex;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--color-border-light);
		gap: 0.75rem;
		flex-shrink: 0;
	}
	.search-icon { color: var(--color-accent); flex-shrink: 0; }
	.palette-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-size: 1.05rem;
		color: var(--color-text);
		font-weight: 400;
	}
	.palette-input::placeholder { color: var(--color-text-tertiary); }
	.esc-hint {
		font-size: 0.62rem;
		font-weight: 700;
		color: var(--color-text-tertiary);
		background: var(--color-bg);
		padding: 0.2rem 0.45rem;
		border-radius: 5px;
		border: 1px solid var(--color-border);
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}
	.fetching-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* Results */
	.palette-results {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		scrollbar-width: thin;
	}
	.group-header {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--color-text-tertiary);
		padding: 0.6rem 1rem 0.3rem;
		margin-top: 0.25rem;
	}
	.group-header:first-child { margin-top: 0; }
	.no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3rem 1rem;
		text-align: center;
		color: var(--color-text-secondary);
		gap: 0.75rem;
		opacity: 0.7;
	}
	.no-results p { margin: 0; font-size: 0.95rem; }
	.cmd-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.6rem 0.875rem;
		border-radius: 10px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}
	.cmd-item.selected {
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
	}
	.cmd-item:hover:not(.selected) { background: var(--color-surface-hover); }
	.cmd-icon {
		font-size: 1.1rem;
		width: 28px;
		text-align: center;
		flex-shrink: 0;
	}
	.cmd-text { flex: 1; min-width: 0; }
	.cmd-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.cmd-subtitle {
		font-size: 0.72rem;
		color: var(--color-text-tertiary);
		margin-top: 1px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.enter-hint {
		color: var(--color-accent);
		font-size: 1rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	/* Footer */
	.palette-footer {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 0.6rem 1.25rem;
		border-top: 1px solid var(--color-border-light);
		flex-shrink: 0;
	}
	.palette-footer span {
		font-size: 0.72rem;
		color: var(--color-text-tertiary);
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.palette-footer kbd {
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.1rem 0.35rem;
		font-size: 0.65rem;
		font-family: inherit;
		color: var(--color-text-secondary);
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to   { opacity: 1; }
	}
	@keyframes slide-down {
		from { transform: translateY(-16px) scale(0.97); opacity: 0; }
		to   { transform: translateY(0) scale(1); opacity: 1; }
	}
</style>
