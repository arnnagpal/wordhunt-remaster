<script lang="ts">
	import { onMount } from 'svelte';

	export let board;
</script>

<div class="flex select-none">
	<div
		class="grid grid-cols-4 grid-rows-4 gap-1 p-2 m-auto bg-[#4c5f49] border-8 border-[#A4E593] rounded-xl"
	>
		{#each board.board as row}
			{#each row as letter}
				<div
					role="cell"
					tabindex="0"
					class="w-4 h-4 flex items-center relative
                        justify-center shadow-lg shadow-black
                         border-opacity-10 rounded-sm
                        transition-all duration-200 ease-in-out
                        bg-no-repeat bg-cover bg-center
                        filter transform scale-100 bg-letterBackground text-black
        "
				>
					<p class="[text-shadow:_0px_1px_0_rgb(255_255_255_/_100%)] text-sm font-bold text-black">
						{letter}
					</p>
				</div>
			{/each}
		{/each}
	</div>
</div>
