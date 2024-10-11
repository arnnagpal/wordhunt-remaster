<script lang="ts">
    import {Input} from "$lib/components/ui/input";
    import {formSchema, type FormSchema} from "./schema";
    import {type Infer, superForm, type SuperValidated,} from "sveltekit-superforms";
    import {zodClient} from "sveltekit-superforms/adapters";
    import WaitingSpinner from "$lib/WaitingSpinner.svelte";

    import * as Form from "$lib/components/ui/form";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    export let data: SuperValidated<Infer<FormSchema>>;

    const form = superForm(data, {
        validators: zodClient(formSchema),
        onError({result}) {

            if (result.status === 400) {
                const json = JSON.parse(result.error.message);
                errorDialog = true;
                errorMessage = json.message;
            }
        },
        delayMs: 500,
        timeoutMs: 8000
    });

    const {form: formData, enhance, delayed, timeout, submitting} = form;

    let errorDialog = false;
    let errorMessage = "";
</script>


<form action="?/login" class="flex flex-col justify-center items-center" method="POST" use:enhance>
    <Form.Field {form} name="username">
        <Form.Control let:attrs>
            <Form.Label>Username</Form.Label>
            <Input {...attrs} bind:value={$formData.username} class="w-[70vw] max-w-xs"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>
    <Form.Field {form} name="password">
        <Form.Control let:attrs>
            <Form.Label>Password</Form.Label>
            <Input {...attrs} bind:value={$formData.password} class="w-[70vw] max-w-xs"
                   type="password"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>

    <Form.Button class="mt-4 bg-[#A4E593]
                      transition-all duration-200 ease-in-out
                      hover:bg-[#8dde78] text-gray-900 text-xl
                      font-bold py-3 px-10 rounded shadow-xl mb-5">Login
    </Form.Button>

    <AlertDialog.Root bind:open={errorDialog}>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>Error</AlertDialog.Title>
                <AlertDialog.Description>
                    {errorMessage}
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Action>OK</AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>

    {#if $delayed || $timeout || $submitting}
        <WaitingSpinner/>
    {/if}
</form>