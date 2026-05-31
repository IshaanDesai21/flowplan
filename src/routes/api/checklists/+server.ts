import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const checklists = await db.checklist.findMany({
		where: { userId: locals.user.id },
		include: { items: { orderBy: { position: 'asc' } } },
		orderBy: { updatedAt: 'desc' }
	});

	return json(checklists);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const checklist = await db.checklist.create({
		data: {
			userId: locals.user.id,
			title: data.title,
			category: data.category || null,
			dueDate: data.dueDate ? new Date(data.dueDate) : null,
			items: data.items?.length
				? {
						create: data.items.map((item: { title: string }, i: number) => ({
							title: item.title,
							position: i
						}))
					}
				: undefined
		},
		include: { items: true }
	});

	return json(checklist, { status: 201 });
};
