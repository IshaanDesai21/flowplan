import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createSidebarStore() {
	const { subscribe, set, update } = writable({
		isOpen: true,
		isCollapsed: false
	});

	return {
		subscribe,
		toggle: () => update((s) => ({ ...s, isOpen: !s.isOpen })),
		open: () => update((s) => ({ ...s, isOpen: true })),
		close: () => update((s) => ({ ...s, isOpen: false })),
		toggleCollapse: () =>
			update((s) => {
				const collapsed = !s.isCollapsed;
				if (browser) localStorage.setItem('flowplan_sidebar_collapsed', String(collapsed));
				return { ...s, isCollapsed: collapsed };
			}),
		initialize: () => {
			if (browser) {
				const collapsed = localStorage.getItem('flowplan_sidebar_collapsed') === 'true';
				set({ isOpen: true, isCollapsed: collapsed });
			}
		}
	};
}

export const sidebar = createSidebarStore();
