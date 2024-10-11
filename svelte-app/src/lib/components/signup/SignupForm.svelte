<script lang="ts">
    import {Input} from "$lib/components/ui/input";
    import {Checkbox} from "$lib/components/ui/checkbox";
    import {formSchema, type FormSchema} from "./schema";
    import {type Infer, superForm, type SuperValidated,} from "sveltekit-superforms";
    import {zodClient} from "sveltekit-superforms/adapters";
    import WaitingSpinner from "$lib/WaitingSpinner.svelte";

    import * as Form from "$lib/components/ui/form";

    export let data: SuperValidated<Infer<FormSchema>>;

    const form = superForm(data, {
        validators: zodClient(formSchema),
        onError({result}) {
            console.log(result.error.message);
        },
        delayMs: 500,
        timeoutMs: 8000
    });

    const {form: formData, enhance, delayed, timeout, submitting} = form;
</script>

<form action="?/signup" class="flex flex-col justify-center items-center" method="POST" use:enhance>
    <Form.Field {form} name="display_name">
        <Form.Control let:attrs>
            <Form.Label>Display Name</Form.Label>
            <Input {...attrs} bind:value={$formData.display_name} class="w-[70vw] max-w-xs"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>
    <Form.Field {form} name="email">
        <Form.Control let:attrs>
            <Form.Label>Email</Form.Label>
            <Input {...attrs} bind:value={$formData.email} class="w-[70vw] max-w-xs"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>
    <Form.Field {form} name="username">
        <Form.Control let:attrs>
            <Form.Label>Username</Form.Label>
            <Form.Description>This field will be your unique id - @example</Form.Description>
            <Input {...attrs} bind:value={$formData.username} class="w-[70vw] max-w-xs"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>

    <Form.Field {form} name="password">
        <Form.Control let:attrs>
            <Form.Label>Password</Form.Label>
            <Input {...attrs} bind:value={$formData.password} class="w-[70vw] max-w-xs" placeholder="Password"
                   type="password"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>

    <Form.Field {form} name="confirm_password">
        <Form.Control let:attrs>
            <Input {...attrs} bind:value={$formData.confirm_password} class="w-[70vw] max-w-xs"
                   placeholder="Confirm password"
                   type="password"/>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>

    <Form.Field class="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-4" {form}
                name="accept_terms">
        <Form.Control let:attrs>
            <Checkbox {...attrs} bind:checked={$formData.accept_terms}/>
            <div class="space-y-1 leading-none">
                <Form.Label>Accept terms and conditions</Form.Label>
            </div>
        </Form.Control>
        <Form.FieldErrors/>
    </Form.Field>

    <Form.Button class="mt-4 bg-[#A4E593]
                      transition-all duration-200 ease-in-out
                      hover:bg-[#8dde78] text-gray-900 text-xl
                      font-bold py-3 px-10 rounded shadow-xl mb-5">Register
    </Form.Button>

    {#if $delayed || $timeout || $submitting}
        <WaitingSpinner/>
    {/if}
</form>