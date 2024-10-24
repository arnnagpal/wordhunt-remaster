<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import ShinyText from '$lib/ShinyText.svelte';
	import { Info } from 'lucide-svelte';
	import type { PageData } from './$types';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { onMount } from 'svelte';

	export let data: PageData;

	let open = false;

	let type = 'daily';

	let leaderboard: any[] = [];

	onMount(() => {
		if (type === 'daily') {
			leaderboard = data.daily;
		} else {
			leaderboard = data.avgScore;
		}
	});

	let vw = 0;

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

	function getUsername(username: string, vw: number) {
		if (type === 'daily') {
			if (vw < 640) {
				return username.slice(0, 6) + (username.length > 6 ? '...' : '');
			}

			return username.slice(0, 15) + (username.length > 15 ? '...' : '');
		}

		// get viewports width
		if (vw < 640) {
			return username.slice(0, 10) + (username.length > 10 ? '...' : '');
		}

		return username.slice(0, 20) + (username.length > 20 ? '...' : '');
	}
</script>

<svelte:head>
	<title>Word Hunt - Leaderboard</title>
	<meta content="Word Hunt - Leaderboard" name="description" />
</svelte:head>

<svelte:window bind:innerWidth={vw} />

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
			class="flex flex-col bg-white min-w-[80dvw] xl:min-w-[40dvw] h-[90dvh] overflow-y-scroll scrollbar-none space-y-4 p-4 rounded-xl"
		>
			<div class="relative pt-2">
				<div class="absolute top-0 left-0 mt-[9px] sm:mt-[13px]">
					<Button variant="ghost" class="h-7 p-2 text-3xl" on:click={() => goto('/app')}
						>&#x2190</Button
					>
				</div>

				<Label class="block m-auto text-2xl sm:text-4xl font-bold text-center flex-grow"
					>LEADERBOARD</Label
				>

				{#if type !== 'daily'}
					<div class="absolute top-0 right-0 mt-[3px] sm:mt-[8px]">
						<Button variant="ghost" class="h-7 p-2 py-5 text-3xl" on:click={() => (open = true)}>
							<Info class="h-6 w-6" />
						</Button>
					</div>
				{/if}

				<!-- nav bar -->
				<div class="flex justify-center items-center gap-4">
					<Button
						variant="ghost"
						class="text-lg sm:text-2xl {type === 'daily' ? 'bg-accent' : ''}"
						on:click={() => {
							type = 'daily';
							leaderboard = data.daily;
						}}
					>
						DAILY
					</Button>
					<Button
						variant="ghost"
						class="text-lg sm:text-2xl {type === 'avgScore' ? 'bg-accent' : ''}"
						on:click={() => {
							type = 'avgScore';
							leaderboard = data.avgScore;
						}}
					>
						AVG SCORE
					</Button>
				</div>

				<Separator />
			</div>

			<!-- column titles -->
			<div class="flex justify-between items-center w-full p-4 rounded-lg py-2 bg-slate-200">
				<div class="[flex-grow:_2] w-max relative flex flex-row">
					<Label class="text-sm sm:text-lg left-0">#</Label>
					<Label class="absolute text-sm sm:text-lg left-8 sm:left-16">@USER</Label>
				</div>
				<div class="flex flex-col text-right">
					<Label class="text-md sm:text-lg">SCORE</Label>
					<Label class="-mt-1 text-xs"># words</Label>
				</div>
			</div>

			<div class="flex flex-col w-full">
				{#each leaderboard as player, i}
					<div
						class="flex justify-between items-center w-full p-4 min-h-fit rounded-lg py-2 {i % 2 ==
						0
							? 'bg-slate-200'
							: ''}"
					>
						<div
							class="[flex-grow:_2] w-max {type === 'daily'
								? 'min-h-12'
								: ''} relative flex flex-row items-center"
						>
							<Label class="text-lg sm:text-2xl left-0">{i + 1}</Label>
							<div class="absolute left-8 sm:left-16 flex flex-col w-max">
								{#if i < 3}
									<ShinyText
										text={'@' + getUsername(player.username, vw)}
										class="text-lg sm:text-2xl"
										color={getColor(i)}
									/>
								{:else}
									<Label class="text-lg sm:text-2xl">
										{'@' + getUsername(player.username, vw)}
									</Label>
								{/if}
							</div>
						</div>
						<div class="flex-grow w-full h-full flex flex-col justify-center">
							<div class="w-full h-full relative flex flex-row text-right justify-end gap-2">
								<Label class="text-lg sm:text-2xl">{formatScore(player.score)}</Label>
								<Label class="text-lg sm:text-2xl">{getEmoji(i)}</Label>
							</div>
							{#if type === 'daily'}
								<div class="w-full h-full relative flex text-right justify-end">
									<Label class="-mt-1 text-sm sm:text-md"
										>{player.words.length < 100 ? player.words.length : '100+'} words</Label
									>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
