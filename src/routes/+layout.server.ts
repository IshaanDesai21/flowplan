import type { LayoutServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';

export const load: LayoutServerLoad = async ({ locals }) => {
	let settings = null;
	if (locals.user) {
		try {
			settings = await db.userSettings.findUnique({ where: { userId: locals.user.id } });
		} catch (e) {
			console.error('Layout: failed to load user settings, using defaults:', e);
		}
	}

	return {
		user: locals.user,
		settings: settings ? {
			...settings,
			notificationPrefs: JSON.parse(settings.notificationPrefs || '{}'),
			productivityPrefs: JSON.parse(settings.productivityPrefs || '{}'),
			googleIntegration: JSON.parse(settings.googleIntegration || '{}'),
			aiSettings: JSON.parse(settings.aiSettings || '{}')
		} : null
	};
};
