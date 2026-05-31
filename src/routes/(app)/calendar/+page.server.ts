import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db.js';
import { startOfMonth, endOfMonth, subDays, addDays } from 'date-fns';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(302, '/login');

	const dateParam = url.searchParams.get('date');
	const baseDate = dateParam ? new Date(dateParam) : new Date();

	// Fetch events for current month +/- 1 week to cover overlapping weeks
	const start = subDays(startOfMonth(baseDate), 7);
	const end = addDays(endOfMonth(baseDate), 7);

	const events = await db.calendarEvent.findMany({
		where: {
			userId: locals.user.id,
			startTime: { gte: start },
			endTime: { lte: end }
		},
		orderBy: { startTime: 'asc' }
	});

	// Transform dates to strings for transfer
	const serializedEvents = events.map(e => ({
		...e,
		startTime: e.startTime.toISOString(),
		endTime: e.endTime.toISOString()
	}));

	return { events: serializedEvents, baseDate: baseDate.toISOString() };
};
