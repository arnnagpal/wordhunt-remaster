import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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

	const messagesFetch = await fetch(`${PUBLIC_GAME_SERVICE_URL}/chat?last=20`);
	if (!messagesFetch.ok) {
		console.log('Chat not found');
		return redirect(302, '/app');
	}

	const messages = await messagesFetch.json();

	return {
		messages,
		user: user as User,
		session: session as Session
	};
};
