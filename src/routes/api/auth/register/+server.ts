import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/password.js';
import { createSession, setSessionCookie } from '$lib/server/auth.js';
import { isValidEmail, isValidPassword } from '$lib/utils/validators.js';

export const POST: RequestHandler = async (event) => {
	try {
		const { email, password, name } = await event.request.json();

		if (!email || !password || !name) {
			return json({ error: 'All fields are required' }, { status: 400 });
		}

		if (!isValidEmail(email)) {
			return json({ error: 'Invalid email address' }, { status: 400 });
		}

		if (!isValidPassword(password)) {
			return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
		}

		const existing = await db.user.findUnique({ where: { email } });
		if (existing) {
			return json({ error: 'An account with this email already exists' }, { status: 409 });
		}

		const passwordHash = await hashPassword(password);
		const user = await db.user.create({
			data: { email, name, passwordHash, provider: 'email' }
		});

		await db.userSettings.create({ data: { userId: user.id } });

		const session = await createSession(user.id);
		setSessionCookie(event, session.id, session.expiresAt);

		return json({ user: { id: user.id, email: user.email, name: user.name } });
	} catch (err) {
		console.error('Register error:', err);
		return json({ error: 'Registration failed. Please try again.' }, { status: 500 });
	}
};
