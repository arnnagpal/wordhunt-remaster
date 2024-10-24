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
	const dailyLeaderboard = await fetch(`${PUBLIC_GAME_SERVICE_URL}/leaderboard/daily`);
	const avgScoreLeaderboard = await fetch(`${PUBLIC_GAME_SERVICE_URL}/leaderboard/avgscore`);

	if (!dailyLeaderboard.ok || !avgScoreLeaderboard.ok) {
		console.log('Leaderboard not found');
		return redirect(302, '/app');
	}

	const daily = await dailyLeaderboard.json();
	const avgScore = await avgScoreLeaderboard.json();

	return {
		daily,
		avgScore
	};
};
