<script lang="ts">
    import "../app.css";

    import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
    import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";
    import UserButton from "clerk-sveltekit/client/UserButton.svelte";
    import SignInButton from "clerk-sveltekit/client/SignInButton.svelte";

    import { onMount, onDestroy } from "svelte";
    import { io, Socket } from "socket.io-client";

    import * as canvi from "$lib/canvi";
    import * as ascii from "$lib/ascii";
    import * as menus from "$lib/menus";

    let canvas: HTMLCanvasElement;

    let frame: string[][];
    let clock: ReturnType<typeof setInterval>;
    let socket: Socket;

    onMount(() => {
        socket = io("ws://localhost:3000/", {
            reconnectionDelayMax: 10000,
        });

        if (!canvas) {
            throw new Error("Canvas not found");
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("2d context not supported");
        }

        canvas.width = 1500 * 1.5;
        canvas.height = 750 * 1.5;

        const size = 25;
        const charsPerRow = Math.floor(canvas.width / (size / 1.67)) - 1;
        const charsPerCol = Math.floor(canvas.height / size);

        frame = menus.start(charsPerRow, charsPerCol)

        let counter = 0
        clock = setInterval(() => {

            frame = canvi.place(
                frame,
                counter.toString(),
                0,
                0,
                false, 
            );

            canvi.update(canvas, ctx, frame);
            counter++

        }, 1000 / 30);
    });

    onDestroy(() => {
        if (clock) {
            clearInterval(clock);
            console.log("Clock cleared");
        }

        if (socket) {
            socket.disconnect();
            console.log("Socket disconnected");
        }

        if (canvas) {
            canvas.remove();
            console.log("Canvas removed");
        }
    });
</script>

<div class="w-screen h-screen flex place-items-center">
    <div class="w-[1500px] min-w-[1500px] mx-auto flex flex-col gap-4">
        <div class="flex text-white justify-between place-items-center h-8">
            <h1 class="text-center">ASCII RPG</h1>

            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
                <SignInButton />
            </SignedOut>
        </div>

        <canvas
            bind:this={canvas}
            class="w-[1500px] h-[775px] min-w-[1500px] min-h-[775px] mx-auto "
        />
    </div>
</div>
