<script lang="ts">
	import Button from '$lib/Button.svelte';
</script>

<svelte:head>
	<title>Word Hunt - Home</title>
	<meta content="Word Hunt - Home" name="description" />
</svelte:head>

<div class="flex justify-center items-center">
	<div class="flex justify-center items-center h-screen w-[85vw]">
		<div class="flex justify-around flex-col bg-white h-auto rounded-lg shadow-2xl p-2 pl-6 pr-6">
			<div>
				<h1 class="text-4xl font-extrabold text-center pb-1">How to play:</h1>
				<p class="text-center text-[16px] font-bold">
					Connect letters together by dragging your finger [or cursor].
				</p>
				<p class="text-center text-[13px] font-bold">Make as many words as you can.</p>
			</div>

			<div class="flex flex-col justify-center items-center pb-10">
				<Button redirectTo="/login" text="Login" />
				<Button redirectTo="/register" text="Register" />
			</div>

			<p class="text-center text-xs font-medium">
				*Clone of the popular GamePigeon game called "WordHunt"
			</p>
		</div>
	</div>
</div>
