<script lang="ts">
    import { goto } from '$app/navigation';
    import { PUBLIC_SERVER_ADDRESS } from '$env/static/public';
    import Cookies from 'js-cookie';
    import '../../app.css';

    let showing: string = $state('login');
    let errors: string[] = $state([]);

    let email: string = $state('');
    let username: string = $state('');
    let password: string = $state('');
    let remember: boolean = $state(false);

    function login() {

        errors = [];
        fetch(`${PUBLIC_SERVER_ADDRESS}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        })
        .then(res=>res.json())
        .then((res) => {
            if (res.success) {
                const session = `${res.username}:${res.session}`;
                Cookies.set('session', session, { ...( remember ? {expires: 7} : {} ), path: '/' });
                goto('/app');
            } else {
                errors = res.errors;
            }
        })
        .catch(() => {
            errors.push('An error occurred')
        })
    }

    function register() {
        errors = [];
        fetch(`${PUBLIC_SERVER_ADDRESS}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                username,
                password
            })
        })
        .then(res=>res.json())
        .then((res) => {
            if (res.success) {
                const session = res.session;
                Cookies.set('session', session, { ...( remember ? {expires: 7} : {} ), path: '/' });
                goto('/app');
            } else {
                errors = res.errors;
            }
        })
        .catch(() => {
            errors.push('An error occurred')
        })
    }

</script>

{#if showing === 'login'}
    <form class="flex flex-col gap-4 w-fit border p-4 m-4 rounded-md" onsubmit={(e) => {
        e.preventDefault();
        login();
    }}>

        <div class="flex flex-col gap-2">
            <label for="email">Email address</label>
            <input bind:value={email} type="email" id="email" name="email" required class="border-b">
        </div>

        <div class="flex flex-col gap-2">
            <label for="password">Password</label>
            <input bind:value={password} type="password" id="password" name="password" required class="border-b">
        </div>

        <div class="flex gap-2">
            <label for="remember">Remember me</label>
            <input bind:checked={remember} type="checkbox" id="remember" name="remember" class="border-b">
        </div>

        <button class="text-left border rounded-md p-2">
            Login
        </button>

        <button 
            type="button"
            class="text-left underline" 
            onclick={() => {
                showing = 'register'
            }}
        >
            Create an account
        </button>

    </form>
{:else}
    <form class="flex flex-col gap-4 w-fit border p-4 m-4 rounded-md" onsubmit={(e) => {
        e.preventDefault();
        register();
    }}>

        <div class="flex flex-col gap-2">
            <label for="email">Email address</label>
            <input bind:value={email} type="email" id="email" name="email" required class="border-b">
        </div>

        <div class="flex flex-col gap-2">
            <label for="username">Username</label>
            <input bind:value={username} type="text" id="username" name="username" required class="border-b">
        </div>

        <div class="flex flex-col gap-2">
            <label for="password">Password</label>
            <input bind:value={password} type="password" id="password" name="password" required class="border-b">
        </div>

        <div class="flex gap-2">
            <label for="remember">Remember me</label>
            <input bind:checked={remember} type="checkbox" id="remember" name="remember" class="border-b">
        </div>

        <button class="text-left border rounded-md p-2">
            Register
        </button>

        <button 
            type="button"
            class="text-left underline" 
            onclick={() => {
                showing = 'login'
            }}
        >
            Already have an account?
        </button>

    </form>
{/if}

{#if errors.length > 0}
    <div class="flex flex-col gap-2 m-4">
        {#each errors as error}
            <p class="text-red-500">{error}</p>
        {/each}
    </div>
{/if}