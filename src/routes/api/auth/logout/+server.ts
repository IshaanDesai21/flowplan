import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSession, deleteSessionCookie, getSessionId } from '$lib/server/auth.js';

export const POST: RequestHandler = async (event) => {
	const sessionId = getSessionId(event);
	if (sessionId) {
		await invalidateSession(sessionId);
	}
	deleteSessionCookie(event);
	return json({ success: true });
};
