<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import Line from '$lib/Line.svelte';

	import { type ScoreEvent, WordSelectionState, type SelectionEvent } from 'ambient';
	import type { Board, UpdateType } from 'wordhunt-utils';
	import { getPoints } from 'wordhunt-utils/src/utils';
	import type { SocketClient } from './socket';

	export let board: Board;

	const letterBoxColors = {
		[WordSelectionState.NoWord]: 'bg-letterBackground-White',
		[WordSelectionState.NewWord]: 'bg-letterBackground-Green',
		[WordSelectionState.OldWord]: 'bg-letterBackground-Yellow'
	};

	const textColors = {
		[WordSelectionState.NoWord]: 'text-black',
		[WordSelectionState.NewWord]: 'text-brown',
		[WordSelectionState.OldWord]: 'text-brown'
	};

	let rows: number = board.board.length;
	let columns: number = board.board[0].length;

	let idToElement: Array<HTMLElement> = new Array<HTMLElement>(rows * columns);

	let state: Array<boolean> = new Array(rows * columns).fill(false);
	let selected: number[] = [];
	let selectionStatus: WordSelectionState = WordSelectionState.NoWord;

	export let wordBank: string[] = [];
	export let disabled = false;
	export let socket: SocketClient;

	let lines: Line[] = [];

	let isDrag = false;

	const dispatch = createEventDispatcher();

	onMount(() => {
		// generate board
		for (let i = 0; i < rows * columns; i++) {
			let doc = document.getElementById('letter-' + i);
			if (!doc) {
				console.log('Could not find element with id letter-' + i);
				return;
			}

			idToElement[i] = doc;
		}
	});

	onDestroy(() => {
		eraseLines();
	});

	function findElement(clientX: number, clientY: number): number {
		for (let i = 0; i < rows * columns; i++) {
			let rect = idToElement[i].getBoundingClientRect();
			if (
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom
			) {
				return i;
			}
		}
		return -1;
	}

	function clearSelection() {
		selected = [];
		state = state.map(() => false);
		eraseLines();
	}

	function getLineColor() {
		if (selectionStatus === WordSelectionState.NoWord) {
			return 'red';
		}

		return 'white';
	}

	function eraseLines() {
		for (let line of lines) {
			line.$destroy();
		}
	}

	function drawLines() {
		if (selected.length < 2) {
			return;
		}

		let start = idToElement[selected[0]];
		let joints = [];

		for (let i = 1; i < selected.length; i++) {
			let current = selected[i];
			let currentElement = idToElement[current];

			joints.push(currentElement);
		}

		let line = new Line({
			target: document.body,
			props: {
				start: start,
				joints: joints,
				opacity: 0.5,
				color: getLineColor()
			}
		});

		lines.push(line);
	}

	function getState(r: number, c: number): boolean {
		return state[r * columns + c]; // return the state of the letter at position r, c
	}

	function validMove(r: number, c: number): boolean {
		if (selected.length === 0) {
			return true;
		}

		let last = selected[selected.length - 1];
		let lastR = Math.floor(last / columns);
		let lastC = last % columns;

		return Math.abs(r - lastR) <= 1 && Math.abs(c - lastC) <= 1;
	}

	async function toggle(r: number, c: number) {
		let grid = board.board;
		state[r * columns + c] = !state[r * columns + c];

		if (state[r * columns + c]) {
			selected.push(r * columns + c);
		} else {
			selected = selected.filter((value) => value !== r * columns + c);
		}

		const word = selected
			.map((value) => grid[Math.floor(value / columns)][value % columns])
			.join('');

		const valid = await socket.selectLetter(grid[r][c], selected.length - 1, r, c);
		if (valid) {
			console.log('Valid word: ' + word);

			selectionStatus = wordBank.includes(word)
				? WordSelectionState.OldWord
				: WordSelectionState.NewWord;
		} else {
			selectionStatus = WordSelectionState.NoWord;
		}

		dispatch('selection', {
			letter: grid[r][c],
			letterRow: r,
			letterColumn: c,
			letterIndex: selected.length - 1,

			selectionStatus: selectionStatus,
			wholeWord: word,
			points: valid ? getPoints(word) : 0
		} as SelectionEvent);

		eraseLines();
		drawLines();
	}

	function beginDrag() {
		isDrag = true;
	}

	function endDrag() {
		let grid = board.board;

		isDrag = false;

		if (selected.length > 0) dispatch('endDrag', {});

		if (selected.length < 3) {
			clearSelection();
			return;
		}

		// todo: validate word
		if (selectionStatus === WordSelectionState.NewWord) {
			wordBank.push(
				selected.map((value) => grid[Math.floor(value / columns)][value % columns]).join('')
			);
			dispatch('score', {
				selectionStatus: selectionStatus,
				word: wordBank[wordBank.length - 1],
				points: getPoints(wordBank[wordBank.length - 1])
			} as ScoreEvent);

			console.log(
				wordBank[wordBank.length - 1],
				getPoints(wordBank[wordBank.length - 1]),
				wordBank[wordBank.length - 1].length
			);
		}

		clearSelection();
		selectionStatus = WordSelectionState.NoWord;
	}

	function mouseHandler(r: number, c: number) {
		if (disabled) {
			return;
		}

		return (e: MouseEvent) => {
			let click = e.type === 'mousedown';

			if (isDrag || click) {
				if (!isDrag) beginDrag();

				if (validMove(r, c) && !getState(r, c)) toggle(r, c);
			}

			if (e.type === 'mouseup') {
				endDrag();
			}
		};
	}

	function touchHandler(r: number, c: number) {
		if (disabled) {
			return;
		}

		return (e: TouchEvent) => {
			let click = e.type === 'touchstart';

			if (click) {
				beginDrag();
				if (!getState(r, c)) toggle(r, c);
			}

			if (isDrag) {
				let touch = e.touches[0];
				if (!touch) {
					console.log('no touch');
					console.log(e.touches);
					return;
				}

				let element = findElement(touch.clientX, touch.clientY);
				if (element === -1) {
					return;
				}

				let r = Math.floor(element / rows);
				let c = element % columns;

				if (validMove(r, c) && !getState(r, c)) toggle(r, c);
			}

			if (e.type === 'touchend') {
				endDrag();
			}
		};
	}
</script>

<svelte:window on:pointerup={endDrag} />

{#if disabled}
	<div class="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>
{:else}
	<div class="flex touch-none select-none">
		<div
			class="grid grid-cols-4 grid-rows-4 gap-3 p-4 m-auto bg-[#4c5f49] border-8 border-[#A4E593] rounded-2xl"
		>
			{#each board.board as row, r}
				{#each row as letter, c}
					<div
						role="cell"
						tabindex="0"
						id="letter-{r * columns + c}"
						on:touchstart={touchHandler(r, c)}
						on:touchmove={touchHandler(r, c)}
						on:touchend={touchHandler(r, c)}
						on:mousedown={mouseHandler(r, c)}
						on:mouseenter={mouseHandler(r, c)}
						on:mouseup={mouseHandler(r, c)}
						class="w-16 h-16 flex items-center relative
                            justify-center cursor-pointer shadow-lg shadow-black
                             border-opacity-10 rounded-md
                            transition-all duration-200 ease-in-out
                            bg-no-repeat bg-cover bg-center
                            filter
                            {state[r * columns + c]
							? 'animate-jump transform scale-105'
							: 'transform scale-100'}
                            {state[r * columns + c]
							? letterBoxColors[selectionStatus]
							: 'bg-letterBackground text-black'}
            "
					>
						<p
							class="[text-shadow:_0px_1px_0_rgb(255_255_255_/_100%)] text-5xl mb-1 font-bold {state[
								r * columns + c
							]
								? textColors[selectionStatus]
								: 'text-black'}"
						>
							{letter}
						</p>
					</div>
				{/each}
			{/each}
		</div>
	</div>
{/if}
