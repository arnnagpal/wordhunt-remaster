<script lang="ts">
	import '../../app.css';
	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import { isMobileDevice } from '$lib/utils';

	export let data: LayoutData;

	const duration = 300;
	const delay = duration + 100;
	const x = 400;

	const transitionIn = { easing: cubicOut, x, duration, delay };
	const transitionOut = { easing: cubicIn, x: -x, duration };

	let showWarning = false;

	function checkOrientation() {
		if (
			screen.orientation.type !== 'portrait-primary' &&
			screen.orientation.type !== 'portrait-secondary' &&
			isMobileDevice
		) {
			showWarning = true;
		} else {
			showWarning = false;
		}

		console.log(screen.orientation.type);
	}

	onMount(async () => {
		checkOrientation();

		screen.orientation.addEventListener('change', () => {
			checkOrientation();
		});
	});
</script>

{#if showWarning}
	<div
		class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
	>
		<div class="bg-white p-4 rounded-lg shadow-lg">
			<p class="text-center">Please rotate your device to portrait mode.</p>
		</div>
	</div>
{/if}

<div class="bg-repeat bg-page-game-background bg-cover bg-center h-screen overflow-y-hidden filter">
	{#key data.pathname}
		<div class="h-screen" in:fly={transitionIn} out:fly={transitionOut}>
			<slot />
		</div>
	{/key}
</div>
