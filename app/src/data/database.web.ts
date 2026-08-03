import { ChecklistItem, DashboardData, FocusSession, Tag } from '../domain/types';

type PersistedData = {
  tags: Tag[];
  sessions: FocusSession[];
  checklist: Record<string, Record<string, boolean>>;
};

const storageKey = 'geko-keeper.web-data.v1';
const now = () => new Date().toISOString();
const dayKey = () => now().slice(0, 10);
const id = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
const starterTags: Tag[] = [
  { id: 'work', name: 'Work', color: '#4285F4', isLeisure: false },
  { id: 'study', name: 'Study', color: '#FBBC04', isLeisure: false },
  { id: 'personal', name: 'Personal', color: '#F97316', isLeisure: false },
  { id: 'rest', name: 'Rest', color: '#34A853', isLeisure: true },
];
const starterChecklist: ChecklistItem[] = [
  { id: 'stretch', title: 'Morning stretch', category: 'Health', sortOrder: 1 },
  { id: 'water', title: 'Drink water', category: 'Health', sortOrder: 2 },
  { id: 'desk', title: 'Tidy workspace', category: 'Life', sortOrder: 3 },
  { id: 'read', title: 'Read for 20 minutes', category: 'Study', sortOrder: 4 },
  { id: 'mood', title: "Log today's mood", category: 'Habit', sortOrder: 5 },
  { id: 'wind', title: 'Screen-free wind down', category: 'Rest', sortOrder: 6 },
];

function read(): PersistedData {
  const raw = localStorage.getItem(storageKey);
  if (raw) return JSON.parse(raw) as PersistedData;
  const data: PersistedData = { tags: starterTags, sessions: [], checklist: {} };
  localStorage.setItem(storageKey, JSON.stringify(data));
  return data;
}
function write(data: PersistedData) { localStorage.setItem(storageKey, JSON.stringify(data)); }
function minutesBetween(startedAt: string, endedAt: string | null) { return Math.max(0, Math.round((new Date(endedAt ?? now()).getTime() - new Date(startedAt).getTime()) / 60000)); }

export async function initializeDatabase() { read(); }
export async function loadDashboard(): Promise<DashboardData> {
  const data = read(); const day = dayKey();
  const activeSession = data.sessions.find(session => !session.endedAt) ?? null;
  const checklist = starterChecklist.map(item => ({ ...item, checked: Boolean(data.checklist[day]?.[item.id]) }));
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
  const todayMinutes = data.sessions.filter(session => session.startedAt.slice(0, 10) === day).reduce((total, session) => total + minutesBetween(session.startedAt, session.endedAt), 0);
  const weeklyMinutes = data.sessions.filter(session => new Date(session.startedAt) >= weekStart).reduce((total, session) => total + minutesBetween(session.startedAt, session.endedAt), 0);
  return { tags: data.tags, activeSession, checklist, todayMinutes, weeklyMinutes };
}
export async function startFocus(description: string, tagId: string) {
  const data = read();
  data.sessions = [{ id: id(), description: description.trim() || 'Untitled focus task', tagId, startedAt: now(), endedAt: null }, ...data.sessions]; write(data);
}
export async function finishFocus() {
  const data = read(); const endedAt = now();
  data.sessions = data.sessions.map(session => session.endedAt ? session : { ...session, endedAt }); write(data);
}
export async function toggleChecklist(itemId: string, checked: boolean) {
  const data = read(); const day = dayKey();
  data.checklist[day] = { ...data.checklist[day], [itemId]: checked }; write(data);
}
