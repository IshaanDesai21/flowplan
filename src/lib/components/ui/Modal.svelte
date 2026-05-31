<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen: boolean;
		title?: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		onclose: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		isOpen,
		title,
		description,
		size = 'md',
		onclose,
		children,
		footer
	}: Props = $props();

	const sizes = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl'
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-[var(--color-overlay)] backdrop-blur-sm transition-opacity"
			transition:fade={{ duration: 200 }}
			onclick={onclose}
		></div>

		<!-- Dialog Panel -->
		<div
			class="relative z-50 flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] bg-surface text-left align-middle shadow-xl border border-default {sizes[
				size
			]}"
			transition:scale={{ duration: 250, start: 0.95, easing: backOut }}
		>
			{#if title}
				<div class="px-6 pt-6 pb-4 border-b border-default flex justify-between items-start">
					<div>
						<h3 class="text-lg font-semibold leading-6 text-primary" id="modal-title">
							{title}
						</h3>
						{#if description}
							<p class="mt-1 text-sm text-secondary">{description}</p>
						{/if}
					</div>
					<button
						class="text-tertiary hover:text-primary transition-colors focus:outline-none rounded-full p-1 hover:bg-[var(--color-surface-hover)]"
						onclick={onclose}
						aria-label="Close"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
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
			{/if}

			<div class="px-6 py-4 flex-1 overflow-y-auto max-h-[70vh]">
				{@render children?.()}
			</div>

			{#if footer}
				<div class="bg-[var(--color-surface-hover)] px-6 py-4 flex items-center justify-end gap-3 border-t border-default">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
