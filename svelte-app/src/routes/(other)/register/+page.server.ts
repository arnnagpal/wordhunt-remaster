import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/components/signup/schema';
import { lucia } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	signup: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// send signup request to server
		const response = await event.fetch('/api/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: form.data.email,
				username: form.data.username,
				displayName: form.data.display_name,
				password: form.data.password
			})
		});

		const cookies = event.cookies;

		if (!response.ok) {
			const error = await response.json();
			return fail(response.status, error);
		}
		// get session cookie
		const { session_id, expires_at } = await response.json();

		const expiresAtDate = new Date(expires_at);

		const sessionCookie = lucia.createSessionCookie(session_id, expiresAtDate);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.npmCookieOptions()
		});

		// create delay to simulate slow network
		await new Promise((resolve) => setTimeout(resolve, 2000));

		redirect(302, '/app');
	}
};
