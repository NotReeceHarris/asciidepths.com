<script lang="ts">
    import '../../app.css';
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte'
    import { dark } from '@clerk/themes'
</script>

<div class="w-screen h-screen flex place-items-center">
	<div class="mx-auto w-min">
        <SignIn redirectUrl="/" appearance={{
            baseTheme: dark,
        }} />
    </div>
</div>