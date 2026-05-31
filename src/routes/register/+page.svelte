<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Registration failed';
				loading = false;
				return;
			}
			goto('/dashboard');
		} catch {
			error = 'Network error. Please try again.';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Account — FlowPlan</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-bg">
		<div class="gradient-orb orb-1"></div>
		<div class="gradient-orb orb-2"></div>
	</div>

	<div class="auth-container animate-scale-in">
		<a href="/" class="auth-brand">
			<svg width="36" height="36" viewBox="0 0 32 32" fill="none">
				<rect width="32" height="32" rx="8" fill="var(--color-accent)" />
				<path d="M8 12h16M8 16h12M8 20h8M22 18l4 4-4 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span>FlowPlan</span>
		</a>

		<h1>Create your account</h1>
		<p class="auth-subtitle">Start organizing your life with FlowPlan</p>

		{#if error}
			<div class="auth-error">{error}</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<Input label="Full Name" placeholder="John Doe" bind:value={name} required />
			<div style="height:0.75rem"></div>
			<Input label="Email" type="email" placeholder="you@example.com" bind:value={email} required />
			<div style="height:0.75rem"></div>
			<Input label="Password" type="password" placeholder="At least 8 characters" bind:value={password} required />
			<div style="height:0.75rem"></div>
			<Input label="Confirm Password" type="password" placeholder="••••••••" bind:value={confirmPassword} required />
			<div style="height:1.5rem"></div>
			<Button variant="primary" size="lg" type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating account...' : 'Create Account'}
			</Button>
		</form>

		<p class="auth-footer">
			Already have an account? <a href="/login">Sign in</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
	}
	.auth-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
	}
	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(120px);
		opacity: 0.2;
	}
	.orb-1 { width: 500px; height: 500px; background: var(--color-accent); top: -150px; right: -100px; }
	.orb-2 { width: 400px; height: 400px; background: #a855f7; bottom: -100px; left: -100px; }
	.auth-container {
		width: 100%;
		max-width: 420px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: 2.5rem;
		box-shadow: var(--shadow-lg);
	}
	.auth-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		margin-bottom: 2rem;
	}
	.auth-brand span { font-size: 1.25rem; font-weight: 700; color: var(--color-text); }
	h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; color: var(--color-text); }
	.auth-subtitle { color: var(--color-text-secondary); font-size: 0.9rem; margin: 0 0 1.5rem; }
	.auth-error {
		background: var(--color-danger-light);
		color: var(--color-danger);
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		font-size: 0.85rem;
		margin-bottom: 1rem;
		border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
	}
	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}
	.auth-footer a { color: var(--color-accent); text-decoration: none; font-weight: 600; }
	.auth-footer a:hover { text-decoration: underline; }
</style>
