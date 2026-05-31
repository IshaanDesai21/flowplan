import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const settings = await db.userSettings.findUnique({
		where: { userId: locals.user.id }
	});

	return json(settings || { theme: 'dark' });
};

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const settings = await db.userSettings.upsert({
		where: { userId: locals.user.id },
		update: {
			...(data.theme !== undefined && { theme: data.theme }),
			...(data.notificationPrefs !== undefined && { notificationPrefs: data.notificationPrefs }),
			...(data.productivityPrefs !== undefined && { productivityPrefs: data.productivityPrefs }),
			...(data.googleIntegration !== undefined && { googleIntegration: data.googleIntegration }),
			...(data.aiSettings !== undefined && { aiSettings: data.aiSettings })
		},
		create: {
			userId: locals.user.id,
			theme: data.theme || 'dark'
		}
	});

	return json(settings);
};
