<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.js';
	import ToastProvider from '$lib/components/ui/ToastProvider.svelte';

	let { children } = $props();

	onMount(() => {
		theme.initialize();
	});
</script>

{@render children()}
<ToastProvider />
