<script lang="ts">
    import {Circle3} from 'svelte-loading-spinners';
    import {fade} from "svelte/transition";
    // colors for each ball
    // color scheme is shades of green

    // ballTopLeft: '#00FF00',
    // ballTopRight: '#00CC00',
    // ballBottomLeft: '#009900',
    // ballBottomRight: '#006600',
</script>

<div in:fade class="z-50 fixed transform top-1/2
                left-1/2 translate-x-[-50%] translate-y-[-50%] w-screen
                h-screen self-center bg-gray-600 bg-opacity-50
                pointer-events-auto flex justify-center items-center
                select-none">
    <Circle3 ballBottomLeft="#009900"
             ballBottomRight="#006600" ballTopLeft="#00FF00"
             ballTopRight="#00CC00" size="100"/>
</div>
