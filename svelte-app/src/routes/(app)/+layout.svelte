<script>
	import '../../app.css';
	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';

	export let data;

	const duration = 300;
	const delay = duration + 100;
	const x = 400;

	const transitionIn = { easing: cubicOut, x, duration, delay };
	const transitionOut = { easing: cubicIn, x: -x, duration };
</script>

<div class="bg-repeat bg-page-game-background bg-cover bg-center h-screen overflow-y-hidden filter">
	{#key data.pathname}
		<div class="h-screen" in:fly={transitionIn} out:fly={transitionOut}>
			<slot />
		</div>
	{/key}
</div>
