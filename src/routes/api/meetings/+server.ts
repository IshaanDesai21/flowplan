import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const meetings = await db.meeting.findMany({
		where: { userId: locals.user.id },
		orderBy: { startTime: 'desc' }
	});

	return json(meetings.map(m => ({ ...m, participants: JSON.parse(m.participants || '[]'), actionItems: m.actionItems ? JSON.parse(m.actionItems) : null })));
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const meeting = await db.meeting.create({
		data: {
			userId: locals.user.id,
			title: data.title,
			startTime: new Date(data.startTime),
			endTime: new Date(data.endTime),
			participants: JSON.stringify(data.participants || []),
			notes: data.notes || null,
			actionItems: data.actionItems ? JSON.stringify(data.actionItems) : null,
			location: data.location || null
		}
	});

	return json(meeting, { status: 201 });
};
