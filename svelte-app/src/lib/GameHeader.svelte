<script lang="ts">
	import ExitButton from './components/exit/ExitButton.svelte';

	export let words: number = 0;
	export let score: number = 0;

	export let time = -1;

	export let data: any;

	let displayScore = score;
	let oldScore = score;

	let animatingInterval: NodeJS.Timeout | null = null;

	function fancyTimeFormat(duration: number) {
		const hrs = ~~(duration / 3600);
		const mins = ~~((duration % 3600) / 60);
		const secs = ~~duration % 60;

		let ret = '';
		if (hrs > 0) {
			ret += `${hrs}:${mins < 10 ? '0' : ''}`;
		}

		ret += `${mins}:${secs < 10 ? '0' : ''}${secs}`;
		return ret;
	}

	function easeInOutQuad(t: number) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}

	function animateScore(oldScore: number, newScore: number, duration: number) {
		if (animatingInterval) return;
		const start = performance.now();

		animatingInterval = setInterval(() => {
			const now = performance.now();
			const rawProgress = Math.min((now - start) / duration, 1);
			const progress = easeInOutQuad(rawProgress);

			displayScore = oldScore + (newScore - oldScore) * progress;

			if (progress >= 1) {
				clearInterval(animatingInterval as NodeJS.Timeout);
				animatingInterval = null;
			}
		}, 16); // 16ms for roughly 60fps
	}

	$: {
		if (oldScore !== score) {
			if (animatingInterval) {
				clearInterval(animatingInterval as NodeJS.Timeout);
				animatingInterval = null;
			}

			oldScore = score;
		}

		if (Math.abs(score - displayScore) > 0.5) {
			animateScore(displayScore, score, 500); // 1000ms = 1 second duration
		}
	}
</script>

<div class="flex flex-col">
	<!-- game header with the score, and words count text -->
	<!-- svelte + tailwind -->

	<div
		class="flex justify-center items-center bg-white w-[90vw] max-w-[420px] h-20 rounded-b-xl relative"
	>
		<div class="absolute top-0 left-0 mt-[20px]">
			<ExitButton {data} />
		</div>

		<div class="flex flex-col text-left">
			<p class="text-xl font-extrabold -mb-2">WORDS: {words}</p>
			<p class="text-3xl font-extrabold">
				SCORE: {Math.round(displayScore).toString().padStart(4, '0')}
			</p>
		</div>
	</div>

	<!--    on the right side of the game header -->
	{#if time > -1}
		<div
			class="flex justify-center items-center bg-green-950 bg-opacity-40 text-white text-center w-[20vw] max-w-[120px] rounded-b-xl ml-auto mr-4"
		>
			<p class="text-md font-bold pb-0.5">{fancyTimeFormat(time)}</p>
		</div>
	{/if}
</div>
