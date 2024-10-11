<script lang="ts">
	import { WordSelectionState } from 'ambient';

	const selectionStateToColor = {
		[WordSelectionState.NewWord]: 'bg-[#A4E593]',
		[WordSelectionState.OldWord]: 'bg-[#FEFB92]',
		[WordSelectionState.NoWord]: 'bg-white'
	};

	export let selectionStatus: WordSelectionState;
	export let word: string;
	export let points: number = 0;

	export let animate: boolean = false;
</script>

<div class="rounded-2xl {selectionStateToColor[selectionStatus]}
						shadow-2xl shadow-black z-40
            ease-in-out filter
						{animate ? (selectionStatus === WordSelectionState.NewWord ? 'animate-fade-out-expand opacity-0' : 'animate-fade-out opacity-0') : ''}">
	<div class="flex justify-between items-center px-4 py-2">
		<h1 class="text-2xl font-bold text-[#1A1A1A] text-opacity-85 -mt-1 pb-1">{ word }</h1>
		{#if selectionStatus === WordSelectionState.NewWord}
			<h1 class="text-2xl font-bold text-[#1A1A1A] text-opacity-85 -mt-1 pb-1">&nbsp;(+{ points })</h1>
		{/if}
	</div>
</div>