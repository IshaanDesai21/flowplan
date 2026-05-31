<script lang="ts">
	import { format } from 'date-fns';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { EVENT_COLORS } from '$lib/types/index.js';

	let { isOpen, event = null, initialDate = null, onclose, onsave } = $props();

	let title = $state('');
	let description = $state('');
	let dateStr = $state('');
	let startTimeStr = $state('09:00');
	let endTimeStr = $state('10:00');
	let location = $state('');
	let color = $state(EVENT_COLORS[0].hex);
	let isTimeBlock = $state(false);

	$effect(() => {
		if (isOpen) {
			if (event) {
				title = event.title;
				description = event.description || '';
				location = event.location || '';
				color = event.color || EVENT_COLORS[0].hex;
				isTimeBlock = event.isTimeBlock || false;
				
				const start = new Date(event.startTime);
				const end = new Date(event.endTime);
				dateStr = format(start, 'yyyy-MM-dd');
				startTimeStr = format(start, 'HH:mm');
				endTimeStr = format(end, 'HH:mm');
			} else if (initialDate) {
				const d = new Date(initialDate);
				dateStr = format(d, 'yyyy-MM-dd');
				startTimeStr = format(d, 'HH:mm');
				// End time 1 hour later
				const dEnd = new Date(d.getTime() + 60 * 60 * 1000);
				endTimeStr = format(dEnd, 'HH:mm');
				
				title = '';
				description = '';
				location = '';
				color = EVENT_COLORS[0].hex;
				isTimeBlock = false;
			}
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		
		// Parse date and times
		const [year, month, day] = dateStr.split('-').map(Number);
		const [startH, startM] = startTimeStr.split(':').map(Number);
		const [endH, endM] = endTimeStr.split(':').map(Number);
		
		const startTime = new Date(year, month - 1, day, startH, startM);
		const endTime = new Date(year, month - 1, day, endH, endM);

		onsave({
			id: event?.id,
			title,
			description,
			startTime: startTime.toISOString(),
			endTime: endTime.toISOString(),
			location,
			color,
			isTimeBlock
		});
	}
</script>

<Modal {isOpen} {onclose} title={event ? 'Edit Event' : 'New Event'}>
	<form id="event-form" onsubmit={handleSubmit} class="space-y-4">
		<Input 
			name="title" 
			label="Event Title" 
			placeholder="E.g., Team Sync" 
			bind:value={title} 
			required 
		/>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Input 
				name="date" 
				type="date" 
				label="Date" 
				bind:value={dateStr} 
				required 
			/>
			<div class="grid grid-cols-2 gap-2">
				<Input 
					name="startTime" 
					type="time" 
					label="Start" 
					bind:value={startTimeStr} 
					required 
				/>
				<Input 
					name="endTime" 
					type="time" 
					label="End" 
					bind:value={endTimeStr} 
					required 
				/>
			</div>
		</div>

		<Input 
			name="location" 
			label="Location" 
			placeholder="Room, Zoom link, or address" 
			bind:value={location} 
		/>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-secondary">Description</label>
			<textarea 
				class="flex w-full rounded-md border border-default bg-transparent px-3 py-2 text-sm placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 text-primary focus-visible:ring-[var(--color-accent)] min-h-[80px] resize-y"
				placeholder="Add details, agenda, or notes..."
				bind:value={description}
			></textarea>
		</div>

		<div class="flex items-center gap-4 py-2 border-t border-default mt-4">
			<div class="flex-1">
				<label class="text-sm font-medium text-secondary block mb-2">Color Label</label>
				<div class="flex flex-wrap gap-2">
					{#each EVENT_COLORS as c}
						<button 
							type="button"
							class="w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface"
							style="background-color: {c.hex};"
							onclick={() => color = c.hex}
							title={c.label}
							aria-label="Select {c.label} color"
						>
							{#if color === c.hex}
								<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>
			
			<div class="flex items-center gap-2 pt-6">
				<input type="checkbox" id="timeBlock" bind:checked={isTimeBlock} class="rounded border-default text-[var(--color-accent)] focus:ring-[var(--color-accent)] bg-transparent" />
				<label for="timeBlock" class="text-sm text-primary font-medium cursor-pointer">Time Block</label>
			</div>
		</div>
	</form>

	{#snippet footer()}
		<Button variant="ghost" onclick={onclose}>Cancel</Button>
		<Button type="submit" onclick={handleSubmit}>Save Event</Button>
	{/snippet}
</Modal>
