<script lang="ts">
    import '../../app.css';
	import SignUp from 'clerk-sveltekit/client/SignUp.svelte'
    import { dark } from '@clerk/themes'
</script>

<div class="w-screen h-screen flex place-items-center">
	<div class="mx-auto w-min">
        <SignUp redirectUrl="/" appearance={{
            baseTheme: dark,
        }} />
    </div>
</div>