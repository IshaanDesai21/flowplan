import { writable, derived } from 'svelte/store';
import { addMonths, subMonths, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import type { CalendarView } from '../types/index.js';

function createCalendarStore() {
	const currentStr = new Date().toISOString();
	
	const { subscribe, set, update } = writable({
		currentDate: currentStr,
		view: 'month' as CalendarView,
		selectedDate: currentStr
	});

	return {
		subscribe,
		set,
		update,
		setView: (view: CalendarView) => update(s => ({ ...s, view })),
		setSelectedDate: (date: Date) => update(s => ({ ...s, selectedDate: date.toISOString() })),
		next: () => update(s => {
			const current = new Date(s.currentDate);
			let nextDate: Date;
			
			if (s.view === 'month') nextDate = addMonths(current, 1);
			else if (s.view === 'week') nextDate = addDays(current, 7);
			else nextDate = addDays(current, 1);
			
			return { ...s, currentDate: nextDate.toISOString() };
		}),
		prev: () => update(s => {
			const current = new Date(s.currentDate);
			let prevDate: Date;
			
			if (s.view === 'month') prevDate = subMonths(current, 1);
			else if (s.view === 'week') prevDate = subDays(current, 7);
			else prevDate = subDays(current, 1);
			
			return { ...s, currentDate: prevDate.toISOString() };
		}),
		today: () => update(s => {
			const now = new Date().toISOString();
			return { ...s, currentDate: now, selectedDate: now };
		})
	};
}

export const calendarStore = createCalendarStore();
