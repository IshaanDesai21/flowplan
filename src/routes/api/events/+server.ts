import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const start = url.searchParams.get('start');
	const end = url.searchParams.get('end');

	const where: Record<string, unknown> = { userId: locals.user.id };
	if (start && end) {
		where.startTime = { gte: new Date(start) };
		where.endTime = { lte: new Date(end) };
	}

	const events = await db.calendarEvent.findMany({
		where,
		orderBy: { startTime: 'asc' }
	});

	return json(events.map(e => ({ ...e, tags: JSON.parse(e.tags || '[]') })));
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const event = await db.calendarEvent.create({
		data: {
			userId: locals.user.id,
			title: data.title,
			description: data.description || null,
			startTime: new Date(data.startTime),
			endTime: new Date(data.endTime),
			location: data.location || null,
			priority: data.priority || 'MEDIUM',
			tags: JSON.stringify(data.tags || []),
			status: data.status || 'confirmed',
			color: data.color || '#6366f1',
			isRecurring: data.isRecurring || false,
			recurrenceRule: data.recurrenceRule || null,
			isTimeBlock: data.isTimeBlock || false,
			notes: data.notes || null
		}
	});

	return json(event, { status: 201 });
};
