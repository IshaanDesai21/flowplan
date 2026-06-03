import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

// PUT /api/checklists/items/[itemId] - toggle or update an item
export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const item = await db.checklistItem.update({
		where: { id: params.itemId },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.isCompleted !== undefined && { isCompleted: data.isCompleted }),
			...(data.position !== undefined && { position: data.position })
		}
	});

	return json(item);
};

// DELETE /api/checklists/items/[itemId]
export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	await db.checklistItem.delete({ where: { id: params.itemId } });
	return json({ success: true });
};
