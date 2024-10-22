<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import LogoutButton from '$lib/components/logout/LogoutButton.svelte';
	import { GamePreset } from 'wordhunt-utils';
	import { beforeNavigate, goto } from '$app/navigation';
	import { SocketClient } from '$lib/socket';
	import { HistoryIcon, Trophy } from 'lucide-svelte';
	import WaitingSpinner from '$lib/WaitingSpinner.svelte';
	import { fade } from 'svelte/transition';

	export let data: PageData;

	let socket: SocketClient;

	let queuing = false;

	let readyState = 0;
	onMount(async () => {
		console.log('Dashboard page loaded');

		socket = new SocketClient(data.session.jwt);
		socket.onStatusChange((status) => {
			if ((status as any).status === 'closed') {
				console.log('removed from queue');
				queuing = false;
			}
			console.log('Socket status: ' + JSON.stringify(status));
			socket = socket;
			readyState = socket.client.readyState;
		});
		socket.onMessage(handleMessage);

		await socket.setupSocket();
	});

	function handleMessage(data: object) {
		const message = JSON.parse((data as any).detail.message);

		const action = message.action;
		const msgData = message.data;

		console.log(message);

		switch (action) {
			case 'CREATE': {
				// socket echos this back with the game details to inform user it was made
				console.log('Game created: ' + msgData.game_id);

				setTimeout(() => {
					goto('/game/' + msgData.game_id);
				}, 100);
				break;
			}

			case 'QUEUE': {
				if (msgData.error) {
					console.error('Failed to find match: ' + msgData.error);
				}

				queuing = false;
				break;
			}

			case 'CANCEL_QUEUE': {
				queuing = false;
				break;
			}
		}
	}

	async function createSingleGame(preset: GamePreset) {
		console.log('Creating game with preset: ' + preset);

		socket.createGame(preset, [data.user.id]);
	}

	async function joinQueue() {
		console.log('Joining queue');
		socket.queueGame();
		queuing = true;
	}

	beforeNavigate(() => {
		if (socket.client && readyState) socket.disconnect();
	});
</script>

<svelte:head>
	<title>Word Hunt - Dashboard</title>
	<meta content="Word Hunt - Dashboard" name="description" />
</svelte:head>

{#if !socket || readyState !== 1 || queuing}
	<WaitingSpinner />
{/if}

{#if queuing}
	<div
		in:fade
		out:fade
		class="z-50 fixed transform top-1/2
		left-1/2 translate-x-[-50%] translate-y-[-33%] w-screen
		h-screen self-center
		pointer-events-auto flex justify-center items-center
		select-none"
	>
		<div class="bg-white rounded-xl p-4 flex flex-col">
			<Label class="text-center text-2xl">Queuing for a match...</Label>
			<Button
				class="transition-all duration-200 ease-in-out
		text-gray-900 text-xl
			  rounded mt-4"
				variant="default"
				on:click={async () => {
					socket.leaveQueue();
				}}>Exit Queue</Button
			>
		</div>
	</div>
{/if}

<div class="flex justify-center items-center">
	<div class="flex justify-center items-center h-screen">
		<div
			class="flex justify-center flex-col bg-white w-[85dvw] max-w-[440px] rounded-lg shadow-2xl px-6 py-3"
		>
			<div class="flex justify-center flex-col pb-5">
				<div class="relative pt-2">
					<div class="absolute top-0 -left-3 mt-[26px]">
						<LogoutButton {data} />
					</div>

					<Label class="block m-auto text-4xl font-bold text-center flex-grow">DASHBOARD</Label>

					<div class="absolute top-0 -right-2 mt-8">
						<Button variant="ghost" class="ml-auto mr-0 h-7 p-2" on:click={() => goto('/history')}>
							<HistoryIcon class="w-6 h-6" />
						</Button>
					</div>
				</div>
				<Label class="text-xl font-bold text-center -mt-1"
					>WELCOME, {data.user.display_name.toUpperCase()}</Label
				>
			</div>

			<div class="flex flex-row items-center justify-center">
				<Label class="text-xl font-bold text-center mb-1">SINGLEPLAYER</Label>
			</div>
			<Button
				class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                       rounded mb-2"
				variant="default"
				on:click={async () => await createSingleGame(GamePreset.Classic)}
			>
				Classic
			</Button>
			<Button
				class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                      rounded mb-4"
				variant="default"
				on:click={async () => await createSingleGame(GamePreset.Unlimited)}
			>
				Unlimited
			</Button>

			<div class="relative">
				<Label class="block m-auto text-xl font-bold text-center mb-1">MULTIPLAYER</Label>
				<div class="absolute top-0 right-0">
					<Button
						variant="outline"
						class="ml-auto mr-0 h-7 p-2"
						on:click={() => goto('/leaderboard')}
					>
						<Trophy class="w-5 h-5" />
					</Button>
				</div>
			</div>
			<Button
				class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                       rounded mb-2"
				variant="default"
				on:click={joinQueue}
			>
				Unrated
			</Button>

			<!-- <Button
				class="transition-all duration-200 ease-in-out
            text-gray-900 text-xl
                  rounded mb-2"
				variant="default"
				on:click={joinQueue}
			>
				Competitive
			</Button> -->

			<Button
				class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl hover:bg-gray-200 bg-gray-200
                       rounded mb-2"
				variant="default"
			>
				Competitive (WIP)
			</Button>
			<Button
				class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl hover:bg-gray-200 bg-gray-200
                       rounded mb-4"
				variant="default"
			>
				Custom (WIP)
			</Button>
		</div>
	</div>
</div>
