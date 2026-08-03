import * as SQLite from 'expo-sqlite';
import { ChecklistItem, DashboardData, FocusSession, Tag } from '../domain/types';

const dbPromise = SQLite.openDatabaseAsync('geko-keeper.db');
const now = () => new Date().toISOString();
const dayKey = () => now().slice(0, 10);
const id = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);

export async function initializeDatabase() {
  const db = await dbPromise;
  await db.execAsync('PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL, is_leisure INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS focus_sessions (id TEXT PRIMARY KEY NOT NULL, description TEXT NOT NULL, tag_id TEXT NOT NULL, started_at TEXT NOT NULL, ended_at TEXT); CREATE TABLE IF NOT EXISTS checklist_items (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, sort_order INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS checklist_entries (checklist_id TEXT NOT NULL, date_key TEXT NOT NULL, checked INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (checklist_id, date_key));');
  const tagCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM tags');
  if (!tagCount?.count) for (const tag of [{ id: 'work', name: 'Work', color: '#4285F4', leisure: 0 }, { id: 'study', name: 'Study', color: '#FBBC04', leisure: 0 }, { id: 'personal', name: 'Personal', color: '#F97316', leisure: 0 }, { id: 'rest', name: 'Rest', color: '#34A853', leisure: 1 }]) await db.runAsync('INSERT INTO tags VALUES (?, ?, ?, ?)', tag.id, tag.name, tag.color, tag.leisure);
  const itemCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM checklist_items');
  if (!itemCount?.count) for (const item of [{ id: 'stretch', title: 'Morning stretch', category: 'Health', sort: 1 }, { id: 'water', title: 'Drink water', category: 'Health', sort: 2 }, { id: 'desk', title: 'Tidy workspace', category: 'Life', sort: 3 }, { id: 'read', title: 'Read for 20 minutes', category: 'Study', sort: 4 }, { id: 'mood', title: 'Log today\'s mood', category: 'Habit', sort: 5 }, { id: 'wind', title: 'Screen-free wind down', category: 'Rest', sort: 6 }]) await db.runAsync('INSERT INTO checklist_items VALUES (?, ?, ?, ?)', item.id, item.title, item.category, item.sort);
}

export async function loadDashboard(): Promise<DashboardData> {
  const db = await dbPromise; const day = dayKey();
  const tags = await db.getAllAsync<Tag>('SELECT id, name, color, is_leisure AS isLeisure FROM tags ORDER BY name');
  const activeSession = await db.getFirstAsync<FocusSession>('SELECT id, description, tag_id AS tagId, started_at AS startedAt, ended_at AS endedAt FROM focus_sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1');
  const checklist = await db.getAllAsync<ChecklistItem & { checked: number }>('SELECT i.id, i.title, i.category, i.sort_order AS sortOrder, COALESCE(e.checked, 0) AS checked FROM checklist_items i LEFT JOIN checklist_entries e ON e.checklist_id=i.id AND e.date_key=? ORDER BY i.sort_order', day);
  const today = await db.getFirstAsync<{ minutes: number }>('SELECT COALESCE(SUM((julianday(COALESCE(ended_at, ?))-julianday(started_at))*1440),0) AS minutes FROM focus_sessions WHERE date(started_at)=date(?)', now(), day);
  const week = await db.getFirstAsync<{ minutes: number }>('SELECT COALESCE(SUM((julianday(COALESCE(ended_at, ?))-julianday(started_at))*1440),0) AS minutes FROM focus_sessions WHERE started_at>=date(?, \'-6 days\')', now(), day);
  return { tags, activeSession: activeSession ?? null, checklist: checklist.map(item => ({ ...item, checked: Boolean(item.checked) })), todayMinutes: Math.round(today?.minutes ?? 0), weeklyMinutes: Math.round(week?.minutes ?? 0) };
}
export async function startFocus(description: string, tagId: string) { const db = await dbPromise; const sessionId = id(); await db.runAsync('INSERT INTO focus_sessions (id, description, tag_id, started_at) VALUES (?, ?, ?, ?)', sessionId, description.trim() || 'Untitled focus task', tagId, now()); }
export async function finishFocus() { const db = await dbPromise; await db.runAsync('UPDATE focus_sessions SET ended_at=? WHERE ended_at IS NULL', now()); }
export async function toggleChecklist(itemId: string, checked: boolean) { const db = await dbPromise; await db.runAsync('INSERT OR REPLACE INTO checklist_entries VALUES (?, ?, ?, ?)', itemId, dayKey(), Number(checked), now()); }
