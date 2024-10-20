// deno-lint-ignore-file no-explicit-any
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SessionType, type Game } from 'wordhunt-utils';
import process from 'node:process';

export const load: PageServerLoad = async (event: any) => {
	const user = event.locals.user;
	const params = event.params;

	if (!user) {
		return redirect(302, '/login');
	}

	// fetch game
	const gameStatus = await fetch(`${process.env.GAME_SERVICE_URL}/game/${params.gameId}/status`);
	const gameObj = (await gameStatus.json()) as Game;

	if (!gameStatus.ok) {
		console.log('Game not found');
		return redirect(302, '/app');
	}

	if (gameObj.players.findIndex((p) => p.id === user.id) === -1) {
		console.log('Game not found for user', user.id);
		return redirect(302, '/app');
	}

	if (gameObj.session_type == SessionType.Finished) {
		console.log('Game is already finished');
		return redirect(302, '/app');
	}

	if (!gameObj.timer) {
		return fail(500, { message: 'Game timer not found' });
	}

	if (!gameObj.board) {
		return fail(500, { message: 'Game board not found' });
	}

	const game = {
		id: gameObj._id,
		players: gameObj.players,
		board: JSON.stringify(gameObj.board),
		timer: gameObj.timer,
		created_at: gameObj.created_at,
		ended_at: gameObj.ended_at,
		single_player: gameObj.single_player,
		session_type: gameObj.session_type
	};

	return {
		game_id: params.gameId,
		game,
		auth_session: event.locals.session,
		auth_user: event.locals.user
	};
};
