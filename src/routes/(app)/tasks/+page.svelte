<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import KanbanBoard from '$lib/components/tasks/KanbanBoard.svelte';
	import TaskForm from '$lib/components/tasks/TaskForm.svelte';
	import { toasts } from '$lib/stores/toast.js';

	let { data } = $props();

	let tasks = $state(data.tasks);
	let view = $state('kanban');
	let isFormOpen = $state(false);
	let selectedTask = $state<any>(null);
	let initialStatusForNew = $state('NOT_STARTED');

	const views = [
		{ id: 'kanban', label: 'Board' },
		{ id: 'list', label: 'List' }
	];

	function openNewTaskModal(status = 'NOT_STARTED') {
		selectedTask = null;
		initialStatusForNew = status;
		isFormOpen = true;
	}

	function openEditTaskModal(task: any) {
		selectedTask = task;
		isFormOpen = true;
	}

	async function handleSaveTask(taskData: any) {
		try {
			const isEdit = !!taskData.id;
			const url = isEdit ? `/api/tasks/${taskData.id}` : '/api/tasks';
			const method = isEdit ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(taskData)
			});

			if (!res.ok) throw new Error('Failed to save task');

			const savedTask = await res.json();
			
			// Format dates for UI
			if (savedTask.dueDate) savedTask.dueDate = savedTask.dueDate; // Keep ISO string

			if (isEdit) {
				tasks = tasks.map(t => t.id === savedTask.id ? savedTask : t);
				toasts.success('Task updated');
			} else {
				tasks = [...tasks, savedTask];
				toasts.success('Task created');
			}
			isFormOpen = false;
		} catch (e) {
			toasts.error('Error saving task');
			console.error(e);
		}
	}

	async function handleStatusChange(taskId: string, newStatus: string, newPosition: number) {
		// Optimistic update
		tasks = tasks.map(t => {
			if (t.id === taskId) {
				return { ...t, status: newStatus, position: newPosition };
			}
			return t;
		});

		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus, position: newPosition })
			});
			if (!res.ok) throw new Error('Failed to update status');
		} catch (e) {
			// Revert on failure (simplistic: just reload data in real app, here we just show error)
			toasts.error('Failed to save task movement');
		}
	}
</script>

<svelte:head>
	<title>Tasks — FlowPlan</title>
</svelte:head>

<div class="tasks-page h-full flex flex-col">
	<header class="page-header">
		<div>
			<h1 class="page-title">Tasks</h1>
			<p class="page-subtitle">Manage your projects and to-dos</p>
		</div>
		<div class="header-actions">
			<Tabs tabs={views} activeId={view} onchange={(v) => view = v} />
			<Button variant="primary" onclick={() => openNewTaskModal()}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
					<path d="M12 5v14M5 12h14" />
				</svg>
				New Task
			</Button>
		</div>
	</header>

	<div class="tasks-content flex-1 overflow-hidden">
		{#if view === 'kanban'}
			<KanbanBoard 
				{tasks} 
				onTaskClick={openEditTaskModal} 
				onStatusChange={handleStatusChange}
				onAddTask={openNewTaskModal}
			/>
		{:else}
			<div class="flex items-center justify-center h-full text-secondary">
				<p>List view is under construction</p>
			</div>
		{/if}
	</div>
</div>

<TaskForm 
	isOpen={isFormOpen} 
	task={selectedTask}
	initialStatus={initialStatusForNew}
	onclose={() => isFormOpen = false} 
	onsave={handleSaveTask} 
/>

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1.5rem;
	}
	.page-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.25rem;
	}
	.page-subtitle {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		margin: 0;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
</style>
