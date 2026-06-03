import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const settings = await db.userSettings.findUnique({
		where: { userId: locals.user.id }
	});

	let parsedSettings = null;
	if (settings) {
		parsedSettings = {
			...settings,
			notificationPrefs: JSON.parse(settings.notificationPrefs || '{}'),
			productivityPrefs: JSON.parse(settings.productivityPrefs || '{}'),
			googleIntegration: JSON.parse(settings.googleIntegration || '{}'),
			aiSettings: JSON.parse(settings.aiSettings || '{}')
		};
	}

	return json(parsedSettings || { theme: 'dark' });
};

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const data = await request.json();
	const settings = await db.userSettings.upsert({
		where: { userId: locals.user.id },
		update: {
			...(data.theme !== undefined && { theme: data.theme }),
			...(data.notificationPrefs !== undefined && { notificationPrefs: JSON.stringify(data.notificationPrefs) }),
			...(data.productivityPrefs !== undefined && { productivityPrefs: JSON.stringify(data.productivityPrefs) }),
			...(data.googleIntegration !== undefined && { googleIntegration: JSON.stringify(data.googleIntegration) }),
			...(data.aiSettings !== undefined && { aiSettings: JSON.stringify(data.aiSettings) })
		},
		create: {
			userId: locals.user.id,
			theme: data.theme || 'dark'
		}
	});

	return json({
		...settings,
		notificationPrefs: JSON.parse(settings.notificationPrefs || '{}'),
		productivityPrefs: JSON.parse(settings.productivityPrefs || '{}'),
		googleIntegration: JSON.parse(settings.googleIntegration || '{}'),
		aiSettings: JSON.parse(settings.aiSettings || '{}')
	});
};
