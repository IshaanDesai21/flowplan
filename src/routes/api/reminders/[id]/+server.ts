import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	await db.reminder.updateMany({
		where: { id: params.id, userId: locals.user.id },
		data: {
			...(data.isCompleted !== undefined && { isCompleted: data.isCompleted }),
			...(data.title !== undefined && { title: data.title }),
			...(data.triggerAt !== undefined && { triggerAt: new Date(data.triggerAt) })
		}
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	await db.reminder.deleteMany({ where: { id: params.id, userId: locals.user.id } });
	return json({ success: true });
};
