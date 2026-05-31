import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';
import { verifyPassword } from '$lib/server/password.js';
import { createSession, setSessionCookie } from '$lib/server/auth.js';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password } = await event.request.json();

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const user = await db.user.findUnique({ where: { email } });
		if (!user || !user.passwordHash) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const session = await createSession(user.id);
		setSessionCookie(event, session.id, session.expiresAt);

		return json({
			user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }
		});
	} catch (err) {
		console.error('Login error:', err);
		return json({ error: 'Login failed. Please try again.' }, { status: 500 });
	}
};
