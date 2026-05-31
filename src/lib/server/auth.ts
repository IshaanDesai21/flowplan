import { db } from './db.js';
import { v4 as uuid } from 'uuid';
import type { RequestEvent } from '@sveltejs/kit';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_COOKIE_NAME = 'flowplan_session';

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
	const session = await db.session.create({
		data: {
			id: uuid(),
			userId,
			expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
		}
	});
	return { id: session.id, expiresAt: session.expiresAt };
}

export async function validateSession(sessionId: string) {
	const session = await db.session.findUnique({
		where: { id: sessionId },
		include: {
			user: {
				select: {
					id: true,
					email: true,
					name: true,
					avatarUrl: true,
					isDemo: true
				}
			}
		}
	});

	if (!session) return null;

	// Session expired
	if (session.expiresAt < new Date()) {
		await db.session.delete({ where: { id: sessionId } });
		return null;
	}

	// Extend session if more than half expired
	const halfLife = SESSION_DURATION_MS / 2;
	const remaining = session.expiresAt.getTime() - Date.now();
	if (remaining < halfLife) {
		await db.session.update({
			where: { id: sessionId },
			data: { expiresAt: new Date(Date.now() + SESSION_DURATION_MS) }
		});
	}

	return {
		session: { id: session.id, expiresAt: session.expiresAt },
		user: session.user
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.session.delete({ where: { id: sessionId } }).catch(() => {
		// Session may already be deleted
	});
}

export function setSessionCookie(event: RequestEvent, sessionId: string, expiresAt: Date): void {
	event.cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt
	});
}

export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export function getSessionId(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE_NAME);
}
