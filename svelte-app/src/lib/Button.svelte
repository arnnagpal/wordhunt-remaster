<script lang="ts">
	import { goto } from '$app/navigation';
	import { type Props } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';

	export let onclickEvent = () => {
		if (redirectTo) {
			goto(redirectTo, { replaceState: true });
		}
	};
	export let text: string;
	export let redirectTo: string | undefined = undefined;

	export let formaction: string | undefined = undefined;

	let className: Props['class'] = undefined;
	export { className as class };
</script>

<button
	class={cn(
		'mt-4 bg-[#A4E593] transition-all duration-200 ease-in-out hover:bg-[#8dde78] text-gray-900 text-xl font-bold py-3 px-10 rounded shadow-xl',
		className
	)}
	{formaction}
	on:click={onclickEvent}
>
	{text}
</button>
