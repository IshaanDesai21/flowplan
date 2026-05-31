import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const event = await db.calendarEvent.updateMany({
		where: { id: params.id, userId: locals.user.id },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.description !== undefined && { description: data.description }),
			...(data.startTime !== undefined && { startTime: new Date(data.startTime) }),
			...(data.endTime !== undefined && { endTime: new Date(data.endTime) }),
			...(data.location !== undefined && { location: data.location }),
			...(data.priority !== undefined && { priority: data.priority }),
			...(data.tags !== undefined && { tags: data.tags }),
			...(data.status !== undefined && { status: data.status }),
			...(data.color !== undefined && { color: data.color }),
			...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
			...(data.recurrenceRule !== undefined && { recurrenceRule: data.recurrenceRule }),
			...(data.isTimeBlock !== undefined && { isTimeBlock: data.isTimeBlock }),
			...(data.notes !== undefined && { notes: data.notes })
		}
	});

	return json(event);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	await db.calendarEvent.deleteMany({ where: { id: params.id, userId: locals.user.id } });
	return json({ success: true });
};
