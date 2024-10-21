<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import ShinyText from '$lib/ShinyText.svelte';
	import { Info } from 'lucide-svelte';
	import type { PageData } from './$types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	export let data: PageData;

	let open = false;

	// let leaderboard = [
	// 	{
	// 		name: '@aryan',
	// 		score: 2000000
	// 	},
	// 	{
	// 		name: '@dummy',
	// 		score: 90
	// 	},
	// 	{
	// 		name: '@dummy2',
	// 		score: 80
	// 	},
	// 	{
	// 		name: '@nobody',
	// 		score: 70
	// 	},
	// 	{
	// 		name: '@whosthat',
	// 		score: 60
	// 	},
	// 	{
	// 		name: '@isaidnobody',
	// 		score: 50
	// 	},
	// 	{
	// 		name: '@wdym',
	// 		score: 40
	// 	},
	// 	{
	// 		name: '@areyoudeafisaidnobody',
	// 		score: 39
	// 	},
	// 	{
	// 		name: '@nooyudidnt',
	// 		score: 38
	// 	},
	// 	{
	// 		name: '@yesidid',
	// 		score: 37
	// 	},
	// 	{
	// 		name: '@noyoudidnt',
	// 		score: 36
	// 	},
	// 	{
	// 		name: '@yesidid',
	// 		score: 35
	// 	},
	// 	{
	// 		name: '@noyoudidnt',
	// 		score: 34
	// 	},
	// 	{
	// 		name: '@yesidid',
	// 		score: 33
	// 	},
	// 	{
	// 		name: '@yesidid',
	// 		score: 32
	// 	},
	// 	{
	// 		name: '@yesidid',
	// 		score: 31
	// 	},
	// 	{
	// 		name: '@yesidid',
	// 		score: 30
	// 	}
	// ];

	const leaderboard = data.leaderboard;

	function formatScore(score: number) {
		if (score > 1000000) {
			return '>1,000,000';
		}
		return score.toLocaleString();
	}

	function getEmoji(i: number) {
		switch (i) {
			case 0:
				return ' 🥇';
			case 1:
				return ' 🥈';
			case 2:
				return ' 🥉';
			default:
				return '\u00a0\u00a0\u00a0\u00a0\u00a0';
		}
	}

	function getColor(n: number) {
		if (n === 0) return 'gold';
		if (n === 1) return 'silver';
		return 'bronze';
	}
</script>

<svelte:head>
	<title>Word Hunt - Leaderboard</title>
	<meta content="Word Hunt - Leaderboard" name="description" />
</svelte:head>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<div>
				<AlertDialog.Title class="text-center text-2xl">LEADERBOARD INFO</AlertDialog.Title>
				<p class="text-center text-xl">HOW IT WORKS</p>
			</div>
		</AlertDialog.Header>
		<AlertDialog.Description>
			<!-- line -->
			<Separator />
			<p class="text-lg">
				Your score is calculated based on 1 factor as of now:
				<br />
				&nbsp;&nbsp;&nbsp;&nbsp;→ Your average score from the last 5
				<span class="font-bold">MULTIPLAYER</span> games.
			</p>

			<p>
				<br />
				<br />

				You won't be on the leaderboard if you have less than 5 games played.
				<br />
				This is to ensure that your score wasn't a fluke from RNG as all the boards are different.
				<br />
				<br />
				The leaderboard itself will likely turn into a category-based leaderboard in the future, with
				ELO ratings being the main category.
			</p>
		</AlertDialog.Description>
		<AlertDialog.Footer>
			<AlertDialog.Action>CONTINUE</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<div class="flex justify-center items-center h-screen w-screen">
	<div class="flex justify-center items-center h-full w-full">
		<div
			class="flex flex-col bg-white w-[40dvw] min-w-fit h-[90dvh] overflow-y-scroll scrollbar-none space-y-4 p-4 rounded-xl"
		>
			<div class="relative pt-2">
				<div class="absolute top-0 left-0 mt-[13px]">
					<Button variant="ghost" class="h-7 p-2 text-3xl" on:click={() => goto('/app')}
						>&#x2190</Button
					>
				</div>

				<Label class="block m-auto text-4xl font-bold text-center flex-grow">LEADERBOARD</Label>

				<div class="absolute top-0 right-0 mt-[8px]">
					<Button variant="ghost" class="h-7 p-2 py-5 text-3xl" on:click={() => (open = true)}>
						<Info class="h-6 w-6" />
					</Button>
				</div>
				<Separator />
			</div>
			<div class="flex flex-col w-full">
				{#each leaderboard as player, i}
					<div
						class="flex justify-between items-center w-full p-4 rounded-lg py-2 {i % 2 == 0
							? 'bg-slate-200'
							: ''}"
					>
						<div class="[flex-grow:_2] overflow-ellipsis relative flex flex-row">
							<Label class="text-2xl left-0">{i + 1}</Label>
							{#if i < 3}
								<ShinyText
									text={'@' + player.username}
									class="absolute left-16 text-2xl"
									color={getColor(i)}
								/>
							{:else}
								<Label class="absolute text-2xl left-16">{player.name}</Label>
							{/if}
						</div>
						<div class="flex-grow relative flex flex-row h-full text-right justify-end gap-2">
							<Label class="text-2xl">{formatScore(player.score)}</Label>
							<Label class="text-2xl">{getEmoji(i)}</Label>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
