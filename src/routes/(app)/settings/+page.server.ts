import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;

	const settings = await db.userSettings.findUnique({
		where: { userId: user.id }
	});

	return {
		settings: settings ? {
			...settings,
			notificationPrefs: JSON.parse(settings.notificationPrefs || '{}'),
			productivityPrefs: JSON.parse(settings.productivityPrefs || '{}'),
			googleIntegration: JSON.parse(settings.googleIntegration || '{}'),
			aiSettings: JSON.parse(settings.aiSettings || '{}')
		} : null
	};
};
