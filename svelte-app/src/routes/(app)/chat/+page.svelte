<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { PageData } from './$types';
	import ChatMessage from '$lib/ChatMessage.svelte';
	import { SocketClient } from '$lib/socket';
	import { onMount } from 'svelte';
	import WaitingSpinner from '$lib/WaitingSpinner.svelte';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { formatPreviousDate } from 'wordhunt-utils/src/utils';

	export let data: PageData;

	let socket: SocketClient;
	let readyState = 0;

	let message = '';

	// const messages = [
	// 	{
	// 		date: Date.now(),
	// 		username: 'aryan',
	// 		avgScore: 3400,
	// 		message: 'wow this is crazy!'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy4',
	// 		avgScore: 3700,
	// 		message: 'who tf'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy5',
	// 		avgScore: 3400,
	// 		message: 'chat am i late'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy6',
	// 		avgScore: 3400,
	// 		message: 'chat am i late'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy7',
	// 		avgScore: 3400,
	// 		message: 'chat am i late'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy8',
	// 		avgScore: 3400,
	// 		message: 'chat am i late'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy9',
	// 		avgScore: 3400,
	// 		message: 'chat am i late'
	// 	},
	// 	{
	// 		date: Date.now() - 1000000000,
	// 		username: 'dummy10',
	// 		avgScore: 3400,
	// 		message: 'chat am i late'
	// 	},

	// 	{
	// 		date: Date.now() - 1000,
	// 		username: 'dummy',
	// 		avgScore: 1500,
	// 		message: 'Nuh uh this is fine lol'
	// 	}
	// ];

	let messages = data.messages;

	let vw = 0;

	onMount(async () => {
		console.log('Dashboard page loaded');

		socket = new SocketClient(data.session.jwt);
		socket.onStatusChange((status) => {
			console.log('Socket status: ' + JSON.stringify(status));
			socket = socket;
			readyState = socket.client.readyState;
		});
		socket.onMessage(handleMessage);

		await socket.setupSocket();
		socket.subscribeChat();
	});

	function handleMessage(data: object) {
		const message = JSON.parse((data as any).detail.message);

		const action = message.action;
		const msgData = message.data;

		switch (action) {
			case 'MESSAGE': {
				console.log('New message: ' + msgData.message);
				messages.unshift({
					created_at: msgData.created_at,
					username: msgData.username,
					avgScore: msgData.avg_score,
					message: msgData.message
				});

				messages = messages;
				break;
			}
		}
	}

	function sendMessage() {
		if (message.trim() === '') {
			return;
		}

		socket.sendMessage(
			JSON.stringify({
				action: 'MESSAGE',
				data: {
					message: message
				}
			})
		);
		message = '';
	}

	function formatScore(score: number) {
		if (score > 1000000) {
			return '>1,000,000';
		}
		return score.toLocaleString();
	}
</script>

<svelte:head>
	<title>Word Hunt - Chat</title>
	<meta content="Word Hunt - Chat" name="description" />
</svelte:head>

<svelte:window bind:innerWidth={vw} />

{#if !socket || readyState !== 1}
	<WaitingSpinner />
{/if}

<div class="flex p-4 overflow-y-hidden justify-center h-full w-full">
	<div
		class="overflow-hidden flex flex-col p-2 bg-white min-w-[80dvw] sm:min-w-[70dvw] md:min-w-[50dvw] xl:min-w-[30dvw] h-[90dvh] space-y-4 rounded-xl"
	>
		<div class="relative pt-2">
			<div class="absolute top-0 left-0 mt-[9px] sm:mt-[13px]">
				<Button variant="ghost" class="h-7 p-2 text-3xl" on:click={() => goto('/app')}
					>&#x2190</Button
				>
			</div>

			<Label class="block m-auto text-2xl sm:text-4xl font-bold text-center flex-grow">CHAT</Label>
			<Separator />
		</div>
		<div class="flex flex-col w-full h-full justify-start gap-2">
			<!-- chat box -->
			<div class="flex w-full gap-2 bg-white rounded-xl pb-2 px-1 -mt-1">
				<input
					bind:value={message}
					type="text"
					class="flex-grow p-2 border border-gray-300 rounded-lg"
					placeholder="Type a message..."
					maxlength="75"
				/>
				<Button class="h-10 p-2" variant="secondary" on:click={sendMessage}>Send</Button>
			</div>
			<div class="flex flex-col w-full gap-2 max-h-[70dvh] sm:max-h-[75dvh] overflow-y-scroll px-2">
				{#each messages as chatMsg (chatMsg.created_at)}
					<div
						in:scale={{
							delay: 0,
							duration: 500,
							easing: backOut
						}}
					>
						<ChatMessage
							username={chatMsg.username}
							message={chatMsg.message}
							time={formatPreviousDate(chatMsg.created_at)}
							subText={`Avg Score: ${formatScore(chatMsg.avgScore)}`}
						/>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
