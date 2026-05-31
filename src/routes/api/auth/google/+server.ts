import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
	// Placeholder for Google OAuth initiation
	// Will be implemented later with Google OAuth credentials
	throw redirect(302, '/login?message=Google+OAuth+not+yet+configured');
};
