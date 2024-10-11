<script lang="ts">
    import {superForm} from "sveltekit-superforms";
    import WaitingSpinner from "$lib/WaitingSpinner.svelte";

    import * as Form from "$lib/components/ui/form";
    import {DoorClosed, DoorOpen} from "lucide-svelte";

    export let data: any;

    const form = superForm(data.form, {
        delayMs: 500,
        timeoutMs: 8000
    });

    let hovering = false;

    const {enhance, delayed, timeout, submitting} = form;
</script>


<form action="?/exit" class="flex flex-col justify-center items-center" method="POST" use:enhance>
    <Form.Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-4xl ml-5
                      font-bold rounded" variant="ghost">
        {#if hovering}
            <DoorOpen />
        {:else}
            <DoorClosed />
        {/if}
    </Form.Button>

    {#if $delayed || $timeout || $submitting}
        <WaitingSpinner />
    {/if}
</form>