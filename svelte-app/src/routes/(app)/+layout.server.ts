import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = (event) => {
	if (!event.locals.user) return redirect(302, '/');
	if (process.env.AVAILABILITY === 'admin' && event.locals.user.username !== 'aryan') {
		return redirect(302, '/');
	}

	return {
		user: event.locals.user,
		session: event.locals.session
	};
};
