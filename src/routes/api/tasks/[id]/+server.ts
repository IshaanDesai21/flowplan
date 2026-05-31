import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const task = await db.task.findFirst({
		where: { id: params.id, userId: locals.user.id },
		include: { reminders: true, attachments: true }
	});

	if (!task) return json({ error: 'Not found' }, { status: 404 });
	return json(task);
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const task = await db.task.updateMany({
		where: { id: params.id, userId: locals.user.id },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.description !== undefined && { description: data.description }),
			...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
			...(data.dueTime !== undefined && { dueTime: data.dueTime }),
			...(data.priority !== undefined && { priority: data.priority }),
			...(data.category !== undefined && { category: data.category }),
			...(data.status !== undefined && { status: data.status }),
			...(data.estimatedDuration !== undefined && { estimatedDuration: data.estimatedDuration }),
			...(data.notes !== undefined && { notes: data.notes }),
			...(data.position !== undefined && { position: data.position }),
			...(data.status === 'COMPLETED' && { completedAt: new Date() })
		}
	});

	return json(task);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	await db.task.deleteMany({ where: { id: params.id, userId: locals.user.id } });
	return json({ success: true });
};
