<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { connect } from '$lib/socket';
	import type { Socket } from 'socket.io-client';
	import { draw } from '$lib/canvas';

	let data = $props();
	let socket: Socket;
	let canvas: HTMLCanvasElement;

	let authenticated = $state(false);
	let connected = $state(false);

	let myUsername = $state('');
	let location = $state(null);
	let map = $state('');

	let posx = $state(0);
	let posy = $state(0);

	let users_in_location: {
		[username: string]: {
			x: number,
			y: number
		}
	} = $state({});

	function on_key_down(event: KeyboardEvent) {
		if (event.key === 'w') {
			posy -= 1;
			socket.emit('move', { x: 0, y: -1 });
			draw(canvas, map, users_in_location, posx, posy);
		}

		if (event.key === 's') {
			posy += 1;
			socket.emit('move', { x: 0, y: 1 });
			draw(canvas, map, users_in_location, posx, posy);
		}

		if (event.key === 'a') {
			posx -= 1;
			socket.emit('move', { x: -1, y: 0 });
			draw(canvas, map, users_in_location, posx, posy);
		}

		if (event.key === 'd') {
			posx += 1;
			socket.emit('move', { x: 1, y: 0 });
			draw(canvas, map, users_in_location, posx, posy);
		}
    }

	onMount(() => {
        socket = connect(data.data.session);

		socket.on('connect', () => {
			connected = socket.connected;
		})

		socket.on('disconnect', () => {
			authenticated = false;
			connected = socket.connected;
		})

		socket.on('error', (error) => {
			connected = socket.connected;
		})

		socket.on('message', (packet) => {

			connected = socket.connected;
			const { event, data } = packet;

			if (event === 'authenticated') {
				authenticated = true;
				myUsername = data.username;
				return;
			}

			if (event === 'location') {
				location = data.location;
				map = data.map;
				return;
			}

			if (event === 'position') {
				posx = data.x;
				posy = data.y;
				return;
			}

			if (event === 'users_in_location_update') {

				for (let i = 0; i < data.users.length; i++) {
					const {username, posx, posy} = data.users[i];

					if (username === myUsername) {
						continue;
					}

					if (!users_in_location[username]) {
						users_in_location[username] = {
							x: posx,
							y: posy
						}
					}

					if (users_in_location[username]) {
						users_in_location[username].x = posx;
						users_in_location[username].y = posy;
					}

					console.log(username, posx, posy);
				}

				draw(canvas, map, users_in_location, posx, posy);
				
				return;
			}

		});

        return () => {
            socket.disconnect();
        };
    });
</script>  

<svelte:window
    on:keypress={on_key_down}
/>

{#if connected && authenticated}
	<div class="absolute text-xs opacity-40 bottom-0 left-0 p-2 text-left flex flex-col select-none">
		<span class="{connected ? 'text-green-400' : 'text-red-400'}">{connected ? 'connected' : 'disconnected'}</span>
		<span class="{authenticated ? 'text-green-400' : 'text-red-400'}">{authenticated ? 'authenticated' : 'unauthenticated'}</span>
		{#if myUsername}
			<span class="text-white">@{myUsername}</span>
		{/if}
		{#if location}
			<span class="text-white">{location}</span>
		{/if}
	</div>

	<canvas bind:this={canvas} class="w-screen h-screen"></canvas>
{:else}

	{#if !connected}
		<div class="bg-black/85 w-screen h-screen text-white flex items-center justify-center">
			Connecting...
		</div>
	{:else if !authenticated}
		<div class="bg-black/85 w-screen h-screen text-white flex items-center justify-center">
			Authenticating...
		</div>
	{:else}
		<div class="bg-black/85 w-screen h-screen text-white flex items-center justify-center">
			Unknown error
		</div>
	{/if}
{/if}