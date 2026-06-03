<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import TaskForm from '$lib/components/tasks/TaskForm.svelte';
	import { PRIORITY_COLORS } from '$lib/types/index.js';
	import { toasts } from '$lib/stores/toast.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { slide, fade, scale, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	let { data } = $props();

	// ── Kanban data ───────────────────────────────────────────────
	// svelte-ignore state_referenced_locally
	let tasks = $state(data.tasks);

	// ── Lists (Google Tasks style) ────────────────────────────────
	// svelte-ignore state_referenced_locally
	let lists = $state(data.checklists as any[]);

	let viewMode = $state<'compact' | 'expanded'>(
		(typeof localStorage !== 'undefined' && (localStorage.getItem('taskViewMode') as any)) || 'expanded'
	);
	function setViewMode(m: 'compact' | 'expanded') {
		viewMode = m;
		vmOpen = false;
		if (typeof localStorage !== 'undefined') localStorage.setItem('taskViewMode', m);
	}
	let vmOpen = $state(false);

	const vmOptions = [
		{
			value: 'expanded' as const,
			label: 'Expanded',
			desc: 'Full detail cards',
			icon: `<rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="5" rx="1"/><rect x="3" y="17" width="18" height="5" rx="1"/>`
		},
		{
			value: 'compact' as const,
			label: 'Compact',
			desc: 'Minimal list rows',
			icon: `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`
		}
	];
	const vmCurrent = $derived(vmOptions.find(o => o.value === viewMode)!);
	let hiddenListIds = $state<Set<string>>(new Set());
	let completedExpanded = $state<Set<string>>(new Set());

	// New list creation
	let isCreatingList = $state(false);
	let newListTitle = $state('');
	let listTitleInput = $state<HTMLInputElement | undefined>(undefined);

	// Adding items
	let addingItemForList = $state<string | null>(null);
	let newItemTitle = $state('');
	let itemInput = $state<HTMLInputElement | undefined>(undefined);

	// Edit item title inline
	let editingItemId = $state<string | null>(null);
	let editingItemTitle = $state('');

	// Kanban modal
	let isTaskFormOpen = $state(false);
	let selectedTask = $state<any>(null);

	// Undo delay state
	let completingItemIds = $state(new Map<string, NodeJS.Timeout>());

	// ── Derived ──────────────────────────────────────────────────
	const unhiddenLists = $derived(lists.filter((l) => !hiddenListIds.has(l.id)));

	// ── List actions ─────────────────────────────────────────────
	function startCreatingList() {
		isCreatingList = true;
		newListTitle = '';
		setTimeout(() => listTitleInput?.focus(), 50);
	}

	async function createList() {
		const title = newListTitle.trim();
		if (!title) { isCreatingList = false; return; }
		isCreatingList = false;
		newListTitle = '';

		const id = crypto.randomUUID();
		const optimistic = { id, title, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
		lists = [...lists, optimistic];

		const res = await fetch('/api/checklists', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title })
		});
		if (res.ok) {
			const real = await res.json();
			lists = lists.map((l) => (l.id === id ? { ...l, id: real.id } : l));
		}
	}

	async function deleteList(listId: string) {
		if (!confirm('Delete this list and all its items?')) return;
		lists = lists.filter((l) => l.id !== listId);
		await fetch(`/api/checklists/${listId}`, { method: 'DELETE' }).catch(console.error);
	}

	async function renameList(listId: string, newTitle: string) {
		if (!newTitle.trim()) return;
		lists = lists.map((l) => (l.id === listId ? { ...l, title: newTitle } : l));
		await fetch(`/api/checklists/${listId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: newTitle })
		}).catch(console.error);
	}

	function toggleListVisibility(listId: string) {
		const next = new Set(hiddenListIds);
		next.has(listId) ? next.delete(listId) : next.add(listId);
		hiddenListIds = next;
	}

	// ── Item actions ─────────────────────────────────────────────
	function startAddingItem(listId: string) {
		addingItemForList = listId;
		newItemTitle = '';
		setTimeout(() => itemInput?.focus(), 50);
	}

	async function addItem() {
		const title = newItemTitle.trim();
		if (!title || !addingItemForList) { addingItemForList = null; return; }
		const listId = addingItemForList;
		addingItemForList = null;
		newItemTitle = '';

		const id = crypto.randomUUID();
		const position = (lists.find((l) => l.id === listId)?.items.length ?? 0);
		const optimistic = { id, checklistId: listId, title, isCompleted: false, position, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
		lists = lists.map((l) => l.id === listId ? { ...l, items: [...l.items, optimistic] } : l);

		const res = await fetch(`/api/checklists/${listId}/items`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, position })
		});
		if (res.ok) {
			const real = await res.json();
			lists = lists.map((l) => l.id === listId
				? { ...l, items: l.items.map((i: any) => (i.id === id ? { ...i, id: real.id } : i)) }
				: l
			);
		}
	}

	function handleTaskCheck(listId: string, item: any) {
		if (item.isCompleted) {
			// Uncheck immediately
			performToggle(listId, item.id, false);
		} else {
			if (completingItemIds.has(item.id)) {
				// Undo check
				clearTimeout(completingItemIds.get(item.id));
				completingItemIds.delete(item.id);
				completingItemIds = new Map(completingItemIds); // trigger reactivity
			} else {
				// Start check delay
				const timeoutId = setTimeout(() => {
					completingItemIds.delete(item.id);
					completingItemIds = new Map(completingItemIds);
					performToggle(listId, item.id, true);
				}, 1500);
				completingItemIds.set(item.id, timeoutId);
				completingItemIds = new Map(completingItemIds);
			}
		}
	}

	async function performToggle(listId: string, itemId: string, isCompleted: boolean) {
		lists = lists.map((l) => {
			if (l.id !== listId) return l;
			return {
				...l,
				items: l.items.map((i: any) => (i.id === itemId ? { ...i, isCompleted } : i))
			};
		});

		await fetch(`/api/checklists/items/${itemId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isCompleted })
		}).catch(console.error);
	}

	async function deleteItem(listId: string, itemId: string) {
		lists = lists.map((l) =>
			l.id === listId ? { ...l, items: l.items.filter((i: any) => i.id !== itemId) } : l
		);
		await fetch(`/api/checklists/items/${itemId}`, { method: 'DELETE' }).catch(console.error);
	}

	function startEditingItem(item: any) {
		editingItemId = item.id;
		editingItemTitle = item.title;
	}

	async function saveItemTitle(listId: string, itemId: string) {
		const title = editingItemTitle.trim();
		editingItemId = null;
		if (!title) return;
		lists = lists.map((l) =>
			l.id === listId
				? { ...l, items: l.items.map((i: any) => (i.id === itemId ? { ...i, title } : i)) }
				: l
		);
		await fetch(`/api/checklists/items/${itemId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title })
		}).catch(console.error);
	}

	function toggleCompleted(listId: string) {
		const next = new Set(completedExpanded);
		next.has(listId) ? next.delete(listId) : next.add(listId);
		completedExpanded = next;
	}

	// ── Kanban ───────────────────────────────────────────────────
	async function handleSaveTask(taskData: any) {
		try {
			const isEdit = !!taskData.id;
			const res = await fetch(isEdit ? `/api/tasks/${taskData.id}` : '/api/tasks', {
				method: isEdit ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(taskData)
			});
			if (!res.ok) throw new Error();
			const saved = await res.json();
			tasks = isEdit ? tasks.map((t: any) => (t.id === saved.id ? saved : t)) : [...tasks, saved];
			toasts.success(isEdit ? 'Task updated' : 'Task created');
			isTaskFormOpen = false;
			// Clean up URL if needed
			if ($page.url.searchParams.has('new')) {
				const url = new URL($page.url);
				url.searchParams.delete('new');
				goto(url.pathname + url.search, { replaceState: true, keepFocus: true });
			}
		} catch {
			toasts.error('Error saving task');
		}
	}

	async function handleStatusChange(taskId: string, newStatus: string, newPosition: number) {
		tasks = tasks.map((t: any) =>
			t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
		);
		await fetch(`/api/tasks/${taskId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: newStatus, position: newPosition })
		}).catch(() => toasts.error('Failed to update task'));
	}

	let editingListName = $state<string | null>(null);
	let editingListNameValue = $state('');

	// ── List Drag and Drop ───────────────────────────────────────
	let draggedListId = $state<string | null>(null);
	let draggedOverListId = $state<string | null>(null);

	function handleListDragStart(e: DragEvent, listId: string) {
		// Only drag if we're not interacting with the inner list (which can also scroll or have items)
		// But for simplicity we'll just allow the column header to drag or the whole column
		draggedListId = listId;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', listId);
		}
	}
	
	function handleListDragOver(e: DragEvent, listId: string) {
		e.preventDefault();
		draggedOverListId = listId;
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}
	
	function handleListDrop(e: DragEvent, listId: string) {
		e.preventDefault();
		draggedOverListId = null;
		if (draggedListId && draggedListId !== listId) {
			const sourceIndex = lists.findIndex((l) => l.id === draggedListId);
			const targetIndex = lists.findIndex((l) => l.id === listId);
			if (sourceIndex > -1 && targetIndex > -1) {
				const newLists = [...lists];
				const [moved] = newLists.splice(sourceIndex, 1);
				newLists.splice(targetIndex, 0, moved);
				lists = newLists;
				// If you have a PUT /api/checklists/order endpoint, call it here
			}
		}
		draggedListId = null;
	}

	$effect(() => {
		if ($page.url.searchParams.get('new') === 'true' && !isTaskFormOpen) {
			selectedTask = null;
			isTaskFormOpen = true;
		}
	});
</script>

<svelte:head>
	<title>Tasks — FlowPlan</title>
</svelte:head>

<div class="tasks-page">
	<!-- Top bar -->
	<header class="tasks-header">
		<!-- Custom view-mode dropdown -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="vm-dropdown" class:open={vmOpen}>
			<button
				class="vm-trigger"
				onclick={() => vmOpen = !vmOpen}
				aria-haspopup="listbox"
				aria-expanded={vmOpen}
			>
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="vm-trigger-icon">
					{@html vmCurrent.icon}
				</svg>
				<span class="vm-trigger-label">{vmCurrent.label}</span>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="vm-chevron" class:rotated={vmOpen}><path d="M6 9l6 6 6-6"/></svg>
			</button>

			{#if vmOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="vm-backdrop" onclick={() => vmOpen = false}></div>
				<div class="vm-panel" role="listbox">
					{#each vmOptions as opt}
						<button
							class="vm-option"
							class:selected={viewMode === opt.value}
							onclick={() => setViewMode(opt.value)}
							role="option"
							aria-selected={viewMode === opt.value}
						>
							<div class="vm-opt-icon">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">{@html opt.icon}</svg>
							</div>
							<div class="vm-opt-text">
								<span class="vm-opt-label">{opt.label}</span>
								<span class="vm-opt-desc">{opt.desc}</span>
							</div>
							{#if viewMode === opt.value}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="vm-opt-check"><path d="M20 6L9 17l-5-5"/></svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<Button variant="primary" size="sm" onclick={() => { selectedTask = null; isTaskFormOpen = true; }}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
			New Task
		</Button>
	</header>


		<!-- ALL TASKS LIST -->
		<div class="lists-layout" class:compact={viewMode === 'compact'}>
			<!-- Left: list sidebar -->
			<aside class="lists-sidebar">
				<div class="sidebar-scroll">
					<h3 class="sidebar-title">My Lists</h3>
					{#each lists as list (list.id)}
						<button
							class="list-tab"
							class:hidden-list={hiddenListIds.has(list.id)}
							onclick={() => toggleListVisibility(list.id)}
						>
							<div class="list-tab-left">
								<div class="visibility-icon" class:visible={!hiddenListIds.has(list.id)}>
									{#if !hiddenListIds.has(list.id)}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
									{:else}
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
									{/if}
								</div>
								<span class="list-dot" style="background: {stringToColor(list.title)}"></span>
								<span class="list-tab-name">{list.title}</span>
							</div>
							<span class="list-count">{list.items.filter((i: any) => !i.isCompleted).length}</span>
						</button>
					{/each}

					{#if isCreatingList}
						<div class="new-list-form">
							<input
							bind:this={listTitleInput}
							type="text"
							bind:value={newListTitle}
							class="new-list-input"
							placeholder="List title..."
							onblur={createList}
							onkeydown={(e) => {
								if (e.key === 'Enter') createList();
								if (e.key === 'Escape') isCreatingList = false;
							}}
						/>
						</div>
					{/if}

					<button class="add-list-btn" onclick={startCreatingList}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
						New list
					</button>
				</div>
			</aside>

			<!-- Right: items for unhidden lists -->
			<main class="list-columns-area">
				{#if lists.length === 0}
					<div class="empty-lists">
						<p>Create your first list to get started</p>
						<button class="btn-primary-sm" onclick={startCreatingList}>New list</button>
					</div>
				{:else if unhiddenLists.length === 0}
					<div class="empty-lists">
						<p>All lists are hidden. Click a list in the sidebar to view it.</p>
					</div>
				{:else}
					{#each unhiddenLists as list (list.id)}
						{@const activeItems = list.items.filter((i: any) => !i.isCompleted)}
						{@const completedItems = list.items.filter((i: any) => i.isCompleted)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div 
							class="list-column {draggedOverListId === list.id ? 'dragged-over' : ''}"
							draggable="true"
							ondragstart={(e) => handleListDragStart(e, list.id)}
							ondragover={(e) => handleListDragOver(e, list.id)}
							ondragleave={() => draggedOverListId = null}
							ondrop={(e) => handleListDrop(e, list.id)}
							animate:flip={{ duration: 350, easing: quintOut }}
							in:scale={{ duration: 300, start: 0.92, opacity: 0, easing: quintOut, delay: 50 }}
							out:scale={{ duration: 200, start: 0.95, opacity: 0, easing: quintOut }}
						>
							<!-- List header -->
							<div class="list-header">
								{#if editingListName === list.id}
									<input
										class="list-title-input"
										bind:value={editingListNameValue}
										onblur={() => { renameList(list.id, editingListNameValue); editingListName = null; }}
										onkeydown={(e) => { if (e.key === 'Enter') { renameList(list.id, editingListNameValue); editingListName = null; } if (e.key === 'Escape') editingListName = null; }}
									/>
								{:else}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<h1 class="list-title" ondblclick={() => { editingListName = list.id; editingListNameValue = list.title; }}>
										<span class="list-dot" style="background: {stringToColor(list.title)}"></span>
										{list.title}
									</h1>
								{/if}
								<div class="list-actions">
									<button class="icon-btn" onclick={() => toggleListVisibility(list.id)} title="Hide list">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
									</button>
									<button class="icon-btn danger" onclick={() => deleteList(list.id)} title="Delete list">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
									</button>
								</div>
							</div>

							<!-- Items -->
							<div class="items-list">
								{#each activeItems as item (item.id)}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="task-item"
										class:compact-item={viewMode === 'compact'}
										onclick={(e) => {
											// don't open edit if clicking checkbox, undo, delete
											const t = e.target as HTMLElement;
											if (t.closest('.item-check, .item-undo, .item-delete, .item-title-input')) return;
											selectedTask = { id: item.id, title: item.title, status: 'NOT_STARTED', priority: item.priority ?? 'MEDIUM', notes: item.notes ?? '' };
											isTaskFormOpen = true;
										}}
										style="cursor: pointer"
									>
										<!-- Circle checkbox -->
										<button
											class="item-check"
											class:checked={completingItemIds.has(item.id)}
											onclick={() => handleTaskCheck(list.id, item)}
											aria-label="Complete task"
										>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
												<path d="M20 6L9 17l-5-5"/>
											</svg>
										</button>

										<!-- Title (click to edit inline) -->
										<div class="item-title-container">
											{#if editingItemId === item.id}
												<input
													class="item-title-input"
													bind:value={editingItemTitle}
													onblur={() => saveItemTitle(list.id, item.id)}
													onkeydown={(e) => {
														if (e.key === 'Enter') saveItemTitle(list.id, item.id);
														if (e.key === 'Escape') editingItemId = null;
													}}
												/>
											{:else}
												<!-- svelte-ignore a11y_click_events_have_key_events -->
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<span
													class="item-title"
													class:completing-text={completingItemIds.has(item.id)}
													ondblclick={() => startEditingItem(item)}
												>{item.title}</span>
											{/if}
										</div>

										<!-- Meta info: only in expanded mode -->
										{#if viewMode === 'expanded'}
											<div class="item-meta">
												<span class="item-badge status-badge">{item.status?.replace('_', ' ').toLowerCase() ?? 'not started'}</span>
												{#if item.priority}
													<span class="item-badge priority" style="color: {PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS]}; border-color: color-mix(in srgb, {PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS]} 30%, transparent); background: color-mix(in srgb, {PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS]} 10%, transparent)">
														{item.priority.toLowerCase()}
													</span>
												{/if}
												{#if item.dueDate}
													<span class="item-badge due">
														<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
														{new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
													</span>
												{/if}
												{#if item.notes}
													<span class="item-badge notes" title={item.notes}>
														<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
														Note
													</span>
												{/if}
											</div>
										{/if}

										<!-- Undo or Delete -->
										{#if completingItemIds.has(item.id)}
											<button class="item-undo" onclick={() => handleTaskCheck(list.id, item)}>
												Undo
											</button>
										{:else}
											<button class="item-delete" onclick={() => deleteItem(list.id, item.id)} aria-label="Delete">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
											</button>
										{/if}
									</div>
								{/each}

								<!-- Add item -->
								{#if addingItemForList === list.id}
									<div class="add-item-row">
										<div class="item-check-placeholder"></div>
										<input
											bind:this={itemInput}
											type="text"
											bind:value={newItemTitle}
											placeholder="New task..."
											class="item-title-input"
											onkeydown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') addingItemForList = null; }}
											onblur={addItem}
										/>
									</div>
								{:else}
									<button class="add-item-btn" onclick={() => startAddingItem(list.id)}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
										Add a task
									</button>
								{/if}

								<!-- Completed section -->
								{#if completedItems.length > 0}
									<button class="completed-toggle" onclick={() => toggleCompleted(list.id)}>
										<svg
											width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
											style="transform: rotate({completedExpanded.has(list.id) ? 90 : 0}deg); transition: transform 0.2s"
										>
											<path d="M9 18l6-6-6-6"/>
										</svg>
										Completed ({completedItems.length})
									</button>

									{#if completedExpanded.has(list.id)}
										<div class="completed-items">
											{#each completedItems as item (item.id)}
												<div class="task-item completed">
													<button
														class="item-check checked"
														onclick={() => handleTaskCheck(list.id, item)}
														aria-label="Uncomplete task"
													>
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
															<path d="M20 6L9 17l-5-5"/>
														</svg>
													</button>
													<span class="item-title completed-text">{item.title}</span>
													<button class="item-delete" onclick={() => deleteItem(list.id, item.id)} aria-label="Delete">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
													</button>
												</div>
											{/each}
										</div>
									{/if}
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</main>
		</div>
</div>

<TaskForm
	isOpen={isTaskFormOpen}
	task={selectedTask}
	initialStatus="NOT_STARTED"
	onclose={() => isTaskFormOpen = false}
	onsave={handleSaveTask}
/>

<script module lang="ts">
	/** Deterministic pastel color from a string */
	function stringToColor(s: string): string {
		const colors = ['#6366f1','#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6'];
		let hash = 0;
		for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) & 0xffffffff;
		return colors[Math.abs(hash) % colors.length];
	}
</script>

<style>
	.tasks-page {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 0;
	}

	/* Header */
	.tasks-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 0;
		flex-shrink: 0;
	}
	/* ── Custom view-mode dropdown ─────────────────────────── */
	.vm-dropdown {
		position: relative;
		z-index: 20;
	}
	.vm-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem 0.4rem 0.625rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0,0,0,.06);
	}
	.vm-trigger:hover, .vm-dropdown.open .vm-trigger {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
	}
	.vm-trigger-icon { color: var(--color-accent); flex-shrink: 0; }
	.vm-trigger-label {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
	}
	.vm-chevron {
		color: var(--color-text-tertiary);
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}
	.vm-chevron.rotated { transform: rotate(180deg); }

	.vm-backdrop {
		position: fixed;
		inset: 0;
		z-index: 19;
	}
	.vm-panel {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		min-width: 200px;
		background: var(--color-surface);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-xl);
		box-shadow: 0 12px 32px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.1);
		padding: 0.375rem;
		z-index: 21;
		animation: vm-open 0.15s cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes vm-open {
		from { opacity: 0; transform: translateY(-6px) scale(0.97); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}
	.vm-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-lg);
		border: none;
		background: none;
		cursor: pointer;
		transition: background 0.12s;
		text-align: left;
	}
	.vm-option:hover { background: var(--color-surface-hover); }
	.vm-option.selected { background: color-mix(in srgb, var(--color-accent) 10%, transparent); }
	.vm-opt-icon {
		width: 30px;
		height: 30px;
		border-radius: var(--radius-sm);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-accent);
		flex-shrink: 0;
	}
	.vm-opt-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
	}
	.vm-opt-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text);
	}
	.vm-opt-desc {
		font-size: 0.73rem;
		color: var(--color-text-tertiary);
	}
	.vm-opt-check {
		color: var(--color-accent);
		flex-shrink: 0;
		margin-left: auto;
	}

	/* Lists layout */
	.lists-layout {
		flex: 1;
		display: flex;
		gap: 0;
		overflow: hidden;
		margin-top: 0;
		min-height: 0;
	}

	/* Sidebar */
	.lists-sidebar {
		width: 240px;
		flex-shrink: 0;
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--color-surface);
	}
	.sidebar-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.sidebar-title {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
		color: var(--color-text-tertiary);
		margin-bottom: 0.5rem;
		padding: 0 0.5rem;
	}
	.list-tab {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		border-radius: var(--radius-md);
		border: none;
		background: none;
		color: var(--color-text);
		font-size: 0.85rem;
		cursor: pointer;
		text-align: left;
		transition: all 0.15s;
		width: 100%;
	}
	.list-tab:hover { background: var(--color-surface-hover); }
	.list-tab.hidden-list { opacity: 0.6; color: var(--color-text-secondary); }
	
	.list-tab-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		overflow: hidden;
	}
	.visibility-icon {
		color: var(--color-text-tertiary);
		display: flex;
		align-items: center;
	}
	.visibility-icon.visible { color: var(--color-accent); }
	.list-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.list-tab-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	
	.list-count {
		font-size: 0.72rem;
		background: var(--color-surface-active);
		color: var(--color-text-tertiary);
		padding: 0.1rem 0.4rem;
		border-radius: 9999px;
		flex-shrink: 0;
	}
	.new-list-form { padding: 0.25rem 0.5rem; }
	.new-list-input {
		width: 100%;
		background: var(--color-bg);
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-md);
		padding: 0.4rem 0.625rem;
		font-size: 0.85rem;
		color: var(--color-text);
		outline: none;
		box-sizing: border-box;
	}
	.add-list-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.5rem;
		border-radius: var(--radius-md);
		border: none;
		background: none;
		color: var(--color-text-tertiary);
		font-size: 0.825rem;
		cursor: pointer;
		transition: all 0.15s;
		width: 100%;
		margin-top: 0.25rem;
	}
	.add-list-btn:hover { color: var(--color-accent); background: var(--color-accent-light); }

	/* Columns area */
	.list-columns-area {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		align-content: start;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1.5rem;
		gap: 2rem;
		background: var(--color-bg);
	}
	.list-column {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: 1.25rem;
		max-height: calc(100vh - 140px);
		cursor: grab;
		transition: all 0.2s;
	}
	.list-column:active { cursor: grabbing; }
	.list-column.dragged-over {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent);
	}
	
	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		flex-shrink: 0;
	}
	.list-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
		cursor: text;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.list-title-input {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--color-text);
		background: none;
		border: none;
		border-bottom: 2px solid var(--color-accent);
		outline: none;
		flex: 1;
		padding: 0.1rem 0;
	}
	.list-actions { display: flex; gap: 0.5rem; }
	.icon-btn {
		width: 30px;
		height: 30px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}
	.icon-btn:hover { background: var(--color-surface-hover); color: var(--color-text); }
	.icon-btn.danger:hover { background: var(--color-danger-light); color: var(--color-danger); border-color: var(--color-danger); }

	/* Items list */
	.items-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	/* ── Expanded: task meta badges ──────────────────────────── */
	.item-meta {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-left: auto;
		flex-shrink: 0;
	}
	.item-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.72rem;
		font-weight: 500;
		padding: 0.2rem 0.5rem;
		border-radius: 9999px;
		white-space: nowrap;
	}
	.item-badge.due {
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		color: var(--color-accent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
	}
	.item-badge.notes {
		background: color-mix(in srgb, var(--color-text-secondary) 10%, transparent);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}
	.item-badge.status-badge {
		background: var(--color-surface-hover);
		color: var(--color-text-tertiary);
		border: 1px solid var(--color-border);
		text-transform: capitalize;
	}

	/* Compact mode: tighter rows */
	.compact .list-column {
		min-width: 220px;
		max-width: 320px;
	}
	.compact .list-header {
		padding: 0.5rem 0.5rem 0.4rem;
	}
	.compact-item {
		padding: 0.35rem 0.5rem 0.35rem 0.25rem !important;
	}
	.compact-item .item-title {
		font-size: 0.85rem !important;
	}

	/* Task item row */
	.task-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.5rem 0.6rem 0.25rem;
		border-radius: var(--radius-md);
		transition: background 0.15s;
	}
	.task-item:hover { background: var(--color-surface-hover); }
	.task-item.completed { opacity: 0.65; }

	/* Circle checkbox */
	.item-check {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid var(--color-text-tertiary);
		background: var(--color-bg);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: transparent;
		transition: all 0.15s;
	}
	.item-check:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
	.item-check.checked {
		background: var(--color-success);
		border-color: var(--color-success);
		color: white;
	}

	.item-check-placeholder {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	/* Item title */
	.item-title-container {
		flex: 1;
		min-width: 0;
	}
	.item-title {
		font-size: 0.9rem;
		color: var(--color-text);
		cursor: text;
		display: block;
		transition: color 0.2s, text-decoration 0.2s;
	}
	.item-title.completing-text {
		text-decoration: line-through;
		color: var(--color-text-tertiary);
	}
	.item-title.completed-text {
		text-decoration: line-through;
		color: var(--color-text-tertiary);
	}
	.item-title-input {
		width: 100%;
		background: none;
		border: none;
		border-bottom: 1.5px solid var(--color-accent);
		outline: none;
		font-size: 0.9rem;
		color: var(--color-text);
		padding: 0.1rem 0;
	}

	/* Undo button */
	.item-undo {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-accent);
		background: var(--color-accent-light);
		border: none;
		padding: 0.2rem 0.5rem;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all 0.15s;
	}
	.item-undo:hover { background: var(--color-accent); color: white; }

	/* Delete button */
	.item-delete {
		opacity: 0;
		width: 26px;
		height: 26px;
		border-radius: var(--radius-md);
		border: none;
		background: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
		flex-shrink: 0;
	}
	.item-delete:hover { color: var(--color-danger); background: var(--color-danger-light); }
	.task-item:hover .item-delete { opacity: 1; }

	/* Add item button */
	.add-item-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.5rem 0.5rem 0.25rem;
	}
	.add-item-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.25rem;
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: color 0.15s;
		margin-top: 0.25rem;
	}
	.add-item-btn:hover { color: var(--color-accent); }

	/* Completed section */
	.completed-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.25rem;
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.75rem;
		transition: color 0.15s;
	}
	.completed-toggle:hover { color: var(--color-text); }
	.completed-items {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 0.25rem;
	}

	/* Empty state */
	.empty-lists {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--color-text-secondary);
		font-size: 0.95rem;
	}
	.btn-primary-sm {
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		padding: 0.5rem 1.25rem;
		font-size: 0.875rem;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.15s;
	}
	.btn-primary-sm:hover { background: var(--color-accent-hover); }

	/* Mobile */
	@media (max-width: 640px) {
		.lists-layout { flex-direction: column; }
		.lists-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--color-border); }
		.sidebar-scroll { flex-direction: row; padding: 0.75rem; overflow-x: auto; gap: 0.5rem; }
		.sidebar-title { display: none; }
		.list-tab { flex-shrink: 0; width: auto; padding: 0.4rem 0.75rem; border: 1px solid var(--color-border); }
		.add-list-btn { flex-shrink: 0; width: auto; }
		.list-columns-area { flex-direction: column; padding: 1rem; overflow-y: auto; gap: 1rem; }
		.list-column { width: 100%; }
	}
</style>
