import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const reminders = await db.reminder.findMany({
		where: { userId: locals.user.id },
		orderBy: { triggerAt: 'asc' }
	});

	return json(reminders);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const reminder = await db.reminder.create({
		data: {
			userId: locals.user.id,
			title: data.title,
			message: data.message || null,
			triggerAt: new Date(data.triggerAt),
			isRecurring: data.isRecurring || false,
			recurrenceRule: data.recurrenceRule || null,
			type: data.type || 'general',
			method: data.method || 'in_app',
			taskId: data.taskId || null,
			eventId: data.eventId || null,
			checklistId: data.checklistId || null
		}
	});

	return json(reminder, { status: 201 });
};
