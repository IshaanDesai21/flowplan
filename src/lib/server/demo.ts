import { db } from './db.js';

export async function seedDemoUser() {
	const DEMO_USER_ID = 'demo-user-id';

	try {
		// Upsert user
		const user = await db.user.upsert({
			where: { id: DEMO_USER_ID },
			update: {},
			create: {
				id: DEMO_USER_ID,
				email: 'demo@flowplan.app',
				name: 'Demo User',
				isDemo: true,
				provider: 'demo'
			}
		});

		// Check if user already has data to avoid re-seeding every restart
		const existingTasks = await db.task.count({ where: { userId: DEMO_USER_ID } });
		if (existingTasks > 0) {
			return user;
		}

		await db.userSettings.create({ data: { userId: user.id } });

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		// Sample tasks
		const taskData = [
			{
				userId: user.id,
				title: 'Review project proposal',
				description: 'Go through the Q3 project proposal and provide feedback',
				priority: 'HIGH' as const,
				status: 'IN_PROGRESS' as const,
				dueDate: new Date(today.getTime() + 86400000),
				category: 'Work',
				estimatedDuration: 60
			},
			{
				userId: user.id,
				title: 'Weekly grocery shopping',
				description: 'Buy fresh produce, dairy, and pantry essentials',
				priority: 'MEDIUM' as const,
				status: 'NOT_STARTED' as const,
				dueDate: new Date(today.getTime() + 2 * 86400000),
				category: 'Personal'
			},
			{
				userId: user.id,
				title: 'Prepare presentation slides',
				priority: 'CRITICAL' as const,
				status: 'PLANNED' as const,
				dueDate: today,
				category: 'Work',
				estimatedDuration: 120
			},
			{
				userId: user.id,
				title: 'Schedule dentist appointment',
				priority: 'LOW' as const,
				status: 'NOT_STARTED' as const,
				category: 'Health'
			},
			{
				userId: user.id,
				title: 'Read "Atomic Habits" chapter 5',
				priority: 'LOW' as const,
				status: 'COMPLETED' as const,
				completedAt: new Date(today.getTime() - 86400000),
				category: 'Personal'
			}
		];

		await db.task.createMany({ data: taskData });

		// Sample calendar events
		const eventData = [
			{
				userId: user.id,
				title: 'Team Standup',
				startTime: new Date(today.getTime() + 9 * 3600000),
				endTime: new Date(today.getTime() + 9.5 * 3600000),
				color: '#6366f1',
				status: 'confirmed',
				isRecurring: true,
				recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
			},
			{
				userId: user.id,
				title: 'Design Review',
				startTime: new Date(today.getTime() + 14 * 3600000),
				endTime: new Date(today.getTime() + 15 * 3600000),
				color: '#3b82f6',
				location: 'Conference Room B',
				status: 'confirmed'
			},
			{
				userId: user.id,
				title: 'Focus Time — Deep Work',
				startTime: new Date(today.getTime() + 10 * 3600000),
				endTime: new Date(today.getTime() + 12 * 3600000),
				color: '#22c55e',
				isTimeBlock: true,
				status: 'confirmed'
			},
			{
				userId: user.id,
				title: 'Lunch with Sarah',
				startTime: new Date(today.getTime() + 12 * 3600000),
				endTime: new Date(today.getTime() + 13 * 3600000),
				color: '#f97316',
				location: 'Café Luna',
				status: 'confirmed'
			},
			{
				userId: user.id,
				title: 'Sprint Planning',
				startTime: new Date(today.getTime() + 86400000 + 10 * 3600000),
				endTime: new Date(today.getTime() + 86400000 + 11.5 * 3600000),
				color: '#a855f7',
				status: 'confirmed'
			}
		];

		await db.calendarEvent.createMany({ data: eventData });

		// Sample checklist
		const checklist = await db.checklist.create({
			data: {
				userId: user.id,
				title: 'Morning Routine',
				category: 'Daily'
			}
		});

		await db.checklistItem.createMany({
			data: [
				{ checklistId: checklist.id, title: 'Meditate 10 minutes', position: 0, isCompleted: true },
				{ checklistId: checklist.id, title: 'Exercise 30 minutes', position: 1 },
				{ checklistId: checklist.id, title: 'Review daily goals', position: 2 },
				{ checklistId: checklist.id, title: 'Check emails', position: 3, isCompleted: true }
			]
		});

		// Sample meeting
		await db.meeting.create({
			data: {
				userId: user.id,
				title: 'Client Kickoff — Acme Corp',
				startTime: new Date(today.getTime() + 2 * 86400000 + 15 * 3600000),
				endTime: new Date(today.getTime() + 2 * 86400000 + 16 * 3600000),
				participants: JSON.stringify(['alice@acme.com', 'bob@acme.com', 'you']),
				notes: 'Discuss project scope, timeline, and deliverables.',
				location: 'Zoom',
				actionItems: JSON.stringify([
					{ text: 'Send agenda beforehand', completed: true },
					{ text: 'Prepare scope document', completed: false }
				])
			}
		});

		console.log('Successfully seeded demo user data');
		return user;
	} catch (err) {
		console.error('Error seeding demo user data:', err);
		throw err;
	}
}
