export type Tag = { id: string; name: string; color: string; isLeisure: boolean };
export type FocusSession = { id: string; description: string; tagId: string; startedAt: string; endedAt: string | null };
export type ChecklistItem = { id: string; title: string; category: string; sortOrder: number };
export type DashboardData = { tags: Tag[]; activeSession: FocusSession | null; checklist: Array<ChecklistItem & { checked: boolean }>; todayMinutes: number; weeklyMinutes: number };
