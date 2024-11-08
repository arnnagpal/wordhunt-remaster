<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { GamePlayer } from 'wordhunt-utils';
	import { Separator } from './components/ui/separator';
	import { getPoints } from 'wordhunt-utils/src/utils';
	import { goto } from '$app/navigation';

	export let open = false;
	export let winner = '';
	export let players: GamePlayer[] = [];

	export let waitingOn: string[] = [];

	export let redirect = true;

	let tie = () => winner === '-';

	function getEmoji(username: string) {
		if (tie()) return '🤷‍♂️';
		return username === winner ? '👑' : '❤️‍🩹';
	}

	function openChange(open: boolean) {
		if (open) return;

		if (redirect) {
			// redirect to dashboard
			goto('/app');
		}
	}
</script>

<AlertDialog.Root
	bind:open
	closeOnEscape={false}
	closeOnOutsideClick={false}
	onOpenChange={openChange}
>
	<AlertDialog.Content class={players.length == 1 ? 'max-w-sm' : ''}>
		<AlertDialog.Header>
			<div>
				<AlertDialog.Title class="text-center text-2xl">GAME OVER</AlertDialog.Title>
				<p class="text-center text-xl">SCORES</p>
			</div>
		</AlertDialog.Header>
		<AlertDialog.Description>
			<!-- line -->
			<Separator />

			<div class="flex flex-row gap-5 justify-between">
				{#each players as player}
					<!-- cover as much space till the middle separator -->
					<div class="flex-1">
						<div class="">
							<div class="flex flex-row gap-2 justify-between">
								<p
									class="text-lg font-bold {!winner || tie()
										? 'text-yellow-500'
										: player.username === winner
											? 'text-[#8cde78]'
											: 'text-red-400'}"
								>
									@{player.username}
								</p>
								<p class="text-lg font-bold">
									{getEmoji(player.username)}
								</p>
							</div>
							<!-- display words along with indiv word scores -->
							<Separator />
							<div
								class="flex flex-col gap-2 overflow-y-scroll scrollbar-none min-h-72 max-h-72 {waitingOn.includes(
									player.username
								)
									? 'justify-center items-center'
									: ''}"
							>
								{#if waitingOn.includes(player.username)}
									<div class="self-center">
										<p class="text-lg font-bold">Waiting...</p>
									</div>
								{:else}
									{#each player.words.toSorted((a, b) => {
										return getPoints(b) - getPoints(a);
									}) as word}
										<div class="flex flex-row gap-2 justify-between">
											<p class="text-lg font-bold">{word}</p>
											<p class="text-lg font-bold">{getPoints(word)}</p>
										</div>
									{/each}
								{/if}
							</div>
						</div>
						<!-- display total score -->
						<Separator />
						<div class="flex flex-row gap-2 justify-between">
							<p class="text-lg font-bold">Total</p>
							<p class="text-lg font-bold">
								{waitingOn.includes(player.username) ? '?' : player.score}
							</p>
						</div>
					</div>

					<!-- add vertical separator -->
					{#if player !== players[players.length - 1]}
						<Separator orientation="vertical" />
					{/if}
				{/each}
			</div>
		</AlertDialog.Description>
		<AlertDialog.Footer>
			<AlertDialog.Action>CONTINUE</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
