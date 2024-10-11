import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = (event) => {
	if (event.locals.user) return redirect(302, '/app');

	return {};
};
