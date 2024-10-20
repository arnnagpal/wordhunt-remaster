import type { Handle } from '@sveltejs/kit';
import { lucia, redisClient } from '$lib/server/auth';

console.log('hooks.server - starting sveltekit server');

console.log(`Redis ping: ${await redisClient.ping()}`);

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	console.log('sessionId:', sessionId);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session) {
		const sessionCookie = lucia.createSessionCookie(session.id, session.expiresAt);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.npmCookieOptions()
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: sessionCookie.npmCookieOptions().path ?? '.',
			...sessionCookie.npmCookieOptions()
		});
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
