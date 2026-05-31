<script lang="ts">
	import { format, addMonths, subMonths, startOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { getMonthDays, formatTime } from '$lib/utils/dates.js';
	import EventModal from '$lib/components/calendar/EventModal.svelte';

	let { data } = $props();

	let currentDate = $state(new Date(data.baseDate));
	let view = $state('month');
	let isEventModalOpen = $state(false);
	let selectedDate = $state<Date>(new Date());
	let selectedEvent = $state<any>(null);
	
	// Ensure events are properly mapped back to Date objects
	let events = $derived(data.events.map((e: any) => ({
		...e,
		startTime: new Date(e.startTime),
		endTime: new Date(e.endTime)
	})));

	const views = [
		{ id: 'month', label: 'Month' },
		{ id: 'week', label: 'Week' },
		{ id: 'day', label: 'Day' },
		{ id: 'agenda', label: 'Agenda' }
	];

	function next() {
		currentDate = view === 'month' ? addMonths(currentDate, 1) : addDays(currentDate, view === 'week' ? 7 : 1);
	}

	function prev() {
		currentDate = view === 'month' ? subMonths(currentDate, 1) : subDays(currentDate, view === 'week' ? 7 : 1);
	}

	function today() {
		currentDate = new Date();
	}

	function getEventsForDay(date: Date) {
		return events.filter((e: any) => isSameDay(e.startTime, date));
	}

	function openNewEventModal(date: Date) {
		selectedDate = date;
		selectedEvent = null;
		isEventModalOpen = true;
	}

	function openEditEventModal(event: any, e: MouseEvent) {
		e.stopPropagation();
		selectedEvent = event;
		selectedDate = event.startTime;
		isEventModalOpen = true;
	}

	// Month view specific
	let monthDays = $derived(getMonthDays(currentDate));
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Week view specific
	let weekStart = $derived(startOfWeek(currentDate));
	let currentWeekDays = $derived(Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)));
	const hours = Array.from({ length: 24 }).map((_, i) => i);
</script>

<svelte:head>
	<title>Calendar — FlowPlan</title>
</svelte:head>

<div class="calendar-page h-full flex flex-col">
	<!-- Calendar Header -->
	<header class="calendar-header">
		<div class="header-left">
			<Button variant="outline" size="sm" onclick={today}>Today</Button>
			<div class="nav-buttons">
				<button class="nav-btn" onclick={prev}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
				</button>
				<button class="nav-btn" onclick={next}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
				</button>
			</div>
			<h2 class="current-date">
				{#if view === 'month'}
					{format(currentDate, 'MMMM yyyy')}
				{:else if view === 'week'}
					{format(currentWeekDays[0], 'MMM d')} – {format(currentWeekDays[6], 'MMM d, yyyy')}
				{:else}
					{format(currentDate, 'MMMM d, yyyy')}
				{/if}
			</h2>
		</div>

		<div class="header-right">
			<Tabs tabs={views} activeId={view} onchange={(v) => view = v} class="view-tabs" />
			<Button variant="primary" size="sm" onclick={() => openNewEventModal(new Date())}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
					<path d="M12 5v14M5 12h14" />
				</svg>
				New Event
			</Button>
		</div>
	</header>

	<!-- Calendar Body -->
	<div class="calendar-body">
		{#if view === 'month'}
			<div class="month-view">
				<div class="days-header">
					{#each weekDays as day}
						<div class="day-name">{day}</div>
					{/each}
				</div>
				<div class="days-grid">
					{#each monthDays as day}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div 
							class="day-cell" 
							class:other-month={!isSameMonth(day, currentDate)}
							class:is-today={isToday(day)}
							onclick={() => openNewEventModal(day)}
						>
							<div class="day-number">{format(day, 'd')}</div>
							<div class="day-events">
								{#each getEventsForDay(day).slice(0, 3) as event}
									<div 
										class="event-pill" 
										style="background-color: {event.color}; color: #fff"
										title="{formatTime(event.startTime)} - {event.title}"
										onclick={(e) => openEditEventModal(event, e)}
									>
										{formatTime(event.startTime)} {event.title}
									</div>
								{/each}
								{#if getEventsForDay(day).length > 3}
									<div class="event-more">+{getEventsForDay(day).length - 3} more</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if view === 'week'}
			<div class="week-view">
				<div class="week-header">
					<div class="time-col-header"></div>
					{#each currentWeekDays as day}
						<div class="week-day-header" class:is-today={isToday(day)}>
							<span class="wd-name">{format(day, 'EEE')}</span>
							<span class="wd-num">{format(day, 'd')}</span>
						</div>
					{/each}
				</div>
				<div class="week-grid-scroll">
					<div class="week-grid">
						<div class="time-col">
							{#each hours as hour}
								<div class="time-slot">{hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}</div>
							{/each}
						</div>
						{#each currentWeekDays as day}
							<div class="day-col" onclick={() => openNewEventModal(day)}>
								{#each hours as hour}
									<div class="hour-cell border-b border-default"></div>
								{/each}
								
								<!-- Absolute positioned events -->
								{#each getEventsForDay(day) as event}
									<!-- Simple top/height calculation based on hours. minutes -->
									{@const top = (event.startTime.getHours() * 60 + event.startTime.getMinutes()) / (24 * 60) * 100}
									{@const duration = (event.endTime.getTime() - event.startTime.getTime()) / 60000}
									{@const height = (duration / (24 * 60)) * 100}
									
									<div 
										class="absolute-event"
										style="top: {top}%; height: {Math.max(height, 2)}%; background-color: color-mix(in srgb, {event.color} 15%, transparent); border-left: 3px solid {event.color}; color: {event.color}"
										onclick={(e) => openEditEventModal(event, e)}
									>
										<div class="abs-ev-title">{event.title}</div>
										<div class="abs-ev-time">{formatTime(event.startTime)}</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center h-full text-secondary">
				<p>{view} view is under construction</p>
			</div>
		{/if}
	</div>
</div>

<EventModal 
	isOpen={isEventModalOpen} 
	initialDate={selectedDate}
	event={selectedEvent}
	onclose={() => { isEventModalOpen = false; }} 
	onsave={() => { 
		// Will implement reload
		window.location.reload(); 
	}} 
/>

<style>
	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
		flex-wrap: wrap;
		gap: 1rem;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.nav-buttons {
		display: flex;
		align-items: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	.nav-btn {
		background: none;
		border: none;
		padding: 0.375rem 0.5rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background var(--transition-fast);
	}
	.nav-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}
	.current-date {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
		min-width: 200px;
	}
	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.calendar-body {
		flex: 1;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-top: 1rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* Month View */
	.month-view {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.days-header {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface-hover);
	}
	.day-name {
		padding: 0.5rem;
		text-align: center;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
	}
	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		grid-auto-rows: minmax(100px, 1fr);
		flex: 1;
	}
	.day-cell {
		border-right: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		padding: 0.25rem;
		cursor: pointer;
		transition: background var(--transition-fast);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.day-cell:nth-child(7n) { border-right: none; }
	.day-cell:hover { background: var(--color-surface-hover); }
	.other-month { opacity: 0.4; background: color-mix(in srgb, var(--color-bg) 50%, transparent); }
	
	.day-number {
		text-align: center;
		font-size: 0.85rem;
		font-weight: 500;
		margin-bottom: 2px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin-left: auto;
		margin-right: auto;
	}
	.is-today .day-number {
		background: var(--color-accent);
		color: white;
	}

	.day-events {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		overflow: hidden;
	}
	.event-pill {
		font-size: 0.7rem;
		padding: 2px 4px;
		border-radius: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 500;
		cursor: pointer;
	}
	.event-pill:hover { filter: brightness(0.9); }
	.event-more {
		font-size: 0.7rem;
		color: var(--color-text-tertiary);
		text-align: center;
		font-weight: 600;
	}

	/* Week View */
	.week-view {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.week-header {
		display: flex;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface-hover);
	}
	.time-col-header {
		width: 60px;
		flex-shrink: 0;
		border-right: 1px solid var(--color-border);
	}
	.week-day-header {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		border-right: 1px solid var(--color-border);
	}
	.week-day-header:last-child { border-right: none; }
	.wd-name { font-size: 0.75rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600;}
	.wd-num { font-size: 1.25rem; font-weight: 500; color: var(--color-text); }
	.week-day-header.is-today .wd-num {
		color: var(--color-accent);
		font-weight: 700;
	}

	.week-grid-scroll {
		flex: 1;
		overflow-y: auto;
	}
	.week-grid {
		display: flex;
		position: relative;
		height: 1440px; /* 60px per hour * 24 */
	}
	.time-col {
		width: 60px;
		flex-shrink: 0;
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
	}
	.time-slot {
		height: 60px;
		font-size: 0.7rem;
		color: var(--color-text-tertiary);
		text-align: right;
		padding-right: 0.5rem;
		transform: translateY(-50%);
	}
	.day-col {
		flex: 1;
		border-right: 1px solid var(--color-border);
		position: relative;
		cursor: crosshair;
	}
	.day-col:last-child { border-right: none; }
	.hour-cell {
		height: 60px;
		border-bottom: 1px solid var(--color-border-light);
	}
	.absolute-event {
		position: absolute;
		left: 2px;
		right: 4px;
		border-radius: 4px;
		padding: 2px 4px;
		overflow: hidden;
		cursor: pointer;
		z-index: 10;
		box-shadow: var(--shadow-sm);
		transition: filter var(--transition-fast);
	}
	.absolute-event:hover {
		filter: brightness(1.1);
		z-index: 20;
	}
	.abs-ev-title {
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.abs-ev-time {
		font-size: 0.65rem;
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.header-right .view-tabs { display: none; }
		.day-name { font-size: 0.6rem; padding: 0.25rem; }
		.event-pill { font-size: 0.6rem; padding: 1px; }
	}
</style>
