<script lang="ts">
	import { onMount } from 'svelte';
	
	let { user } = $props();
</script>

<aside class="w-72 bg-surface border-l border-default p-5 flex-col gap-6 overflow-y-auto hidden lg:flex">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-semibold tracking-wide text-secondary uppercase">Right Now</h2>
	</div>

	<!-- Mini Calendar Snippet or Upcoming -->
	<div class="rounded-xl border border-default p-4 bg-page">
		<h3 class="font-medium text-sm mb-3">Up Next</h3>
		<div class="space-y-3">
			<div class="flex gap-3 items-start relative before:absolute before:left-[3.5px] before:top-5 before:bottom-[-12px] before:w-[2px] before:bg-default last:before:hidden">
				<div class="w-2 h-2 rounded-full bg-[var(--color-accent)] mt-1.5 z-10 ring-4 ring-page"></div>
				<div>
					<p class="text-sm font-medium">Design Review</p>
					<p class="text-xs text-secondary mt-0.5">10:00 AM - 11:00 AM</p>
				</div>
			</div>
			<div class="flex gap-3 items-start relative before:absolute before:left-[3.5px] before:top-5 before:bottom-[-12px] before:w-[2px] before:bg-default last:before:hidden">
				<div class="w-2 h-2 rounded-full bg-[var(--color-success)] mt-1.5 z-10 ring-4 ring-page"></div>
				<div>
					<p class="text-sm font-medium">Lunch Block</p>
					<p class="text-xs text-secondary mt-0.5">12:30 PM - 1:30 PM</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Suggested Priorities -->
	<div>
		<h2 class="text-sm font-semibold tracking-wide text-secondary uppercase mb-3 flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-accent)]"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
			AI Priorities
		</h2>
		<div class="space-y-2">
			<button class="w-full flex items-center gap-3 p-2.5 rounded-lg border border-default hover:border-[var(--color-accent)] hover:shadow-sm bg-page transition-all text-left">
				<div class="w-4 h-4 rounded-full border-2 border-[var(--color-danger)] shrink-0"></div>
				<span class="text-sm font-medium truncate">Finish Q3 Report</span>
			</button>
			<button class="w-full flex items-center gap-3 p-2.5 rounded-lg border border-default hover:border-[var(--color-accent)] hover:shadow-sm bg-page transition-all text-left">
				<div class="w-4 h-4 rounded-full border-2 border-[var(--color-warning)] shrink-0"></div>
				<span class="text-sm font-medium truncate">Email Client Update</span>
			</button>
		</div>
	</div>
</aside>
