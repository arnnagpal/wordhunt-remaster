<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import WaitingSpinner from '$lib/WaitingSpinner.svelte';
	import { fade } from 'svelte/transition';

	import * as Form from '$lib/components/ui/form';
	import { LogOut } from 'lucide-svelte';

	export let data: any;

	const form = superForm(data.form, {
		delayMs: 500,
		timeoutMs: 8000
	});

	const { enhance, delayed, timeout, submitting } = form;
</script>

<form action="?/logout" class="flex flex-col justify-center items-center" method="POST" use:enhance>
	<Form.Button
		class="rotate-180 transition-all duration-200 ease-in-out
                 text-gray-900 text-4xl
                      font-bold rounded"
		variant="ghost"
	>
		<LogOut />
	</Form.Button>

	{#if $delayed || $timeout || $submitting}
		<WaitingSpinner />
	{/if}
</form>
