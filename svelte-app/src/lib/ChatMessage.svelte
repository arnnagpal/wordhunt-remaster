<script lang="ts">
	import { fly } from 'svelte/transition';

	export let message: string;
	export let username: string;
	export let time: string;
	export let subText: string;
</script>

<div class="flex justify-between items-center w-full p-4 rounded-lg py-2 bg-slate-200">
	<div class="flex items-center space-x-2">
		<div class="flex flex-col">
			<div class="flex items-center gap-2">
				<p class="font-bold">@{username}</p>
				<p class="text-xs text-gray-500">{time}</p>
			</div>
			<p class="text-sm">{message}</p>
			<p class="text-xs text-gray-500 mt-1">{subText}</p>
		</div>
	</div>
</div>
