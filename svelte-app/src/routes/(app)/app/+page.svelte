<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import LogoutButton from '$lib/components/logout/LogoutButton.svelte';
	import { GamePreset } from 'wordhunt-utils';
	import { beforeNavigate, goto } from '$app/navigation';
	import { SocketClient } from '$lib/socket';

	export let data: PageData;

	let socket: SocketClient;
	onMount(async () => {
		console.log('Dashboard page loaded');

		socket = new SocketClient(data.session.jwt);
		await socket.setupSocket();
		socket.onMessage(handleMessage);
	});

	function handleMessage(data: object) {
		const message = JSON.parse((data as any).detail.message);

		const action = message.action;
		const msgData = message.data;

		switch (action) {
			case 'CREATE': {
				// socket echos this back with the game details to inform user it was made
				console.log('Game created: ' + msgData.game_id);

				setTimeout(() => {
					goto('/game/' + msgData.game_id);
				}, 100);
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

		const response = await fetch('/api/game/join', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				auth_token: data.user.id
			})
		});

		if (response.ok) {
			const game = await response.json();

			setTimeout(() => {
				console.log('Game joined: ' + game.game_id);
				goto('/game/' + game.game_id);
			}, 100);
		} else {
			console.error('Failed to join queue: ' + response.status);
		}
	}

	beforeNavigate(() => {
		socket.disconnect();
	});
</script>

<svelte:head>
	<title>Word Hunt - Dashboard</title>
	<meta content="Word Hunt - Dashboard" name="description" />
</svelte:head>

<div class="flex justify-center items-center">
	<div class="flex justify-center items-center h-screen">
		<div
			class="flex justify-center flex-col bg-white w-[85vw] max-w-[440px] rounded-lg shadow-2xl px-6 py-3"
		>
			<div class="flex justify-center flex-col pb-5">
				<div class="relative pt-2">
					<div class="absolute top-0 left-0 mt-[26px]">
						<LogoutButton {data} />
					</div>

					<Label class="block m-auto text-4xl font-bold text-center flex-grow">DASHBOARD</Label>
				</div>
				<Label class="text-xl font-bold text-center -mt-1"
					>WELCOME, {data.user.display_name.toUpperCase()}</Label
				>
			</div>

			<Label class="text-xl font-bold text-center mb-1">SINGLEPLAYER</Label>
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

			<Label class="text-xl font-bold text-center mb-1">MULTIPLAYER</Label>
			<Button
				class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                       rounded mb-2"
				variant="default"
				on:click={joinQueue}
			>
				Unrated
			</Button>

			<Button
				class="transition-all duration-200 ease-in-out
            text-gray-900 text-xl
                  rounded mb-2"
				variant="default"
				on:click={joinQueue}
			>
				Competitive
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
