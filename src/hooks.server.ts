import type { Handle } from '@sveltejs/kit';
import { getSessionId, validateSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = getSessionId(event);

	if (sessionId) {
		const result = await validateSession(sessionId);
		if (result) {
			event.locals.user = result.user;
			event.locals.session = result.session;
		} else {
			event.locals.user = null;
			event.locals.session = null;
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
