/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_GAME_SERVICE_URL } from '$env/static/public';

export const load: PageServerLoad = async (event: any) => {
	const user = event.locals.user;

	if (!user) {
		return redirect(302, '/login');
	}

	// fetch game
	const leaderboardFetch = await fetch(`${PUBLIC_GAME_SERVICE_URL}/leaderboard`);

	if (!leaderboardFetch.ok) {
		console.log('Leaderboard not found');
		return redirect(302, '/app');
	}

	const leaderboard = await leaderboardFetch.json();

	console.log(leaderboard);

	return {
		leaderboard
	};
};
