import { db } from '$lib/server/db.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	// For now, fetch all events for the user. In a real app, this should be scoped by month/date range.
	const events = await db.calendarEvent.findMany({
		where: { userId },
		orderBy: { startTime: 'asc' }
	});

	return {
		events
	};
};
