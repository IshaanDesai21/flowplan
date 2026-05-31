<script lang="ts">
	import { format } from 'date-fns';
	import { invalidateAll } from '$app/navigation';
	import { calendarStore } from '$lib/stores/calendar.js';
	import { toasts } from '$lib/stores/toast.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import MonthView from '$lib/components/calendar/MonthView.svelte';
	import WeekView from '$lib/components/calendar/WeekView.svelte';
	import EventForm from '$lib/components/calendar/EventForm.svelte';

	let { data } = $props();

	let isFormOpen = $state(false);
	let selectedEvent = $state<any>(null);
	let initialDate = $state<Date | null>(null);

	const viewTabs = [
		{ id: 'month', label: 'Month' },
		{ id: 'week', label: 'Week' }
	];

	function handleDateClick(date: Date) {
		calendarStore.setView('week');
		calendarStore.setSelectedDate(date);
		// Switch to week view starting on this date (handled by derived state in week view if we supported it)
		// For simplicity, just set current date.
		calendarStore.set({ ...$calendarStore, currentDate: date.toISOString(), view: 'week' });
	}

	function handleEventClick(event: any) {
		selectedEvent = event;
		initialDate = null;
		isFormOpen = true;
	}

	function handleTimeSlotClick(date: Date) {
		selectedEvent = null;
		initialDate = date;
		isFormOpen = true;
	}

	function openNewEventForm() {
		selectedEvent = null;
		initialDate = new Date(); // now
		initialDate.setMinutes(0, 0, 0); // round to hour
		isFormOpen = true;
	}

	async function handleSaveEvent(eventData: any) {
		try {
			const method = eventData.id ? 'PUT' : 'POST';
			const url = eventData.id ? `/api/events/${eventData.id}` : '/api/events';
			
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(eventData)
			});

			if (!res.ok) throw new Error('Failed to save event');

			toasts.success(eventData.id ? 'Event updated' : 'Event created');
			isFormOpen = false;
			await invalidateAll(); // Reload data
		} catch (error) {
			toasts.error('An error occurred while saving the event');
		}
	}
	
	let monthLabel = $derived(format(new Date($calendarStore.currentDate), 'MMMM yyyy'));
</script>

<svelte:head>
	<title>Calendar | FlowPlan</title>
</svelte:head>

<div class="flex flex-col h-full space-y-4">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold tracking-tight text-primary w-48">{monthLabel}</h1>
			<div class="flex items-center gap-1">
				<Button variant="outline" size="sm" onclick={() => calendarStore.prev()}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
				</Button>
				<Button variant="outline" size="sm" onclick={() => calendarStore.today()}>Today</Button>
				<Button variant="outline" size="sm" onclick={() => calendarStore.next()}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
				</Button>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<Tabs 
				tabs={viewTabs} 
				activeId={$calendarStore.view} 
				onchange={(id) => calendarStore.setView(id as any)} 
			/>
			<Button onclick={openNewEventForm} class="hidden sm:flex">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
				New Event
			</Button>
		</div>
	</div>

	<!-- Calendar View -->
	<div class="flex-1 min-h-[500px]">
		{#if $calendarStore.view === 'month'}
			<MonthView 
				currentDate={$calendarStore.currentDate} 
				events={data.events}
				onDateClick={handleDateClick}
				onEventClick={handleEventClick}
			/>
		{:else if $calendarStore.view === 'week'}
			<WeekView 
				currentDate={$calendarStore.currentDate} 
				events={data.events}
				onEventClick={handleEventClick}
				onTimeSlotClick={handleTimeSlotClick}
			/>
		{/if}
	</div>
</div>

<EventForm 
	isOpen={isFormOpen}
	event={selectedEvent}
	initialDate={initialDate}
	onclose={() => isFormOpen = false}
	onsave={handleSaveEvent}
/>
