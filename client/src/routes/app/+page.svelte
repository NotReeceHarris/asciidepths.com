<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import { connect, isOnline } from '$lib/socket';
	import type { Socket } from 'socket.io-client';
	import { draw, move } from '$lib/canvas';

	let data = $props();
	let socket: Socket;
	let canvas: HTMLCanvasElement | undefined = $state();

	let authenticated = $state(false);
	let connected = $state(false);
	let supported = $state(false);
	let online = $state(false);
	let loading = $state(true);

	let myUsername = $state('');
	let location = $state(null);
	let map: {background: string,highlight: string,floor: string,foreground: string} = $state({background: '',highlight: '',floor: '',foreground: ''});

	let posx = $state(0);
	let posy = $state(0);

	let users_in_location: {
		[username: string]: {
			x: number,
			y: number
		}
	} = $state({});

	function isSupported(): boolean {
		const canvas = document.createElement('canvas');
		return 'WebSocket' in window || 'MozWebSocket' in window && !!canvas.getContext;
	};
	
	function handleResize() {
		if (!supported || !authenticated || !connected || !canvas) return;
		draw(canvas, map, users_in_location, posx, posy);
	}

	function on_key_down(event: KeyboardEvent) {
		if (!supported || !authenticated || !connected || !canvas) return;

		if (['w', 'ArrowUp'].includes(event.key)) {
			posy -= 1;
			socket.emit('move', { x: 0, y: -1 });
			return draw(canvas, map, users_in_location, posx, posy);
		}

		if (['s', 'ArrowDown'].includes(event.key)) {
			posy += 1;
			socket.emit('move', { x: 0, y: 1 });
			return draw(canvas, map, users_in_location, posx, posy);
		}

		if (['a', 'ArrowLeft'].includes(event.key)) {
			posx -= 1;
			socket.emit('move', { x: -1, y: 0 });
			return draw(canvas, map, users_in_location, posx, posy);
		}

		if (['d', 'ArrowRight'].includes(event.key)) {
			posx += 1;
			socket.emit('move', { x: 1, y: 0 });
			return draw(canvas, map, users_in_location, posx, posy);
		}
    }

	function handleCanvasClick(event: MouseEvent) {
		if (!supported || !authenticated || !connected || !canvas) return;

		// Get the bounding rectangle of the canvas
		const rect = canvas.getBoundingClientRect();

		// Calculate the click coordinates relative to the canvas
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;

		const pos = move(x, y, map.floor);

		if (!pos) return;

		posx = pos.x;
		posy = pos.y;

		draw(canvas, map, users_in_location, posx, posy);
	}

	onMount(async (): Promise<any> => {

		supported = isSupported();
		if (!supported) return console.error('WebSockets are not supported');

		online = await isOnline();
		loading = online
		if (!online) return console.error('Servers are offline');
		loading = false;
		
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

				if (!canvas) return;

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

		// Used for responsive canvas 
		window.addEventListener('resize', handleResize);

        return () => {
			window.removeEventListener('resize', handleResize);
            socket.disconnect();
        };
    });
</script>  

<svelte:window
    on:keydown={on_key_down}
/>

{#if loading}

	<div class="bg-black w-screen h-screen text-white flex items-center justify-center">
		Loading...
	</div>

{:else}

	{#if supported}

		{#if online}

			{#if connected && authenticated}
				<div class="absolute text-xs opacity-40 bottom-0 left-0 p-2 text-left flex flex-col select-none">
					<span class="{connected ? 'text-green-400' : 'text-red-400'}">{connected ? 'connected' : 'disconnected'}</span>
					<span class="{authenticated ? 'text-green-400' : 'text-red-400'}">{authenticated ? 'authenticated' : 'unauthenticated'}</span>
					<span class="text-white">asciidepths.com</span>
					{#if myUsername}<span class="text-white">user: {myUsername}</span>{/if}
					{#if location}<span class="text-white">map: {location}</span>{/if}
				</div>

				<canvas bind:this={canvas} onclick="{handleCanvasClick}" class="w-screen h-screen"></canvas>
			{:else}

				{#if !connected}
					<div class="bg-black w-screen h-screen text-white flex items-center justify-center">
						Connecting...
					</div>
				{:else if !authenticated}
					<div class="bg-black w-screen h-screen text-white flex items-center justify-center">
						Authenticating...
					</div>
				{:else}
					<div class="bg-black w-screen h-screen text-white flex items-center justify-center">
						Unknown error
					</div>
				{/if}

			{/if}

		{:else}

			<div class="bg-black w-screen h-screen text-white flex items-center justify-center">
				Servers are offline
			</div>

		{/if}

	{:else}

		<div class="bg-black w-screen h-screen text-white flex items-center justify-center">
			Your browser is not supported
		</div>

	{/if}

{/if}