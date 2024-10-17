<script lang="ts">

    import { onMount } from 'svelte';
    import { init } from '$lib'
    
    let canvas: HTMLCanvasElement;

    onMount(() => {
        init(canvas)
    });

</script>

<canvas bind:this={canvas} style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;"></canvas>