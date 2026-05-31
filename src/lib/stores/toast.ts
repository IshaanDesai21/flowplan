import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(toast: Omit<Toast, 'id'>) {
		const id = crypto.randomUUID();
		const duration = toast.duration ?? 4000;

		update((toasts) => [...toasts, { ...toast, id }]);

		if (duration > 0) {
			setTimeout(() => dismiss(id), duration);
		}

		return id;
	}

	function dismiss(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => add({ type: 'success', message, duration }),
		error: (message: string, duration?: number) => add({ type: 'error', message, duration }),
		warning: (message: string, duration?: number) => add({ type: 'warning', message, duration }),
		info: (message: string, duration?: number) => add({ type: 'info', message, duration }),
		dismiss
	};
}

export const toasts = createToastStore();
