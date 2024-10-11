<script lang="ts">
    import {Label} from "$lib/components/ui/label";
    import SignupForm from "$lib/components/signup/SignupForm.svelte";
    import type {PageData} from "./$types";
    import {Button} from "$lib/components/ui/button";

    export let data: PageData;
</script>

<svelte:head>
    <title>Word Hunt - Register</title>
    <meta content="Word Hunt - Register" name="description"/>
</svelte:head>

<div class="flex justify-center items-center">
    <div class="flex justify-center items-center h-screen w-[70vw]">
        <div class="flex justify-center flex-col bg-white rounded-lg shadow-2xl p-2 pl-6 pr-6">
            <div class="flex items-center flex-nowrap flex-grow pb-5 pt-2">

                <Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-4xl
                      font-bold rounded" href="/" variant="secondary"> &#x2190
                </Button>

                <Label class="text-4xl font-bold text-center flex-grow mr-12">Sign up</Label>
            </div>


            <SignupForm data={data.form}/>
        </div>

    </div>
</div>
