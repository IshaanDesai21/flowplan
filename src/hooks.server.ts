import type { Handle } from '@sveltejs/kit';
import { getSessionId, validateSession } from '$lib/server/auth.js';
import { seedDemoUser } from '$lib/server/demo.js';

let hasSeededDemoUser = false;

export const handle: Handle = async ({ event, resolve }) => {
	if (!hasSeededDemoUser) {
		hasSeededDemoUser = true;
		seedDemoUser().catch(console.error);
	}

	const sessionId = getSessionId(event);

	if (sessionId) {
		try {
			const result = await validateSession(sessionId);
			if (result) {
				event.locals.user = result.user;
				event.locals.session = result.session;
			} else {
				event.locals.user = null;
				event.locals.session = null;
			}
		} catch (e) {
			console.error('Session validation failed (DB may be unavailable):', e);
			event.locals.user = null;
			event.locals.session = null;
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	const isLandingPage = event.url.pathname === '/';
	const isAuthRoute = event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/register') || event.url.pathname.startsWith('/api/auth');

	// ALWAYS allow access without sign in by providing a generic demo user (except on auth routes and landing page)
	if (!event.locals.user && !isAuthRoute && !isLandingPage) {
		event.locals.user = {
			id: 'demo-user-id',
			email: 'demo@flowplan.app',
			name: 'Demo User',
			isDemo: true,
			provider: 'demo'
		} as any;
	}

	// Intercept POST/PUT/DELETE for demo user so data isn't permanently saved
	// Allow /api/ai/chat to pass through — it handles demo mode internally
	const isDemoMutation = event.locals.user?.isDemo && 
		['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.request.method) &&
		event.url.pathname.startsWith('/api/') &&
		!event.url.pathname.startsWith('/api/ai/chat') &&
		!event.url.pathname.startsWith('/api/auth/login') &&
		!event.url.pathname.startsWith('/api/auth/register');

	if (isDemoMutation) {
		if (event.url.pathname.startsWith('/api/')) {
			// Read request body to echo it back in the mock response if possible
			let reqBody = {};
			try {
				reqBody = await event.request.clone().json();
			} catch (e) {
				// Ignore
			}

			// Mock successful creation response
			return new Response(JSON.stringify({ 
				id: crypto.randomUUID(), 
				success: true,
				...reqBody
			}), {
				status: event.request.method === 'POST' ? 201 : 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	return resolve(event);
};

export const handleError = ({ error }) => {
	console.error('SERVER ERROR:', error);
};
