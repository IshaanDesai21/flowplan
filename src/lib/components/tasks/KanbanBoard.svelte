<script lang="ts">
	import { format } from 'date-fns';
	import { PRIORITY_COLORS, TASK_STATUS_LABELS } from '$lib/types/index.js';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { tasks, onTaskClick, onStatusChange, onAddTask } = $props();

	const COLUMNS = [
		{ id: 'NOT_STARTED', label: 'To Do' },
		{ id: 'IN_PROGRESS', label: 'In Progress' },
		{ id: 'COMPLETED', label: 'Done' }
	];

	// HTML5 Drag and Drop handlers
	let draggedTask: any = null;
	let draggedOverColumn: string | null = null;

	function handleDragStart(e: DragEvent, task: any) {
		draggedTask = task;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			// Required for Firefox
			e.dataTransfer.setData('text/plain', task.id);
		}
	}

	function handleDragOver(e: DragEvent, columnId: string) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		draggedOverColumn = columnId;
	}

	function handleDragLeave() {
		draggedOverColumn = null;
	}

	function handleDrop(e: DragEvent, columnId: string) {
		e.preventDefault();
		draggedOverColumn = null;
		
		if (draggedTask && draggedTask.status !== columnId) {
			// Find position (simplistic: put at end of column)
			const colTasks = tasks.filter((t: any) => t.status === columnId);
			const newPosition = colTasks.length > 0 ? Math.max(...colTasks.map((t: any) => t.position)) + 1 : 0;
			
			onStatusChange(draggedTask.id, columnId, newPosition);
		}
		draggedTask = null;
	}
</script>

<div class="flex h-full gap-4 overflow-x-auto pb-4 pt-2 px-1">
	{#each COLUMNS as column}
		{@const columnTasks = tasks.filter((t: any) => t.status === column.id).sort((a: any, b: any) => a.position - b.position)}
		<div 
			class="flex-shrink-0 w-80 flex flex-col bg-[var(--color-surface-hover)] rounded-xl border border-default
				{draggedOverColumn === column.id ? 'ring-2 ring-[var(--color-accent)] ring-offset-1 ring-offset-page bg-surface' : ''}"
			ondragover={(e) => handleDragOver(e, column.id)}
			ondragleave={handleDragLeave}
			ondrop={(e) => handleDrop(e, column.id)}
			role="list"
		>
			<!-- Column Header -->
			<div class="p-4 flex items-center justify-between border-b border-default shrink-0">
				<div class="flex items-center gap-2">
					<h3 class="font-semibold text-primary">{column.label}</h3>
					<span class="text-xs font-medium text-tertiary bg-surface px-2 py-0.5 rounded-full border border-default">{columnTasks.length}</span>
				</div>
				<button 
					class="text-tertiary hover:text-primary transition-colors p-1 rounded hover:bg-surface"
					onclick={() => onAddTask(column.id)}
					aria-label="Add task to {column.label}"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				</button>
			</div>

			<!-- Tasks Area -->
			<div class="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
				{#each columnTasks as task (task.id)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div 
						class="bg-surface border border-default rounded-lg p-3 shadow-sm hover:border-[var(--color-accent)] cursor-grab active:cursor-grabbing transition-colors"
						draggable="true"
						ondragstart={(e) => handleDragStart(e, task)}
						onclick={() => onTaskClick(task)}
					>
						<div class="flex items-start justify-between gap-2 mb-2">
							<h4 class="text-sm font-medium text-primary leading-tight line-clamp-2">{task.title}</h4>
						</div>
						
						{#if task.description}
							<p class="text-xs text-secondary line-clamp-2 mb-3">{task.description}</p>
						{/if}

						<div class="flex flex-wrap items-center justify-between gap-2 mt-auto">
							<div class="flex items-center gap-2">
								<!-- Priority Indicator -->
								<div class="w-2 h-2 rounded-full" style="background-color: {PRIORITY_COLORS[task.priority]}" title={task.priority}></div>
								
								{#if task.dueDate}
									<span class="text-xs text-tertiary flex items-center gap-1 bg-surface-hover px-1.5 py-0.5 rounded border border-default">
										<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
										{format(new Date(task.dueDate), 'MMM d')}
									</span>
								{/if}
							</div>
							
							{#if task.category}
								<Badge size="sm">{task.category}</Badge>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
