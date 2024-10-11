<script lang="ts">
	import type { PageData } from './$types';
	import Game from '$lib/Game.svelte';
	import GameHeader from '$lib/GameHeader.svelte';
	import { type ScoreEvent, WordSelectionState, type SelectionEvent } from 'ambient';
	import GameScore from '$lib/GameScore.svelte';
	import { afterNavigate, beforeNavigate, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Board, type UpdateType } from 'wordhunt-utils';
	import { SocketClient } from '$lib/socket';
	import GameOver from '$lib/GameOver.svelte';

	export let data: PageData;

	let score = 0;
	let wordCount = 0;

	let gameDisabled: boolean;

	let selectionStatus = WordSelectionState.NoWord;
	let showScore = false;
	let lastWord = '';
	let lastPoints = 0;

	// eslint-disable-next-line no-undef
	let showScoreInterval: NodeJS.Timeout;

	let animateScore = false;

	let board: Board;
	let timer = -1;
	let word_bank: string[] = [];

	let socket: SocketClient = new SocketClient(data.auth_session.jwt);

	$: {
		if (data.game?.board && !board) {
			board = JSON.parse(<string>data.game.board) as Board;
		}

		// if (data.player?.word_bank) {
		// 	const wordBank = <string[]>data.player.word_bank;
		// 	if (wordBank.length > word_bank.length) {
		// 		word_bank = wordBank;
		// 		wordCount = wordBank.length;
		// 	}
		// }

		// if (data.player?.score) {
		// 	const playerScore = <number>data.player.score;
		// 	if (playerScore > score) {
		// 		score = playerScore;
		// 	}
		// }

		// if (data.player?.time_left && timer === -1) {
		// 	timer = <number>data.player?.time_left;
		// }
	}

	function scoreChange(event: CustomEvent<ScoreEvent>) {
		score += event.detail.points;
		wordCount += 1;

		word_bank.push(event.detail.word);

		selectionStatus = WordSelectionState.NewWord;
		console.log(`${score}`);

		lastWord = event.detail.word;
		lastPoints = event.detail.points;
	}

	async function selectionEvent(event: CustomEvent<SelectionEvent>) {
		selectionStatus = event.detail.selectionStatus;
		// console.log(`selection event: ${JSON.stringify(event.detail)}`);

		lastWord = event.detail.wholeWord;
		lastPoints = event.detail.points;

		animateScore = false;
		showScore = true;
		if (showScoreInterval) clearTimeout(showScoreInterval);
	}

	async function endDragEvent() {
		if (showScoreInterval) clearTimeout(showScoreInterval);
		showScore = true;
		animateScore = true;

		showScoreInterval = setTimeout(() => {
			showScore = false;
			animateScore = false;
			lastWord = '';
			lastPoints = 0;
			selectionStatus = WordSelectionState.NoWord;
		}, 500);

		await clearGameSelection();
	}

	async function clearGameSelection() {
		if (!data.game) return;
		if (!data.auth_session) return;

		socket.submitWord();
	}

	async function onSocketMessage(e: object) {
		const json = JSON.parse((e as any).detail.message);
		const updateType = json.updateType as UpdateType;

		switch (updateType) {
			case 'UPDATE_TIME': {
				const timeLeft = json.data.time_left;
				timer = timeLeft;
				break;
			}
			case 'END_GAME': {
				gameDisabled = true;
				break;
			}
		}
	}

	onMount(async () => {
		if (!data.game_id) {
			throw new Error('No game id provided');
		}

		await socket.setupSocket();

		socket.onMessage(onSocketMessage);
		socket.joinGame(data.game_id);

		socket.startTimer();
	});

	beforeNavigate(async (navigation) => {
		if (!navigation.willUnload) {
			return;
		}
		socket.endGame();
		socket.disconnect();
		invalidateAll();
	});

	afterNavigate(async (navigation) => {
		if (!navigation.willUnload) {
			return;
		}
		socket.endGame();
		socket.disconnect();
		invalidateAll();
	});
</script>

<svelte:head>
	<title>Word Hunt - In Game</title>
	<meta content="Word Hunt - In Game" name="description" />
</svelte:head>

<GameOver />
<div class="flex flex-col justify-between items-center">
	<div class="flex flex-col items-center h-1/4">
		<!--		game header   -->
		<GameHeader {data} bind:score bind:words={wordCount} bind:time={timer} />
	</div>

	<div class="flex flex-col items-center w-screen h-[15vh] mt-20">
		<!--    game score on top of board -->
		{#if showScore}
			<GameScore
				bind:animate={animateScore}
				bind:word={lastWord}
				bind:points={lastPoints}
				bind:selectionStatus
			/>
		{/if}
	</div>

	<div class="flex flex-col items-center h-[85vh]">
		<div>
			<Game
				bind:socket
				bind:disabled={gameDisabled}
				bind:wordBank={word_bank}
				bind:board
				on:endDrag={endDragEvent}
				on:score={scoreChange}
				on:selection={selectionEvent}
			/>
		</div>
	</div>
</div>
