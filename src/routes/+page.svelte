<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';

	let loading = $state('');

	async function handleDemo() {
		loading = 'demo';
		try {
			const res = await fetch('/api/auth/demo', { method: 'POST' });
			if (res.ok) {
				goto('/dashboard');
			}
		} catch {
			loading = '';
		}
	}
</script>

<svelte:head>
	<title>FlowPlan — Intelligent Productivity Platform</title>
	<meta
		name="description"
		content="Calendar, tasks, AI assistant, and analytics — all in one beautiful workspace."
	/>
</svelte:head>

<div class="landing-page">
	<!-- Animated background -->
	<div class="landing-bg">
		<div class="gradient-orb orb-1"></div>
		<div class="gradient-orb orb-2"></div>
		<div class="gradient-orb orb-3"></div>
		<div class="grid-overlay"></div>
	</div>

	<!-- Navbar -->
	<nav class="landing-nav">
		<div class="nav-inner">
			<div class="nav-brand">
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
					<rect width="32" height="32" rx="8" fill="var(--color-accent)" />
					<path
						d="M8 12h16M8 16h12M8 20h8M22 18l4 4-4 4"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span class="brand-text">FlowPlan</span>
			</div>
			<div class="nav-links">
				<a href="/login" class="nav-link">Sign In</a>
				<a href="/register" class="nav-btn">Get Started</a>
			</div>
		</div>
	</nav>

	<!-- Hero -->
	<section class="hero">
		<div class="hero-content animate-fade-in">
			<div class="hero-badge">
				<span class="badge-dot"></span>
				Intelligent Productivity
			</div>
			<h1 class="hero-title">
				Your day,<br />
				<span class="hero-gradient">brilliantly organized.</span>
			</h1>
			<p class="hero-subtitle">
				Calendar, tasks, checklists, meetings, and an AI assistant — unified in one stunning
				workspace. Plan smarter, accomplish more.
			</p>
			<div class="hero-actions">
				<a href="/register" class="hero-btn-primary">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
					Start Free
				</a>
				<button
					class="hero-btn-secondary"
					onclick={handleDemo}
					disabled={loading === 'demo'}
				>
					{#if loading === 'demo'}
						<span class="spinner"></span>
						Loading demo...
					{:else}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 3 19 12 5 21 5 3" />
						</svg>
						Try Demo
					{/if}
				</button>
			</div>
		</div>

		<!-- Hero visual -->
		<div class="hero-visual animate-slide-in-up">
			<div class="app-preview">
				<div class="preview-bar">
					<div class="preview-dots">
						<span></span><span></span><span></span>
					</div>
					<span class="preview-title">FlowPlan Dashboard</span>
					<div></div>
				</div>
				<div class="preview-content">
					<div class="preview-sidebar">
						<div class="ps-item active">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
							Dashboard
						</div>
						<div class="ps-item">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
							Calendar
						</div>
						<div class="ps-item">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
							Tasks
						</div>
						<div class="ps-item">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
							AI Assistant
						</div>
					</div>
					<div class="preview-main">
						<div class="preview-card card-stat">
							<div class="stat-icon" style="background:rgba(99,102,241,0.15);color:#818cf8;">📊</div>
							<div><div class="stat-val">87%</div><div class="stat-label">Productivity</div></div>
						</div>
						<div class="preview-card card-stat">
							<div class="stat-icon" style="background:rgba(34,197,94,0.15);color:#4ade80;">✅</div>
							<div><div class="stat-val">12</div><div class="stat-label">Completed</div></div>
						</div>
						<div class="preview-card card-event">
							<div class="ev-dot" style="background:#6366f1;"></div>
							<div><div class="ev-title">Team Standup</div><div class="ev-time">9:00 AM</div></div>
						</div>
						<div class="preview-card card-event">
							<div class="ev-dot" style="background:#22c55e;"></div>
							<div><div class="ev-title">Focus Time</div><div class="ev-time">10:00 AM</div></div>
						</div>
						<div class="preview-card card-event">
							<div class="ev-dot" style="background:#f97316;"></div>
							<div><div class="ev-title">Lunch Meeting</div><div class="ev-time">12:00 PM</div></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="features">
		<div class="features-grid">
			<div class="feature-card animate-fade-in">
				<div class="feature-icon" style="background: rgba(99,102,241,0.12); color: #818cf8;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
					</svg>
				</div>
				<h3>Smart Calendar</h3>
				<p>Day, week, and month views with time blocking, recurring events, and drag-and-drop scheduling.</p>
			</div>
			<div class="feature-card animate-fade-in" style="animation-delay: 80ms;">
				<div class="feature-icon" style="background: rgba(34,197,94,0.12); color: #4ade80;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
					</svg>
				</div>
				<h3>Task Management</h3>
				<p>Kanban boards, priority levels, status tracking, and powerful list views for maximum productivity.</p>
			</div>
			<div class="feature-card animate-fade-in" style="animation-delay: 160ms;">
				<div class="feature-icon" style="background: rgba(168,85,247,0.12); color: #c084fc;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z" /><circle cx="12" cy="10" r="3" />
					</svg>
				</div>
				<h3>AI Assistant</h3>
				<p>Powered by Gemini — get intelligent scheduling suggestions, task breakdowns, and productivity insights.</p>
			</div>
			<div class="feature-card animate-fade-in" style="animation-delay: 240ms;">
				<div class="feature-icon" style="background: rgba(251,191,36,0.12); color: #fbbf24;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
				</div>
				<h3>Meetings & Notes</h3>
				<p>Track meetings with participants, agendas, action items, and notes — all connected to your calendar.</p>
			</div>
			<div class="feature-card animate-fade-in" style="animation-delay: 320ms;">
				<div class="feature-icon" style="background: rgba(56,189,248,0.12); color: #38bdf8;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
					</svg>
				</div>
				<h3>Analytics</h3>
				<p>Visualize your productivity patterns with charts, completion rates, and streak tracking.</p>
			</div>
			<div class="feature-card animate-fade-in" style="animation-delay: 400ms;">
				<div class="feature-icon" style="background: rgba(248,113,113,0.12); color: #f87171;">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
					</svg>
				</div>
				<h3>6 Beautiful Themes</h3>
				<p>Dark, Light, Midnight, Forest, Slate, and Cream — each crafted for visual comfort and style.</p>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="landing-footer">
		<p>Built with ❤️ using SvelteKit, Prisma, and Gemini AI</p>
	</footer>
</div>

<style>
	.landing-page {
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
	}

	/* ---- Background ---- */
	.landing-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
	}
	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		opacity: 0.3;
	}
	.orb-1 {
		width: 600px;
		height: 600px;
		background: var(--color-accent);
		top: -200px;
		right: -100px;
		animation: float 20s ease-in-out infinite;
	}
	.orb-2 {
		width: 400px;
		height: 400px;
		background: #a855f7;
		bottom: -100px;
		left: -100px;
		animation: float 25s ease-in-out infinite reverse;
	}
	.orb-3 {
		width: 300px;
		height: 300px;
		background: #22c55e;
		top: 50%;
		left: 50%;
		animation: float 30s ease-in-out infinite 5s;
	}
	.grid-overlay {
		position: absolute;
		inset: 0;
		background-image: linear-gradient(var(--color-border-light) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-border-light) 1px, transparent 1px);
		background-size: 64px 64px;
		opacity: 0.3;
	}
	@keyframes float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(30px, -50px) scale(1.05); }
		66% { transform: translate(-20px, 20px) scale(0.95); }
	}

	/* ---- Nav ---- */
	.landing-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(16px);
		background: color-mix(in srgb, var(--color-bg) 80%, transparent);
		border-bottom: 1px solid var(--color-border-light);
	}
	.nav-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.875rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.brand-text {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.nav-link {
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}
	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}
	.nav-btn {
		background: var(--color-accent);
		color: white;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}
	.nav-btn:hover {
		background: var(--color-accent-hover);
		transform: translateY(-1px);
	}

	/* ---- Hero ---- */
	.hero {
		max-width: 1200px;
		margin: 0 auto;
		padding: 5rem 1.5rem 3rem;
		text-align: center;
	}
	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-accent-light);
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.375rem 1rem;
		border-radius: var(--radius-full);
		margin-bottom: 1.5rem;
		letter-spacing: 0.02em;
	}
	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-accent);
		animation: pulse-subtle 2s infinite;
	}
	.hero-title {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.03em;
		margin: 0 0 1.25rem;
		color: var(--color-text);
	}
	.hero-gradient {
		background: linear-gradient(135deg, var(--color-accent), #a855f7, #ec4899);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	.hero-subtitle {
		font-size: 1.2rem;
		color: var(--color-text-secondary);
		max-width: 640px;
		margin: 0 auto 2.5rem;
		line-height: 1.7;
	}
	.hero-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.hero-btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-accent);
		color: white;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 600;
		padding: 0.875rem 2rem;
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
		box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
	}
	.hero-btn-primary:hover {
		background: var(--color-accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
	}
	.hero-btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		font-size: 1rem;
		font-weight: 600;
		padding: 0.875rem 2rem;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.hero-btn-secondary:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-accent);
		transform: translateY(-2px);
	}
	.hero-btn-secondary:disabled {
		opacity: 0.7;
		cursor: wait;
	}
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ---- App Preview ---- */
	.hero-visual {
		margin-top: 3.5rem;
		perspective: 1000px;
	}
	.app-preview {
		max-width: 900px;
		margin: 0 auto;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		overflow: hidden;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px var(--color-border-light);
	}
	.preview-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
	}
	.preview-dots {
		display: flex;
		gap: 6px;
	}
	.preview-dots span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-border);
	}
	.preview-dots span:nth-child(1) { background: #ef4444; }
	.preview-dots span:nth-child(2) { background: #eab308; }
	.preview-dots span:nth-child(3) { background: #22c55e; }
	.preview-title {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		font-weight: 500;
	}
	.preview-content {
		display: flex;
		min-height: 280px;
	}
	.preview-sidebar {
		width: 180px;
		border-right: 1px solid var(--color-border);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.ps-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		color: var(--color-text-tertiary);
		transition: all var(--transition-fast);
	}
	.ps-item.active {
		background: var(--color-accent-light);
		color: var(--color-accent);
		font-weight: 600;
	}
	.preview-main {
		flex: 1;
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		align-content: start;
	}
	.preview-card {
		padding: 0.75rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border-light);
		background: var(--color-bg);
	}
	.card-stat {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.stat-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
	}
	.stat-val {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
	}
	.stat-label {
		font-size: 0.7rem;
		color: var(--color-text-tertiary);
	}
	.card-event {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.ev-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.ev-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text);
	}
	.ev-time {
		font-size: 0.7rem;
		color: var(--color-text-tertiary);
	}

	/* ---- Features ---- */
	.features {
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem 1.5rem 5rem;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.25rem;
	}
	.feature-card {
		padding: 1.75rem;
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		background: color-mix(in srgb, var(--color-surface) 60%, transparent);
		backdrop-filter: blur(8px);
		transition: all var(--transition-base);
	}
	.feature-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
	}
	.feature-icon {
		width: 52px;
		height: 52px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
	}
	.feature-card h3 {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: var(--color-text);
	}
	.feature-card p {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	/* ---- Footer ---- */
	.landing-footer {
		text-align: center;
		padding: 2rem 1.5rem;
		border-top: 1px solid var(--color-border-light);
		color: var(--color-text-tertiary);
		font-size: 0.85rem;
	}

	/* ---- Responsive ---- */
	@media (max-width: 768px) {
		.preview-sidebar { display: none; }
		.preview-main { grid-template-columns: 1fr; }
		.features-grid { grid-template-columns: 1fr; }
	}
</style>
