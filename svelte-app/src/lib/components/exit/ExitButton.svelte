<script lang="ts">
	import { DoorClosed, DoorOpen } from 'lucide-svelte';
	import Button from '../ui/button/button.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatcher = createEventDispatcher();

	let hovering = false;
</script>

<Button
	variant="ghost"
	on:mouseenter={() => (hovering = true)}
	on:mouseleave={() => (hovering = false)}
	on:click={() => dispatcher('exit', {})}
>
	{#if hovering}
		<DoorOpen />
	{:else}
		<DoorClosed />
	{/if}
</Button>
