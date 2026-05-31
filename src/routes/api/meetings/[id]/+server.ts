import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	await db.meeting.updateMany({
		where: { id: params.id, userId: locals.user.id },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.startTime !== undefined && { startTime: new Date(data.startTime) }),
			...(data.endTime !== undefined && { endTime: new Date(data.endTime) }),
			...(data.participants !== undefined && { participants: data.participants }),
			...(data.notes !== undefined && { notes: data.notes }),
			...(data.actionItems !== undefined && { actionItems: data.actionItems }),
			...(data.location !== undefined && { location: data.location })
		}
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	await db.meeting.deleteMany({ where: { id: params.id, userId: locals.user.id } });
	return json({ success: true });
};
