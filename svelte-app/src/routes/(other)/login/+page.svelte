<script lang="ts">
    import {Label} from "$lib/components/ui/label";
    import type {PageData} from "./$types";
    import LoginForm from "$lib/components/login/LoginForm.svelte";
    import {Button} from "$lib/components/ui/button";

    export let data: PageData;
</script>

<svelte:head>
    <title>Word Hunt - Login</title>
    <meta content="Word Hunt - Login" name="description"/>
</svelte:head>

<div class="flex justify-center items-center">
    <div class="flex justify-center items-center h-screen w-[70vw]">
        <div class="flex justify-center flex-col bg-white rounded-lg shadow-2xl p-2 pl-6 pr-6">
            <div class="flex items-center flex-nowrap flex-grow pb-5 pt-2">

                <Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-4xl
                      font-bold rounded mt-2" href="/" variant="secondary"> &#x2190
                </Button>

                <Label class="text-4xl font-bold text-center flex-grow mr-16">Login</Label>
            </div>

            <LoginForm data={data.form}/>
        </div>

    </div>
</div>
