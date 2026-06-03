import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Theme } from '$lib/types/index.js';

const DEFAULT_THEME: Theme = 'dark';

function getInitialTheme(): Theme {
	if (browser) {
		const stored = localStorage.getItem('flowplan_theme') as Theme | null;
		if (stored && ['light', 'dark', 'midnight', 'slate', 'cream'].includes(stored)) {
			return stored;
		}
	}
	return DEFAULT_THEME;
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(getInitialTheme());

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('flowplan_theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
			}
			set(theme);
		},
		initialize: () => {
			if (browser) {
				const theme = getInitialTheme();
				document.documentElement.setAttribute('data-theme', theme);
				set(theme);
			}
		},
		update
	};
}

export const theme = createThemeStore();
