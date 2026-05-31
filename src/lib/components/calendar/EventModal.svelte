<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { toasts } from '$lib/stores/toast.js';
	import { format, addHours, startOfHour } from 'date-fns';
	import { EVENT_COLORS } from '$lib/types/index.js';

	interface Props {
		isOpen: boolean;
		initialDate?: Date;
		event?: any; // null for new event
		onclose: () => void;
		onsave: () => void;
	}

	let { isOpen, initialDate, event, onclose, onsave }: Props = $props();

	let loading = $state(false);

	// Form state
	let title = $state('');
	let description = $state('');
	let startDate = $state('');
	let startTime = $state('');
	let endDate = $state('');
	let endTime = $state('');
	let color = $state('#6366f1');

	$effect(() => {
		if (isOpen) {
			if (event) {
				title = event.title;
				description = event.description || '';
				startDate = format(new Date(event.startTime), 'yyyy-MM-dd');
				startTime = format(new Date(event.startTime), 'HH:mm');
				endDate = format(new Date(event.endTime), 'yyyy-MM-dd');
				endTime = format(new Date(event.endTime), 'HH:mm');
				color = event.color;
			} else {
				const baseDate = initialDate || new Date();
				const start = startOfHour(addHours(baseDate, 1));
				const end = addHours(start, 1);
				
				title = '';
				description = '';
				startDate = format(start, 'yyyy-MM-dd');
				startTime = format(start, 'HH:mm');
				endDate = format(end, 'yyyy-MM-dd');
				endTime = format(end, 'HH:mm');
				color = '#6366f1';
			}
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		const startDateTime = new Date(`${startDate}T${startTime}`);
		const endDateTime = new Date(`${endDate}T${endTime}`);

		if (endDateTime <= startDateTime) {
			toasts.error('End time must be after start time');
			loading = false;
			return;
		}

		try {
			const payload = {
				title,
				description,
				startTime: startDateTime.toISOString(),
				endTime: endDateTime.toISOString(),
				color
			};

			const url = event ? `/api/events/${event.id}` : '/api/events';
			const method = event ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				toasts.success(`Event ${event ? 'updated' : 'created'} successfully`);
				onsave();
				onclose();
			} else {
				toasts.error('Failed to save event');
			}
		} catch {
			toasts.error('Network error');
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!event || !confirm('Are you sure you want to delete this event?')) return;
		
		loading = true;
		try {
			const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
			if (res.ok) {
				toasts.success('Event deleted');
				onsave();
				onclose();
			} else {
				toasts.error('Failed to delete event');
			}
		} catch {
			toasts.error('Network error');
		} finally {
			loading = false;
		}
	}
</script>

<Modal
	{isOpen}
	{onclose}
	title={event ? 'Edit Event' : 'New Event'}
	size="md"
>
	<form id="event-form" onsubmit={handleSubmit} class="flex flex-col gap-4">
		<Input label="Event Title" bind:value={title} placeholder="e.g., Team Sync" required />

		<div class="grid grid-cols-2 gap-4">
			<Input label="Start Date" type="date" bind:value={startDate} required />
			<Input label="Start Time" type="time" bind:value={startTime} required />
		</div>

		<div class="grid grid-cols-2 gap-4">
			<Input label="End Date" type="date" bind:value={endDate} required />
			<Input label="End Time" type="time" bind:value={endTime} required />
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-secondary">Color</label>
			<div class="flex gap-2 flex-wrap">
				{#each EVENT_COLORS as c}
					<button
						type="button"
						class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
						style="background-color: {c.hex}; border-color: {color === c.hex ? 'var(--color-text)' : 'transparent'}"
						onclick={() => color = c.hex}
						aria-label={c.label}
					></button>
				{/each}
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-secondary">Description</label>
			<textarea
				class="flex w-full rounded-md border border-default bg-transparent px-3 py-2 text-sm placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] text-primary resize-y min-h-[80px]"
				placeholder="Add notes, links, or agenda..."
				bind:value={description}
			></textarea>
		</div>
	</form>

	{#snippet footer()}
		<div class="flex w-full justify-between">
			{#if event}
				<Button variant="danger" onclick={handleDelete} disabled={loading}>Delete</Button>
			{:else}
				<div></div>
			{/if}
			<div class="flex gap-3">
				<Button variant="outline" onclick={onclose} disabled={loading}>Cancel</Button>
				<Button variant="primary" type="submit" form="event-form" disabled={loading}>
					{loading ? 'Saving...' : 'Save Event'}
				</Button>
			</div>
		</div>
	{/snippet}
</Modal>
