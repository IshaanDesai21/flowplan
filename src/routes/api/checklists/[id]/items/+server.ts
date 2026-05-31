import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const POST: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	// Verify ownership
	const checklist = await db.checklist.findFirst({
		where: { id: params.id, userId: locals.user.id }
	});
	if (!checklist) return json({ error: 'Not found' }, { status: 404 });

	const data = await request.json();
	const item = await db.checklistItem.create({
		data: {
			checklistId: params.id,
			title: data.title,
			parentId: data.parentId || null,
			position: data.position || 0
		}
	});

	return json(item, { status: 201 });
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	// data.itemId is the checklist item to update
	if (!data.itemId) return json({ error: 'itemId required' }, { status: 400 });

	const item = await db.checklistItem.update({
		where: { id: data.itemId },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.isCompleted !== undefined && { isCompleted: data.isCompleted }),
			...(data.position !== undefined && { position: data.position })
		}
	});

	return json(item);
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	if (!data.itemId) return json({ error: 'itemId required' }, { status: 400 });

	await db.checklistItem.delete({ where: { id: data.itemId } });
	return json({ success: true });
};
