import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const checklist = await db.checklist.updateMany({
		where: { id: params.id, userId: locals.user.id },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.category !== undefined && { category: data.category }),
			...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null })
		}
	});

	return json(checklist);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	await db.checklist.deleteMany({ where: { id: params.id, userId: locals.user.id } });
	return json({ success: true });
};
