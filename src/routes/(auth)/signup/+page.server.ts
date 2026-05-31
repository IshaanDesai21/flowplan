import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { hashPassword } from '$lib/server/password.js';
import { createSession, setSessionCookie } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	signup: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const password = formData.get('password');

		if (
			typeof name !== 'string' ||
			typeof email !== 'string' ||
			typeof password !== 'string' ||
			!name ||
			!email ||
			password.length < 8
		) {
			return fail(400, { message: 'Invalid input. Password must be at least 8 characters.' });
		}

		// Check if user already exists
		const existingUser = await db.user.findUnique({ where: { email } });
		if (existingUser) {
			return fail(400, { message: 'Email already in use' });
		}

		const passwordHash = await hashPassword(password);

		// Create user and default settings
		const user = await db.user.create({
			data: {
				name,
				email,
				passwordHash,
				provider: 'email',
				settings: {
					create: {
						theme: 'dark'
					}
				}
			}
		});

		const { id, expiresAt } = await createSession(user.id);
		setSessionCookie(event, id, expiresAt);

		throw redirect(302, '/dashboard');
	}
};
