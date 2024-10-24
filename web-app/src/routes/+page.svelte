<script lang="ts">
    import "../app.css";

    import { onMount, onDestroy } from "svelte";
    import { AppGlobals } from "$lib/globals";
    import { start } from "$lib/index";

    let loader: HTMLSpanElement;
    let canvas: HTMLCanvasElement;
    let globals: AppGlobals;

    onMount(() => {
        if (!canvas) throw new Error("Canvas not found");
        globals = new AppGlobals(canvas);
        start(globals);
    });

    onDestroy(() => {
        if (globals) {
            globals.stopClock();
            globals.disconnect();
        }

        if (canvas) {
            canvas.remove();
        }
    });
</script>

<div class="w-screen h-screen max-w-screen max-h-screen flex place-items-center">
    <canvas
        bind:this={canvas}
        class="mx-auto z-20 p-4"
        style="max-width: 100vw; max-height: 100vh; aspect-ratio: 2 / 1;"
    />
    <span
        class="absolute top-[50vh] left-[50vw]" 
        style="transform: translateX(-50%) translateY(-50%);"
    >
        Loading...
    </span>
</div>
