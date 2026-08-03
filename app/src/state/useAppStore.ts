import { create } from 'zustand';
import { DashboardData } from '../domain/types';
import { finishFocus, initializeDatabase, loadDashboard, startFocus, toggleChecklist } from '../data/database';

type State = DashboardData & { loading: boolean; error: string | null; initialize: () => Promise<void>; refresh: () => Promise<void>; beginFocus: (description: string, tagId: string) => Promise<void>; endFocus: () => Promise<void>; setChecklist: (id: string, checked: boolean) => Promise<void> };
const empty: DashboardData = { tags: [], activeSession: null, checklist: [], todayMinutes: 0, weeklyMinutes: 0 };
export const useAppStore = create<State>((set, get) => ({ ...empty, loading: true, error: null, refresh: async () => { try { set({ ...await loadDashboard(), loading: false, error: null }); } catch (error) { set({ loading: false, error: error instanceof Error ? error.message : 'Could not load local data' }); } }, initialize: async () => { await initializeDatabase(); await get().refresh(); }, beginFocus: async (description, tagId) => { await startFocus(description, tagId); await get().refresh(); }, endFocus: async () => { await finishFocus(); await get().refresh(); }, setChecklist: async (id, checked) => { await toggleChecklist(id, checked); await get().refresh(); } }));
