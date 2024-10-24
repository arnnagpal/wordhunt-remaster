import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Session, User } from '$lib/authTypes';
import { PUBLIC_GAME_SERVICE_URL } from '$env/static/public';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) {
		redirect(302, '/login');
	}

	const session = event.locals.session;
	if (!session) {
		redirect(302, '/login');
	}

	if (process.env.AVAILABILITY === 'admin' && user.username !== 'aryan') {
		return redirect(302, '/login');
	}

	const dailyFetch = await fetch(`${PUBLIC_GAME_SERVICE_URL}/game/daily-status`);
	const daily = await dailyFetch.json();

	if (!daily) {
		return redirect(302, '/login');
	}

	console.log(Date.now(), daily.ends_at * 1000);

	return {
		form: await superValidate(zod(z.object({}))),
		user: user as User,
		session: session as Session,
		daily: daily
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			throw fail(401);
		}

		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: sessionCookie.npmCookieOptions().path ?? '.',
			...sessionCookie.npmCookieOptions()
		});

		redirect(302, '/');
	}
};
