import {
	format,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	addDays,
	addWeeks,
	addMonths,
	isSameDay,
	isSameMonth,
	isToday,
	isPast,
	isFuture,
	differenceInMinutes,
	differenceInHours,
	differenceInDays,
	parseISO,
	setHours,
	setMinutes
} from 'date-fns';

export {
	format,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	addDays,
	addWeeks,
	addMonths,
	isSameDay,
	isSameMonth,
	isToday,
	isPast,
	isFuture,
	differenceInMinutes,
	differenceInHours,
	differenceInDays,
	parseISO,
	setHours,
	setMinutes
};

export function formatTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return format(d, 'h:mm a');
}

export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return format(d, 'MMM d');
}

export function formatRelative(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffDays = differenceInDays(d, now);
	const diffHours = differenceInHours(d, now);
	const diffMins = differenceInMinutes(d, now);

	if (Math.abs(diffMins) < 1) return 'just now';
	if (diffMins > 0 && diffMins < 60) return `in ${diffMins}m`;
	if (diffMins < 0 && diffMins > -60) return `${Math.abs(diffMins)}m ago`;
	if (diffHours > 0 && diffHours < 24) return `in ${diffHours}h`;
	if (diffHours < 0 && diffHours > -24) return `${Math.abs(diffHours)}h ago`;
	if (diffDays === 0) return 'today';
	if (diffDays === 1) return 'tomorrow';
	if (diffDays === -1) return 'yesterday';
	if (diffDays > 1 && diffDays < 7) return `in ${diffDays} days`;
	if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
	return formatDate(d);
}

export function getMonthDays(date: Date): Date[] {
	const start = startOfWeek(startOfMonth(date));
	const end = endOfWeek(endOfMonth(date));
	return eachDayOfInterval({ start, end });
}

export function getWeekDays(date: Date): Date[] {
	const start = startOfWeek(date);
	return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getHours(): number[] {
	return Array.from({ length: 24 }, (_, i) => i);
}

export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes}m`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getEventPosition(
	startTime: Date,
	endTime: Date
): { top: number; height: number } {
	const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
	const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
	const duration = endMinutes - startMinutes;

	return {
		top: (startMinutes / 1440) * 100,
		height: Math.max((duration / 1440) * 100, 1.5)
	};
}
