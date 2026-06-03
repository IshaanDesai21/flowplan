<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.js';
	import ToastProvider from '$lib/components/ui/ToastProvider.svelte';

	let { data, children } = $props();

	onMount(() => {
		if (data.settings?.theme) {
			theme.set(data.settings.theme as any);
		} else {
			theme.initialize();
		}
	});
</script>

{@render children()}
<ToastProvider />
