<script lang="ts">
	import { goto } from '$app/navigation';

	let loading = $state('');

	async function handleDemo() {
		loading = 'demo';
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>FlowPlan — Plan smarter. Work better.</title>
	<meta name="description" content="Calendar, tasks, checklists, and analytics — unified in one clean workspace." />
</svelte:head>

<div class="landing-page">
	<!-- Nav -->
	<nav class="landing-nav">
		<div class="nav-inner">
			<div class="nav-brand">
				<svg width="28" height="28" viewBox="0 0 32 32" fill="none">
					<rect width="32" height="32" rx="8" fill="var(--color-accent)" />
					<path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
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
		<div class="hero-left">
			<p class="hero-eyebrow">Productivity workspace</p>
			<h1 class="hero-title">Plan smarter.<br />Work better.</h1>
			<p class="hero-subtitle">
				Everything you need to stay on top of your day — calendar, tasks, checklists, and analytics — all in one place.
			</p>
			<div class="hero-actions">
				<a href="/register" class="hero-btn-primary">
					Get Started Free
				</a>
				<button class="hero-btn-secondary" onclick={handleDemo} disabled={loading === 'demo'}>
					{#if loading === 'demo'}
						<span class="spinner"></span>
						Loading...
					{:else}
						Try Demo
					{/if}
				</button>
			</div>
		</div>

		<!-- App Preview -->
		<div class="hero-right">
			<div class="app-preview">
				<div class="preview-bar">
					<div class="preview-dots">
						<span></span><span></span><span></span>
					</div>
					<span class="preview-title">FlowPlan</span>
					<div></div>
				</div>
				<div class="preview-content">
					<div class="preview-sidebar">
						<div class="ps-logo">
							<svg width="20" height="20" viewBox="0 0 32 32" fill="none">
								<rect width="32" height="32" rx="6" fill="var(--color-accent)" />
								<path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
							</svg>
						</div>
						<div class="ps-item active">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
							Dashboard
						</div>
						<div class="ps-item">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
							Calendar
						</div>
						<div class="ps-item">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
							Tasks
						</div>
						<div class="ps-item">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
							Analytics
						</div>
					</div>
					<div class="preview-main">
						<div class="preview-greeting">
							<div>
								<div class="pg-title">Good morning, Alex</div>
								<div class="pg-date">Tuesday, June 3</div>
							</div>
						</div>
						<div class="preview-stats">
							<div class="preview-stat">
								<div class="ps-val">12</div>
								<div class="ps-label">Completed</div>
							</div>
							<div class="preview-stat">
								<div class="ps-val">3</div>
								<div class="ps-label">Due today</div>
							</div>
							<div class="preview-stat">
								<div class="ps-val">87%</div>
								<div class="ps-label">Score</div>
							</div>
						</div>
						<div class="preview-events">
							<div class="preview-ev-label">Today's Schedule</div>
							<div class="preview-ev-row">
								<span class="preview-ev-time">9:00</span>
								<div class="preview-ev-bar" style="background:#6366f1"></div>
								<span class="preview-ev-name">Team Standup</span>
							</div>
							<div class="preview-ev-row">
								<span class="preview-ev-time">11:00</span>
								<div class="preview-ev-bar" style="background:#22c55e"></div>
								<span class="preview-ev-name">Focus Block</span>
							</div>
							<div class="preview-ev-row">
								<span class="preview-ev-time">1:00</span>
								<div class="preview-ev-bar" style="background:#f59e0b"></div>
								<span class="preview-ev-name">Lunch Meeting</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Divider -->
	<div class="section-divider">
		<span>Everything you need</span>
	</div>

	<!-- Features -->
	<section class="features">
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon" style="background: color-mix(in srgb, #6366f1 12%, transparent); color: #818cf8;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Calendar</h3>
					<p>Day, week, and month views with event creation, time blocking, and agenda view.</p>
				</div>
			</div>
			<div class="feature-card">
				<div class="feature-icon" style="background: color-mix(in srgb, #22c55e 12%, transparent); color: #4ade80;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Tasks & Lists</h3>
					<p>Compact and expanded list views with priorities, statuses, and drag-to-reorder.</p>
				</div>
			</div>
			<div class="feature-card">
				<div class="feature-icon" style="background: color-mix(in srgb, #f59e0b 12%, transparent); color: #fbbf24;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Meetings & Notes</h3>
					<p>Log meetings with participants, agendas, and action items linked to your calendar.</p>
				</div>
			</div>
			<div class="feature-card">
				<div class="feature-icon" style="background: color-mix(in srgb, #38bdf8 12%, transparent); color: #38bdf8;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Analytics</h3>
					<p>Visualise your completion rates, streaks, and productivity patterns over time.</p>
				</div>
			</div>
			<div class="feature-card">
				<div class="feature-icon" style="background: color-mix(in srgb, #a855f7 12%, transparent); color: #c084fc;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M12 3l-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>AI Assistant</h3>
					<p>Ask questions, get summaries, and receive daily briefings powered by AI.</p>
				</div>
			</div>
			<div class="feature-card">
				<div class="feature-icon" style="background: color-mix(in srgb, #f87171 12%, transparent); color: #f87171;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Themes</h3>
					<p>Dark, light, midnight, slate, and more — switch any time from settings.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="landing-footer">
		<div class="footer-inner">
			<div class="footer-brand">
				<svg width="20" height="20" viewBox="0 0 32 32" fill="none">
					<rect width="32" height="32" rx="6" fill="var(--color-accent)" />
					<path d="M8 12h16M8 16h12M8 20h8" stroke="white" stroke-width="2.5" stroke-linecap="round" />
				</svg>
				<span>FlowPlan</span>
			</div>
			<div class="footer-links">
				<a href="/login">Sign In</a>
				<a href="/register">Register</a>
			</div>
		</div>
	</footer>
</div>

<style>
	.landing-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}

	/* Nav */
	.landing-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--color-bg) 90%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border);
	}
	.nav-inner {
		max-width: 1160px;
		margin: 0 auto;
		padding: 0.875rem 2rem;
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
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.nav-link {
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.45rem 0.875rem;
		border-radius: var(--radius-md);
		transition: color 0.15s, background 0.15s;
	}
	.nav-link:hover { color: var(--color-text); background: var(--color-surface-hover); }
	.nav-btn {
		background: var(--color-accent);
		color: white;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.45rem 1.125rem;
		border-radius: var(--radius-md);
		transition: background 0.15s, transform 0.15s;
	}
	.nav-btn:hover { background: var(--color-accent-hover); transform: translateY(-1px); }

	/* Hero */
	.hero {
		max-width: 1160px;
		margin: 0 auto;
		padding: 5rem 2rem 4rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}
	.hero-left { display: flex; flex-direction: column; }
	.hero-eyebrow {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-accent);
		margin: 0 0 1rem;
	}
	.hero-title {
		font-size: clamp(2.25rem, 4vw, 3.5rem);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: var(--color-text);
		margin: 0 0 1.25rem;
	}
	.hero-subtitle {
		font-size: 1.05rem;
		line-height: 1.7;
		color: var(--color-text-secondary);
		margin: 0 0 2rem;
		max-width: 480px;
	}
	.hero-actions {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		flex-wrap: wrap;
	}
	.hero-btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-accent);
		color: white;
		text-decoration: none;
		font-size: 0.95rem;
		font-weight: 600;
		padding: 0.75rem 1.75rem;
		border-radius: var(--radius-md);
		transition: background 0.15s, transform 0.15s;
		border: none;
		cursor: pointer;
	}
	.hero-btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
	.hero-btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		font-size: 0.95rem;
		font-weight: 600;
		padding: 0.75rem 1.75rem;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: border-color 0.15s, transform 0.15s, background 0.15s;
	}
	.hero-btn-secondary:hover { border-color: var(--color-accent); transform: translateY(-1px); background: var(--color-surface-hover); }
	.hero-btn-secondary:disabled { opacity: 0.7; cursor: wait; }
	.hero-note {
		font-size: 0.78rem;
		color: var(--color-text-tertiary);
		margin: 0.75rem 0 0;
	}
	.spinner {
		width: 14px; height: 14px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* App Preview */
	.hero-right {}
	.app-preview {
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		overflow: hidden;
		box-shadow: 0 20px 40px -8px rgba(0,0,0,0.2), 0 0 0 1px var(--color-border-light);
	}
	.preview-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.875rem;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg);
	}
	.preview-dots { display: flex; gap: 5px; }
	.preview-dots span { width: 9px; height: 9px; border-radius: 50%; }
	.preview-dots span:nth-child(1) { background: #ef4444; }
	.preview-dots span:nth-child(2) { background: #eab308; }
	.preview-dots span:nth-child(3) { background: #22c55e; }
	.preview-title { font-size: 0.72rem; color: var(--color-text-tertiary); font-weight: 500; }
	.preview-content { display: flex; min-height: 300px; }
	.preview-sidebar {
		width: 160px;
		border-right: 1px solid var(--color-border);
		padding: 0.75rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--color-bg);
	}
	.ps-logo { padding: 0.25rem 0.5rem 0.75rem; }
	.ps-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		padding: 0.45rem 0.625rem;
		border-radius: var(--radius-md);
		color: var(--color-text-tertiary);
	}
	.ps-item.active { background: color-mix(in srgb, var(--color-accent) 12%, transparent); color: var(--color-accent); font-weight: 600; }
	.preview-main {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}
	.preview-greeting {}
	.pg-title { font-size: 0.9rem; font-weight: 700; color: var(--color-text); }
	.pg-date { font-size: 0.72rem; color: var(--color-text-tertiary); margin-top: 1px; }
	.preview-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}
	.preview-stat {
		background: var(--color-bg);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		padding: 0.5rem 0.625rem;
		text-align: center;
	}
	.ps-val { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
	.ps-label { font-size: 0.65rem; color: var(--color-text-tertiary); margin-top: 1px; }
	.preview-events {
		background: var(--color-bg);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		padding: 0.625rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.preview-ev-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-tertiary); margin-bottom: 0.25rem; }
	.preview-ev-row { display: flex; align-items: center; gap: 0.5rem; }
	.preview-ev-time { font-size: 0.65rem; color: var(--color-text-tertiary); width: 32px; flex-shrink: 0; text-align: right; }
	.preview-ev-bar { width: 3px; height: 20px; border-radius: 2px; flex-shrink: 0; }
	.preview-ev-name { font-size: 0.75rem; font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

	/* Section Divider */
	.section-divider {
		max-width: 1160px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.section-divider::before, .section-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}
	.section-divider span {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-tertiary);
		white-space: nowrap;
	}

	/* Features */
	.features {
		max-width: 1160px;
		margin: 0 auto;
		padding: 3rem 2rem 5rem;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		overflow: hidden;
		background: var(--color-border);
	}
	.feature-card {
		padding: 1.75rem;
		background: var(--color-surface);
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		transition: background 0.15s;
	}
	.feature-card:hover { background: var(--color-surface-hover); }
	.feature-icon {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.feature-text {}
	.feature-card h3 {
		font-size: 1rem;
		font-weight: 700;
		margin: 0 0 0.375rem;
		color: var(--color-text);
	}
	.feature-card p {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.6;
	}

	/* Footer */
	.landing-footer {
		border-top: 1px solid var(--color-border);
		padding: 1.5rem 2rem;
		margin-top: auto;
	}
	.footer-inner {
		max-width: 1160px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.footer-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}
	.footer-links {
		display: flex;
		gap: 1.25rem;
	}
	.footer-links a {
		font-size: 0.85rem;
		color: var(--color-text-tertiary);
		text-decoration: none;
		transition: color 0.15s;
	}
	.footer-links a:hover { color: var(--color-text); }

	/* Responsive */
	@media (max-width: 900px) {
		.hero { grid-template-columns: 1fr; gap: 2.5rem; padding: 3rem 1.5rem 2.5rem; }
		.hero-right { order: -1; }
		.hero-subtitle { max-width: 100%; }
	}
	@media (max-width: 640px) {
		.preview-sidebar { display: none; }
		.features-grid { grid-template-columns: 1fr; }
		.nav-inner { padding: 0.75rem 1rem; }
	}
</style>
