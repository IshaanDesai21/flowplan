<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { toasts } from '$lib/stores/toast.js';

	let { form } = $props();
	
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign Up | FlowPlan</title>
</svelte:head>

<div class="min-h-screen bg-page flex items-center justify-center p-4">
	<div class="w-full max-w-md animate-scale-in">
		<div class="text-center mb-8">
			<div class="inline-flex h-12 w-12 rounded-xl bg-[var(--color-accent)] items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
			</div>
			<h1 class="text-2xl font-bold tracking-tight">Create an account</h1>
			<p class="text-secondary mt-2">Start organizing your life with FlowPlan</p>
		</div>

		<Card padding="lg">
			<form 
				method="POST" 
				action="?/signup"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'failure') {
							toasts.error(result.data?.message || 'Signup failed');
						} else if (result.type === 'redirect') {
							toasts.success('Account created successfully!');
						}
						await update();
					};
				}}
				class="space-y-4"
			>
				{#if form?.message}
					<div class="p-3 rounded-md bg-[var(--color-danger-light)] text-[var(--color-danger)] text-sm mb-4">
						{form.message}
					</div>
				{/if}

				<Input 
					label="Full Name" 
					name="name" 
					type="text" 
					placeholder="John Doe" 
					required 
					disabled={loading}
				/>

				<Input 
					label="Email" 
					name="email" 
					type="email" 
					placeholder="you@example.com" 
					required 
					disabled={loading}
				/>
				
				<Input 
					label="Password" 
					name="password" 
					type="password" 
					placeholder="••••••••" 
					required 
					disabled={loading}
				/>

				<Button type="submit" class="w-full mt-2" disabled={loading}>
					{loading ? 'Creating account...' : 'Sign Up'}
				</Button>
			</form>

			<div class="mt-6 flex items-center justify-between gap-4">
				<div class="h-px flex-1 bg-default"></div>
				<span class="text-xs text-tertiary uppercase font-medium">Or</span>
				<div class="h-px flex-1 bg-default"></div>
			</div>

			<div class="mt-6">
				<Button variant="outline" type="button" class="w-full" onclick={() => window.location.href = '/api/auth/google'}>
					<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
					Continue with Google
				</Button>
			</div>
		</Card>

		<p class="mt-8 text-center text-sm text-secondary">
			Already have an account? 
			<a href="/login" class="font-medium text-[var(--color-accent)] hover:underline">Log in</a>
		</p>
	</div>
</div>
