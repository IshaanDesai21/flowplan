import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		const { theme } = await request.json();

		const settings = await db.userSettings.upsert({
			where: { userId: locals.user.id },
			update: { theme },
			create: {
				userId: locals.user.id,
				theme
			}
		});

		return json({ settings });
	} catch (error) {
		console.error('Settings update error:', error);
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
};
