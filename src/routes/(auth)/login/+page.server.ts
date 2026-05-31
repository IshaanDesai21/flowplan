import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { verifyPassword } from '$lib/server/password.js';
import { createSession, setSessionCookie } from '$lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const user = await db.user.findUnique({ where: { email } });

		if (!user || !user.passwordHash) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const validPassword = await verifyPassword(password, user.passwordHash);

		if (!validPassword) {
			return fail(400, { message: 'Invalid email or password' });
		}

		const { id, expiresAt } = await createSession(user.id);
		setSessionCookie(event, id, expiresAt);

		throw redirect(302, '/dashboard');
	}
};
