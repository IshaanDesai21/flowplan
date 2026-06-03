<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface DropdownOption {
		value: string;
		label: string;
		icon?: string; // HTML snippet or emoji
		color?: string; // Color code for dot or icon
	}

	interface Props {
		options: DropdownOption[];
		value: string;
		label?: string;
		onchange?: (value: string) => void;
	}

	let { options, value = $bindable(), label, onchange }: Props = $props();

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement;

	const selectedOption = $derived(options.find(opt => opt.value === value) || options[0]);

	function handleSelect(val: string) {
		value = val;
		isOpen = false;
		if (onchange) onchange(val);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') isOpen = false;
	}

	function handleClickOutside(e: MouseEvent) {
		if (isOpen && dropdownRef && !dropdownRef.contains(e.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('click', handleClickOutside, true);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('click', handleClickOutside, true);
		}
	});
</script>

<div class="custom-dropdown-container" bind:this={dropdownRef}>
	{#if label}
		<label class="dropdown-label">{label}</label>
	{/if}
	
	<button
		type="button"
		class="dropdown-trigger"
		class:open={isOpen}
		onclick={() => isOpen = !isOpen}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<div class="trigger-content">
			{#if selectedOption?.color}
				<span class="opt-color-dot" style="background: {selectedOption.color}"></span>
			{/if}
			{#if selectedOption?.icon}
				<span class="opt-icon">{@html selectedOption.icon}</span>
			{/if}
			<span class="trigger-text">{selectedOption?.label}</span>
		</div>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" class:rotated={isOpen}>
			<path d="M6 9l6 6 6-6"/>
		</svg>
	</button>

	{#if isOpen}
		<div class="dropdown-menu" role="listbox">
			{#each options as opt}
				<button
					type="button"
					class="dropdown-item"
					class:selected={value === opt.value}
					onclick={() => handleSelect(opt.value)}
					role="option"
					aria-selected={value === opt.value}
				>
					<div class="item-content">
						{#if opt.color}
							<span class="opt-color-dot" style="background: {opt.color}"></span>
						{/if}
						{#if opt.icon}
							<span class="opt-icon">{@html opt.icon}</span>
						{/if}
						<span class="item-text">{opt.label}</span>
					</div>
					{#if value === opt.value}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="3" class="check-icon">
							<path d="M20 6L9 17l-5-5"/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.custom-dropdown-container {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		position: relative;
		width: 100%;
	}
	.dropdown-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	.dropdown-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 2.5rem;
		padding: 0 0.75rem;
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.dropdown-trigger:hover {
		background: var(--color-surface-hover);
	}
	.dropdown-trigger.open, .dropdown-trigger:focus-visible {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}
	.trigger-content, .item-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.chevron {
		color: var(--color-text-tertiary);
		transition: transform 0.2s ease;
	}
	.chevron.rotated {
		transform: rotate(180deg);
	}
	
	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.375rem);
		left: 0;
		width: 100%;
		background: var(--color-surface);
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-xl);
		box-shadow: 0 12px 32px rgba(0,0,0,.15), 0 4px 12px rgba(0,0,0,.08);
		padding: 0.375rem;
		z-index: 50;
		animation: slide-down 0.15s cubic-bezier(0.16, 1, 0.3, 1);
		max-height: 250px;
		overflow-y: auto;
	}
	@keyframes slide-down {
		from { opacity: 0; transform: translateY(-4px) scale(0.98); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}
	
	.dropdown-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		border-radius: var(--radius-lg);
		color: var(--color-text);
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.12s;
	}
	.dropdown-item:hover {
		background: var(--color-surface-hover);
	}
	.dropdown-item.selected {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		font-weight: 500;
	}
	
	.opt-color-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.opt-icon {
		font-size: 1.1em;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.item-text, .trigger-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.check-icon {
		flex-shrink: 0;
		margin-left: auto;
	}
</style>
