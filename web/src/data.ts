import Dexie, { type EntityTable } from 'dexie';

export type Tag = { id: string; name: string; color: string };
export type Session = { id: string; title: string; tagId: string; startedAt: string; endedAt?: string };
export type Checklist = { id: string; title: string; category: string; order: number };
export type Completion = { id: string; checklistId: string; date: string; checked: boolean };

class GekoDatabase extends Dexie {
  tags!: EntityTable<Tag, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  checklist!: EntityTable<Checklist, 'id'>;
  completions!: EntityTable<Completion, 'id'>;
  constructor() {
    super('geko-keeper');
    this.version(1).stores({ tags: 'id', sessions: 'id, startedAt, tagId', checklist: 'id, order', completions: 'id, date, checklistId' });
  }
}
export const db = new GekoDatabase();
export const todayKey = () => new Date().toISOString().slice(0, 10);
export const uid = () => crypto.randomUUID();

export async function seedDatabase() {
  if (await db.tags.count()) return;
  await db.tags.bulkAdd([
    { id: 'work', name: 'UI design', color: '#4285F4' },
    { id: 'deep', name: 'Deep work', color: '#8B5CF6' },
    { id: 'study', name: 'Study', color: '#FBBC04' },
    { id: 'personal', name: 'Personal', color: '#F97316' },
  ]);
  await db.checklist.bulkAdd([
    { id: 'stretch', title: 'Morning stretch', category: 'Health', order: 1 },
    { id: 'water', title: 'Drink water', category: 'Health', order: 2 },
    { id: 'desk', title: 'Tidy workspace', category: 'Life', order: 3 },
    { id: 'read', title: 'Read for 20 minutes', category: 'Study', order: 4 },
    { id: 'mood', title: "Log today's mood", category: 'Habit', order: 5 },
    { id: 'wind', title: 'Screen-free wind down', category: 'Rest', order: 6 },
  ]);
}
