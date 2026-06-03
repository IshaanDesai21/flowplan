<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Login failed';
				loading = false;
				return;
			}
			goto('/dashboard');
		} catch {
			error = 'Network error. Please try again.';
			loading = false;
		}
	}

	async function handleDemo() {
		loading = true;
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Sign In — FlowPlan</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-container animate-scale-in">
		<a href="/" class="back-link">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
			Back to home
		</a>

		<a href="/" class="auth-brand">
			<svg width="36" height="36" viewBox="0 0 32 32" fill="none">
				<rect width="32" height="32" rx="8" fill="var(--color-accent)" />
				<path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
			</svg>
			<span>FlowPlan</span>
		</a>

		<h1>Welcome back</h1>
		<p class="auth-subtitle">Sign in to your account to continue</p>

		{#if error}
			<div class="auth-error">{error}</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<Input label="Email" type="email" placeholder="you@example.com" bind:value={email} required />
			<div style="height:0.75rem"></div>
			<Input label="Password" type="password" placeholder="••••••••" bind:value={password} required />
			<div style="height:1.5rem"></div>
			<Button variant="primary" size="lg" type="submit" disabled={loading} class="w-full">
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</form>

		<div class="auth-divider">
			<span>or</span>
		</div>

		<button class="demo-btn" onclick={handleDemo} disabled={loading}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			Try Demo (no account needed)
		</button>

		<p class="auth-footer">
			Don't have an account? <a href="/register">Sign up</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
		background: var(--color-bg);
	}
	.back-link {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		text-decoration: none;
		margin-bottom: 1.5rem;
		transition: color 0.15s;
		align-self: flex-start;
	}
	.back-link:hover { color: var(--color-text); }
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
	.auth-brand span {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
	}
	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
		color: var(--color-text);
	}
	.auth-subtitle {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		margin: 0 0 1.5rem;
	}
	.auth-error {
		background: var(--color-danger-light);
		color: var(--color-danger);
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		font-size: 0.85rem;
		margin-bottom: 1rem;
		border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
	}
	.auth-divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 1.5rem 0;
	}
	.auth-divider::before,
	.auth-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}
	.auth-divider span {
		font-size: 0.8rem;
		color: var(--color-text-tertiary);
	}
	.demo-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.demo-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-text);
		background: var(--color-surface-hover);
	}
	.demo-btn:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}
	.auth-footer a {
		color: var(--color-accent);
		text-decoration: none;
		font-weight: 600;
	}
	.auth-footer a:hover {
		text-decoration: underline;
	}
</style>
