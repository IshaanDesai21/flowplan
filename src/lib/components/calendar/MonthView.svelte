<script lang="ts">
	import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
	import { getMonthDays, getWeekDays } from '$lib/utils/dates.js';

	let { currentDate, events, onDateClick, onEventClick } = $props();

	// Derived
	let days = $derived(getMonthDays(new Date(currentDate)));
	let currentMonth = $derived(new Date(currentDate));

	function getEventsForDay(date: Date) {
		return events.filter((e: any) => isSameDay(new Date(e.startTime), date));
	}
</script>

<div class="flex flex-col h-full bg-surface border border-default rounded-xl overflow-hidden">
	<!-- Days of week header -->
	<div class="grid grid-cols-7 border-b border-default bg-[var(--color-surface-hover)]">
		{#each getWeekDays(new Date()) as day}
			<div class="py-2 text-center text-xs font-semibold tracking-wide text-secondary uppercase">
				{format(day, 'EEE')}
			</div>
		{/each}
	</div>

	<!-- Calendar grid -->
	<div class="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
		{#each days as day, i}
			{@const dayEvents = getEventsForDay(day)}
			{@const isCurrentMonth = isSameMonth(day, currentMonth)}
			{@const today = isToday(day)}
			
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div 
				class="min-h-[100px] border-b border-r border-default p-1 sm:p-2 transition-colors cursor-pointer hover:bg-[var(--color-surface-hover)] relative
					{isCurrentMonth ? 'bg-surface' : 'bg-page'}
					{i % 7 === 6 ? 'border-r-0' : ''}"
				onclick={() => onDateClick(day)}
			>
				<div class="flex items-center justify-between mb-1">
					<span 
						class="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium
							{today ? 'bg-[var(--color-accent)] text-white' : isCurrentMonth ? 'text-primary' : 'text-tertiary'}"
					>
						{format(day, 'd')}
					</span>
					
					{#if dayEvents.length > 0}
						<span class="text-[10px] text-tertiary font-medium sm:hidden">{dayEvents.length}</span>
					{/if}
				</div>
				
				<div class="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
					{#each dayEvents.slice(0, 4) as event}
						<button 
							class="w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] sm:text-xs font-medium transition-opacity hover:opacity-80"
							style="background-color: {event.color}20; color: {event.color}; border-left: 2px solid {event.color}"
							onclick={(e) => { e.stopPropagation(); onEventClick(event); }}
						>
							{format(new Date(event.startTime), 'h:mma').toLowerCase()} {event.title}
						</button>
					{/each}
					{#if dayEvents.length > 4}
						<div class="text-[10px] text-secondary pl-1 font-medium">+{dayEvents.length - 4} more</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
