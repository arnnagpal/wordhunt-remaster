<script lang="ts">
	import { type Props } from '$lib/components/ui/button/index.js';

	import { cn } from '$lib/utils';

	const colors: {
		[key: string]: string;
	} = {
		gold: 'from-amber-500 via-yellow-400 to-amber-500',
		silver: 'from-zinc-400 via-zinc-300 to-neutral-400',
		bronze: 'from-orange-800 via-amber-600 to-orange-800'
	};

	export let color = 'gold';

	export let text = '';

	let className: Props['class'] = undefined;
	export { className as class };
</script>

<div class={cn('flex', className)}>
	<span
		class="absolute mx-auto bg-gradient-to-r blur-xl {colors[
			color
		]} !bg-clip-text box-content font-extrabold text-transparent select-none"
	>
		{text}
	</span>
	<h1
		class="relative top-0 flex bg-gradient-to-r items-center {colors[
			color
		]} !bg-clip-text font-extrabold text-transparent select-auto"
	>
		{text}
	</h1>
</div>
