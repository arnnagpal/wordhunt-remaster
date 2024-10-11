import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '$lib/components/login/schema';
import { lucia } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	login: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// send request to server
		const response = await event.fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: form.data.username,
				password: form.data.password
			})
		});

		const cookies = event.cookies;

		if (!response.ok) {
			const errorMsg = await response.text();

			return error(response.status, errorMsg);
		}
		// get session cookie
		const { session_id, expires_at } = await response.json();
		const expiresAtDate = new Date(expires_at);

		const sessionCookie = lucia.createSessionCookie(session_id, expiresAtDate);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.npmCookieOptions()
		});

		redirect(302, '/app');

		return {
			form
		};
	}
};
