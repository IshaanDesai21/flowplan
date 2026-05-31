export type Theme = 'light' | 'dark' | 'midnight' | 'forest' | 'slate' | 'cream';

export const THEMES: { id: Theme; label: string; accent: string; bg: string }[] = [
	{ id: 'light', label: 'Light', accent: '#6366f1', bg: '#fafafa' },
	{ id: 'dark', label: 'Dark', accent: '#818cf8', bg: '#09090b' },
	{ id: 'midnight', label: 'Midnight', accent: '#38bdf8', bg: '#020617' },
	{ id: 'forest', label: 'Forest', accent: '#4ade80', bg: '#022c22' },
	{ id: 'slate', label: 'Slate', accent: '#94a3b8', bg: '#0f172a' },
	{ id: 'cream', label: 'Cream', accent: '#d97706', bg: '#fefce8' }
];

export type TaskStatus =
	| 'NOT_STARTED'
	| 'PLANNED'
	| 'IN_PROGRESS'
	| 'WAITING'
	| 'BLOCKED'
	| 'COMPLETED'
	| 'ARCHIVED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';
export type TaskView = 'kanban' | 'list' | 'calendar';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
	NOT_STARTED: 'Not Started',
	PLANNED: 'Planned',
	IN_PROGRESS: 'In Progress',
	WAITING: 'Waiting',
	BLOCKED: 'Blocked',
	COMPLETED: 'Completed',
	ARCHIVED: 'Archived'
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
	NOT_STARTED: '#71717a',
	PLANNED: '#6366f1',
	IN_PROGRESS: '#3b82f6',
	WAITING: '#f59e0b',
	BLOCKED: '#ef4444',
	COMPLETED: '#22c55e',
	ARCHIVED: '#94a3b8'
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
	CRITICAL: 'Critical',
	HIGH: 'High',
	MEDIUM: 'Medium',
	LOW: 'Low'
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
	CRITICAL: '#ef4444',
	HIGH: '#f97316',
	MEDIUM: '#eab308',
	LOW: '#6b7280'
};

export const EVENT_COLORS = [
	{ id: 'indigo', hex: '#6366f1', label: 'Indigo' },
	{ id: 'blue', hex: '#3b82f6', label: 'Blue' },
	{ id: 'green', hex: '#22c55e', label: 'Green' },
	{ id: 'yellow', hex: '#eab308', label: 'Yellow' },
	{ id: 'orange', hex: '#f97316', label: 'Orange' },
	{ id: 'red', hex: '#ef4444', label: 'Red' },
	{ id: 'pink', hex: '#ec4899', label: 'Pink' },
	{ id: 'purple', hex: '#a855f7', label: 'Purple' }
];

export const ALLOWED_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'text/plain',
	'application/zip'
];

export const MIME_TYPE_LABELS: Record<string, string> = {
	'image/png': 'PNG Image',
	'image/jpeg': 'JPEG Image',
	'image/webp': 'WebP Image',
	'application/pdf': 'PDF Document',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
	'text/plain': 'Text File',
	'application/zip': 'ZIP Archive'
};

export interface NavItem {
	href: string;
	label: string;
	icon: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
	{ href: '/calendar', label: 'Calendar', icon: 'calendar' },
	{ href: '/tasks', label: 'Tasks', icon: 'tasks' },
	{ href: '/checklists', label: 'Checklists', icon: 'checklists' },
	{ href: '/meetings', label: 'Meetings', icon: 'meetings' },
	{ href: '/ai', label: 'AI Assistant', icon: 'ai' },
	{ href: '/analytics', label: 'Analytics', icon: 'analytics' },
	{ href: '/settings', label: 'Settings', icon: 'settings' }
];
