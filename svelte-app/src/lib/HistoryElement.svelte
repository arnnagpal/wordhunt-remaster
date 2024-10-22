<script lang="ts">
	import { Board, type Game } from 'wordhunt-utils';
	import type { User } from './authTypes';
	import PreviewBoard from './PreviewBoard.svelte';
	import GameOver from './GameOver.svelte';

	export let game: Game;
	export let user: User;

	let open = false;

	function getScore(game: Game) {
		return game.players.filter((player) => player.id === user.id)[0].score;
	}

	function getWordCount(game: Game) {
		return game.players.filter((player) => player.id === user.id)[0].words.length;
	}

	function getDate(game: Game) {
		if (!game.ended_at) {
			return 'In Progress';
		}
		return new Date(game.ended_at).toLocaleString().replaceAll(',', '');
	}

	function getGameName(game: Game) {
		if (game.players.length === 1) {
			return 'SOLO';
		} else {
			return 'VS. ' + game.players.filter((player) => player.id !== user.id)[0].username;
		}
	}

	function getEmoji(game: Game) {
		if (game.winner === '-') return '🤷‍♂️';
		return game.winner === user.username ? '👑' : '❤️‍🩹';
	}
</script>

<GameOver bind:open winner={game.winner} players={game.players} waitingOn={[]} redirect={false} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="bg-slate-200 w-full p-4 rounded-md cursor-pointer hover:bg-slate-300 hover:transition-all transition-all"
	on:click={() => (open = !open)}
>
	<div class="flex flex-row gap-4 justify-between">
		<div class="flex justify-start">
			<PreviewBoard board={Board.fromJSON(game.board)} />
		</div>
		<div class="flex-1 flex-col justify-end">
			<p
				class="text-xl xl:text-2xl font-bold text-ellipsis text-nowrap whitespace-nowrap {game.winner ===
				'-'
					? 'text-yellow-500'
					: user.username === game.winner
						? 'text-[#8cde78]'
						: 'text-red-400'}"
			>
				{getEmoji(game) + ' ' + getGameName(game)}
			</p>
			<p class="text-lg xl:text-xl">Score: {getScore(game)}</p>
			<p class="text-lg xl:text-xl">Word Count: {getWordCount(game)}</p>
			<p class="text-lg xl:text-xl">Date: {getDate(game)}</p>
		</div>

		<div></div>
	</div>
</div>
