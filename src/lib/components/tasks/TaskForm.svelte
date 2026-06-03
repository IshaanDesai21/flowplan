<script lang="ts">
	import { format } from 'date-fns';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dropdown from '$lib/components/ui/Dropdown.svelte';
	import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '$lib/types/index.js';

	let { isOpen, task = null, initialStatus = 'NOT_STARTED', onclose, onsave } = $props();

	let title = $state('');
	let description = $state('');
	let dueDateStr = $state('');
	let priority = $state('MEDIUM');
	let status = $state('NOT_STARTED');
	let category = $state('');

	$effect(() => {
		if (isOpen) {
			if (task) {
				title = task.title;
				description = task.description || '';
				dueDateStr = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '';
				priority = task.priority;
				status = task.status;
				category = task.category || '';
			} else {
				title = '';
				description = '';
				dueDateStr = '';
				priority = 'MEDIUM';
				status = initialStatus;
				category = '';
			}
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		
		let dueDate = null;
		if (dueDateStr) {
			const [year, month, day] = dueDateStr.split('-').map(Number);
			dueDate = new Date(year, month - 1, day).toISOString();
		}

		onsave({
			id: task?.id,
			title,
			description,
			dueDate,
			priority,
			status,
			category
		});
	}

	const priorityOptions = [
		{ value: 'LOW', label: PRIORITY_LABELS.LOW, color: PRIORITY_COLORS.LOW },
		{ value: 'MEDIUM', label: PRIORITY_LABELS.MEDIUM, color: PRIORITY_COLORS.MEDIUM },
		{ value: 'HIGH', label: PRIORITY_LABELS.HIGH, color: PRIORITY_COLORS.HIGH },
		{ value: 'CRITICAL', label: PRIORITY_LABELS.CRITICAL, color: PRIORITY_COLORS.CRITICAL }
	];

	const statusOptions = [
		{ value: 'NOT_STARTED', label: TASK_STATUS_LABELS.NOT_STARTED, color: TASK_STATUS_COLORS.NOT_STARTED },
		{ value: 'IN_PROGRESS', label: TASK_STATUS_LABELS.IN_PROGRESS, color: TASK_STATUS_COLORS.IN_PROGRESS },
		{ value: 'WAITING', label: TASK_STATUS_LABELS.WAITING, color: TASK_STATUS_COLORS.WAITING },
		{ value: 'COMPLETED', label: TASK_STATUS_LABELS.COMPLETED, color: TASK_STATUS_COLORS.COMPLETED }
	];
</script>

<Modal {isOpen} {onclose} title={task ? 'Edit Task' : 'New Task'}>
	<form id="task-form" onsubmit={handleSubmit} class="space-y-4">
		<Input 
			name="title" 
			label="Task Title" 
			placeholder="What needs to be done?" 
			bind:value={title} 
			required 
		/>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-secondary">Description</label>
			<textarea 
				class="flex w-full rounded-md border border-default bg-transparent px-3 py-2 text-sm placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-primary focus-visible:ring-[var(--color-accent)] min-h-[80px] resize-y"
				placeholder="Add details, steps, or notes..."
				bind:value={description}
			></textarea>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Input 
				name="dueDate" 
				type="date" 
				label="Due Date" 
				bind:value={dueDateStr} 
			/>
			
			<Dropdown
				label="Priority"
				options={priorityOptions}
				bind:value={priority}
			/>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Dropdown
				label="Status"
				options={statusOptions}
				bind:value={status}
			/>

			<Input 
				name="category" 
				label="Category" 
				placeholder="E.g., Work, Personal" 
				bind:value={category} 
			/>
		</div>
	</form>

	{#snippet footer()}
		<Button variant="ghost" onclick={onclose}>Cancel</Button>
		<Button type="submit" onclick={handleSubmit}>Save Task</Button>
	{/snippet}
</Modal>
