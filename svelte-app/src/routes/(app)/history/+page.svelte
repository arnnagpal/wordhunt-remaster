<script lang="ts">
	import type { Game } from 'wordhunt-utils';
	import type { PageData } from './$types';
	import HistoryElement from '$lib/HistoryElement.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let user = data.user;
	let history = JSON.parse(data.history);

	let singleplayer = history.singleplayer;
	let multiplayer = history.multiplayer;

	let filter = 'singleplayer';

	function toggleFilter() {
		if (filter === 'singleplayer') {
			filter = 'multiplayer';
		} else {
			filter = 'singleplayer';
		}
	}
</script>

<svelte:head>
	<title>Word Hunt - History</title>
	<meta content="Word Hunt - History" name="description" />
</svelte:head>

<div class="flex justify-center items-center h-screen w-screen">
	<div class="flex justify-center items-center h-full w-full">
		<div
			class="flex flex-col bg-white w-[35dvw] min-w-fit h-[90dvh] overflow-y-scroll scrollbar-none space-y-4 p-4 rounded-xl"
		>
			<div class="relative pt-2">
				<div class="absolute top-0 left-0 mt-[13px]">
					<Button variant="ghost" class="h-7 p-2 text-3xl" on:click={() => goto('/app')}
						>&#x2190</Button
					>
				</div>

				<Label class="block m-auto text-4xl font-bold text-center flex-grow">HISTORY</Label>

				<div class="absolute top-0 right-0 mt-4">
					<Button
						variant="ghost"
						class="ml-auto mr-0 h-7 p-2 text-3xl"
						on:click={() => toggleFilter()}
					>
						{filter === 'singleplayer' ? '🤦‍♂️' : '🤦‍♂️🤦‍♂️'}
					</Button>
				</div>
			</div>
			<div class="flex flex-col space-y-4 w-full">
				{#if filter === 'singleplayer'}
					{#if singleplayer.length > 0}
						<div class="flex flex-col space-y-4">
							{#each singleplayer as game}
								<HistoryElement {game} {user} />
							{/each}
						</div>
					{/if}
				{:else if multiplayer.length > 0}
					<div class="flex flex-col space-y-4">
						{#each multiplayer as game}
							<HistoryElement {game} {user} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
