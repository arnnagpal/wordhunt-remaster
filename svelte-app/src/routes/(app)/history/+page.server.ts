import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Session, User } from '$lib/authTypes';
import { mongoClient } from '$lib/server/auth';
import type { Game } from 'wordhunt-utils';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;
	if (!user) {
		redirect(302, '/login');
	}

	const session = event.locals.session;
	if (!session) {
		redirect(302, '/login');
	}

	const mongoUser = await mongoClient.User.findById(user.id).exec();
	if (!mongoUser) {
		return redirect(302, '/app');
	}

	let multiplayerGames: Game[] | undefined = await mongoClient.Game.find({
		_id: { $in: mongoUser.games },
		single_player: false
	}).exec();
	let singleplayerGames: Game[] | undefined = await mongoClient.Game.find({
		_id: { $in: mongoUser.games },
		single_player: true
	}).exec();
	if (!multiplayerGames || !singleplayerGames) {
		return redirect(302, '/app');
	}

	multiplayerGames.filter((game) => game.session_type === 1);
	singleplayerGames.filter((game) => game.session_type === 1);

	multiplayerGames.sort((a, b) => b.ended_at - a.created_at);
	singleplayerGames.sort((a, b) => b.ended_at - a.created_at);

	// only show the last 20 games
	multiplayerGames = multiplayerGames.slice(0, 20);
	singleplayerGames = singleplayerGames.slice(0, 20);

	multiplayerGames.map((game) => {
		return {
			_id: game._id,
			players: game.players,
			board: game.board,
			timer: game.timer,
			created_at: game.created_at,
			ended_at: game.ended_at
		};
	});

	singleplayerGames.map((game) => {
		return {
			_id: game._id,
			players: game.players,
			board: game.board,
			timer: game.timer,
			created_at: game.created_at,
			ended_at: game.ended_at
		};
	});

	const history = {
		multiplayer: multiplayerGames,
		singleplayer: singleplayerGames
	};

	return {
		user: user as User,
		session: session as Session,
		history: JSON.stringify(history)
	};
};
