<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { toasts } from '$lib/stores/toast.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import KanbanBoard from '$lib/components/tasks/KanbanBoard.svelte';
	import TaskForm from '$lib/components/tasks/TaskForm.svelte';
	import type { TaskView } from '$lib/types/index.js';

	let { data } = $props();

	let currentView = $state<TaskView>('kanban');
	let isFormOpen = $state(false);
	let selectedTask = $state<any>(null);
	let initialStatus = $state<string>('NOT_STARTED');

	const viewTabs = [
		{ id: 'kanban', label: 'Board' },
		{ id: 'list', label: 'List' }
	];

	function handleTaskClick(task: any) {
		selectedTask = task;
		isFormOpen = true;
	}

	function handleAddTask(status?: string) {
		selectedTask = null;
		initialStatus = status || 'NOT_STARTED';
		isFormOpen = true;
	}

	async function handleSaveTask(taskData: any) {
		try {
			const method = taskData.id ? 'PUT' : 'POST';
			const url = taskData.id ? `/api/tasks/${taskData.id}` : '/api/tasks';
			
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(taskData)
			});

			if (!res.ok) throw new Error('Failed to save task');

			toasts.success(taskData.id ? 'Task updated' : 'Task created');
			isFormOpen = false;
			await invalidateAll(); // Reload data
		} catch (error) {
			toasts.error('An error occurred while saving the task');
		}
	}

	async function handleStatusChange(taskId: string, newStatus: string, newPosition: number) {
		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus, position: newPosition })
			});

			if (!res.ok) throw new Error('Failed to update task status');
			await invalidateAll();
		} catch (error) {
			toasts.error('An error occurred while moving the task');
		}
	}
</script>

<svelte:head>
	<title>Tasks | FlowPlan</title>
</svelte:head>

<div class="flex flex-col h-full space-y-4">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight text-primary">Tasks</h1>
			<p class="text-sm text-secondary">Manage and organize your work.</p>
		</div>
		<div class="flex items-center gap-3">
			<Tabs 
				tabs={viewTabs} 
				activeId={currentView} 
				onchange={(id) => currentView = id as any} 
			/>
			<Button onclick={() => handleAddTask()} class="hidden sm:flex">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
				New Task
			</Button>
		</div>
	</div>

	<!-- Task Views -->
	<div class="flex-1 min-h-0 overflow-hidden">
		{#if currentView === 'kanban'}
			<KanbanBoard 
				tasks={data.tasks}
				onTaskClick={handleTaskClick}
				onStatusChange={handleStatusChange}
				onAddTask={handleAddTask}
			/>
		{:else}
			<div class="bg-surface rounded-xl border border-default p-8 text-center">
				<p class="text-secondary">List view coming soon.</p>
			</div>
		{/if}
	</div>
</div>

<TaskForm 
	isOpen={isFormOpen}
	task={selectedTask}
	{initialStatus}
	onclose={() => isFormOpen = false}
	onsave={handleSaveTask}
/>
