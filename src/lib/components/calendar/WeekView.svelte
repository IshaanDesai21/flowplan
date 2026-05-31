<script lang="ts">
	import { format, isToday, startOfDay, addHours } from 'date-fns';
	import { getWeekDays, getHours } from '$lib/utils/dates.js';

	let { currentDate, events, onEventClick, onTimeSlotClick } = $props();

	let weekDays = $derived(getWeekDays(new Date(currentDate)));
	let hours = getHours();

	function getEventsForDay(date: Date) {
		const start = startOfDay(date);
		const end = addHours(start, 24);
		return events.filter((e: any) => {
			const eStart = new Date(e.startTime);
			return eStart >= start && eStart < end;
		});
	}

	function getEventStyle(event: any) {
		const start = new Date(event.startTime);
		const end = new Date(event.endTime);
		
		const startMinutes = start.getHours() * 60 + start.getMinutes();
		const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
		
		const top = (startMinutes / (24 * 60)) * 100;
		const height = (durationMinutes / (24 * 60)) * 100;
		
		return `top: ${top}%; height: ${Math.max(height, 2)}%; background-color: ${event.color}15; border-left-color: ${event.color}; color: ${event.color}; border-left-width: 3px;`;
	}
</script>

<div class="flex flex-col h-[700px] bg-surface border border-default rounded-xl overflow-hidden relative">
	<!-- Header -->
	<div class="flex border-b border-default bg-[var(--color-surface-hover)] z-10 sticky top-0 pr-2">
		<div class="w-16 shrink-0 border-r border-default"></div>
		<div class="flex-1 grid grid-cols-7">
			{#each weekDays as day}
				<div class="py-3 text-center border-r border-default last:border-r-0 flex flex-col items-center justify-center gap-1">
					<span class="text-xs font-medium text-secondary uppercase">{format(day, 'EEE')}</span>
					<span class="flex h-8 w-8 items-center justify-center rounded-full text-lg {isToday(day) ? 'bg-[var(--color-accent)] text-white font-bold' : 'text-primary font-semibold'}">
						{format(day, 'd')}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Time Grid -->
	<div class="flex-1 overflow-y-auto flex relative">
		<!-- Time labels -->
		<div class="w-16 shrink-0 border-r border-default bg-surface relative z-10">
			{#each hours as hour}
				{#if hour > 0}
					<div class="absolute w-full text-right pr-2 text-xs text-tertiary" style="top: {(hour / 24) * 100}%">
						<span class="-translate-y-1/2 block">
							{format(new Date().setHours(hour, 0, 0, 0), 'ha')}
						</span>
					</div>
				{/if}
			{/each}
		</div>

		<!-- Days Columns -->
		<div class="flex-1 grid grid-cols-7 relative h-[1440px]">
			<!-- Horizontal grid lines -->
			{#each hours as hour}
				<div class="absolute w-full border-t border-default/50 pointer-events-none" style="top: {(hour / 24) * 100}%"></div>
			{/each}

			{#each weekDays as day}
				{@const dayEvents = getEventsForDay(day)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div 
					class="border-r border-default last:border-r-0 relative group"
					onclick={(e) => {
						// Calculate time clicked based on Y offset
						const rect = e.currentTarget.getBoundingClientRect();
						const y = e.clientY - rect.top;
						const clickedHour = Math.floor((y / rect.height) * 24);
						const clickedDate = new Date(day);
						clickedDate.setHours(clickedHour, 0, 0, 0);
						onTimeSlotClick(clickedDate);
					}}
				>
					{#each dayEvents as event}
						<button 
							class="absolute inset-x-1 rounded px-2 py-1 text-left text-xs overflow-hidden transition-shadow hover:shadow-md border"
							style={getEventStyle(event)}
							onclick={(e) => { e.stopPropagation(); onEventClick(event); }}
						>
							<div class="font-semibold truncate">{event.title}</div>
							<div class="truncate opacity-80 mt-0.5">{format(new Date(event.startTime), 'h:mma')} - {format(new Date(event.endTime), 'h:mma')}</div>
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>
