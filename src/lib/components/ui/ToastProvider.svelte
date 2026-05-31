<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { toasts } from '$lib/stores/toast.js';

	const icons = {
		success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-success)]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
		error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-danger)]"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
		warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-warning)]"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
		info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-info)]"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
	};
</script>

<div class="fixed bottom-0 right-0 z-[100] m-6 flex flex-col gap-2 pointer-events-none">
	{#each $toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[var(--radius-lg)] border border-default bg-surface p-4 shadow-lg backdrop-blur-sm"
			in:slide={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			role="alert"
		>
			<div class="shrink-0">
				{@html icons[toast.type]}
			</div>
			<div class="flex-1 text-sm font-medium text-primary">
				{toast.message}
			</div>
			<button
				class="shrink-0 rounded-full p-1 text-tertiary transition-colors hover:bg-[var(--color-surface-hover)] hover:text-primary focus:outline-none"
				onclick={() => toasts.dismiss(toast.id)}
				aria-label="Close toast"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>
	{/each}
</div>
