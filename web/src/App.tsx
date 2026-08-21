import { useEffect, useRef, useState } from 'react';
import type { FormEvent, TouchEvent } from 'react';
import './index.css';
import { NeckRestReminder, WaterReminder } from './components/ReminderWidgets';
import { db, seedDatabase, todayKey, uid, type Checklist, type Session, type Tag } from './data';

type Page = 'home' | 'checklist' | 'report';
const pages: Page[] = ['home', 'checklist', 'report'];
const formatTime = (seconds: number) => [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
const date = () => new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: false });

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tasks, setTasks] = useState<Checklist[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [sessions, setSessions] = useState<Session[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [title, setTitle] = useState("Organise Geko Keeper's UI design");
  const [tagId, setTagId] = useState('work');
  const [now, setNow] = useState(Date.now());
  const [sound, setSound] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const active = sessions.find(session => !session.endedAt);
  const activeTag = tags.find(tag => tag.id === active?.tagId) ?? tags[0];
  const seconds = active ? Math.max(0, Math.floor((now - new Date(active.startedAt).getTime()) / 1000)) : 0;
  const done = tasks.filter(task => checked[task.id]).length;
  const completedMinutes = sessions.filter(session => session.endedAt).reduce((total, session) => total + Math.round((new Date(session.endedAt!).getTime() - new Date(session.startedAt).getTime()) / 60000), 0);

  const refresh = async () => {
    const [nextTags, nextTasks, nextSessions, entries] = await Promise.all([db.tags.toArray(), db.checklist.orderBy('order').toArray(), db.sessions.orderBy('startedAt').reverse().toArray(), db.completions.where('date').equals(todayKey()).toArray()]);
    setTags(nextTags); setTasks(nextTasks); setSessions(nextSessions); setChecked(Object.fromEntries(entries.map(entry => [entry.checklistId, entry.checked])));
  };
  useEffect(() => { seedDatabase().then(refresh); }, []);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!audio.current) return;
    if (sound) void audio.current.play();
    else audio.current.pause();
  }, [sound]);

  const beginFocus = async (event: FormEvent) => { event.preventDefault(); await db.sessions.add({ id: uid(), title: title.trim() || 'Untitled focus task', tagId, startedAt: new Date().toISOString() }); await refresh(); setCreateOpen(false); };
  const finishFocus = async () => { if (!active) return; await db.sessions.update(active.id, { endedAt: new Date().toISOString() }); await refresh(); setPage('report'); };
  const toggle = async (task: Checklist) => { const value = !checked[task.id]; await db.completions.put({ id: `${todayKey()}-${task.id}`, checklistId: task.id, date: todayKey(), checked: value }); await refresh(); };
  const addTag = async () => { const name = window.prompt('Tag name'); if (!name?.trim()) return; const tag = { id: uid(), name: name.trim(), color: '#4285F4' }; await db.tags.add(tag); setTagId(tag.id); await refresh(); };

  const beginSwipe = (event: TouchEvent<HTMLElement>) => {
    if (createOpen || accountOpen || active) return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const finishSwipe = (event: TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || createOpen || accountOpen || active) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) <= Math.abs(dy)) return;
    setPage(current => {
      const index = pages.indexOf(current);
      const next = dx < 0 ? index + 1 : index - 1;
      return pages[Math.max(0, Math.min(pages.length - 1, next))];
    });
  };

  return <main className="device-shell"><div className="ratio-note">GEKO KEEPER · WEB FIRST · LOCAL DATA</div><section className={`app ${active ? 'focus-active' : ''}`} onTouchStart={beginSwipe} onTouchEnd={finishSwipe}>
    <nav className="page-indicator">{(['home', 'checklist', 'report'] as Page[]).map(item => <button key={item} className={`dot ${page === item ? 'active' : ''}`} onClick={() => setPage(item)} aria-label={item} />)}</nav>
    <button className="avatar" id="accountButton" onClick={() => setAccountOpen(!accountOpen)}>E</button>
    {accountOpen && <aside className="account-panel open"><div className="account-summary"><div className="account-mark">E</div><div><b>Echo</b><span>Local workspace</span></div></div><button className="account-item"><span>◌</span> Account settings <i>›</i></button><button className="account-item"><span>◌</span> Reminder settings <i>›</i></button><label className="setting-row">Focus reminders <input type="checkbox" defaultChecked /><span /></label><label className="setting-row">Bird sounds <input type="checkbox" checked={sound} onChange={() => setSound(!sound)} /><span /></label><div className="account-note">Your data is stored on this device. Server sign-in and sync will connect here later.</div></aside>}

    {page === 'home' && <section className="screen home active"><video className="home-video" autoPlay muted loop playsInline src={`${import.meta.env.BASE_URL}media/gekoSunshine.mp4`} /><div className="sun-overlay" /><header className="home-header"><div><span className="eyebrow">GOOD AFTERNOON</span><h1>Wellington {date()} ☁</h1></div></header><div className="home-message"><span>Take it gently today. One good thing is enough.</span><b>— Geko</b></div><div className="home-actions"><div className="sound-wrap"><button className="round-button bird" onClick={() => setSound(!sound)} aria-label="Bird sounds">♪</button><audio ref={audio} loop src={`${import.meta.env.BASE_URL}media/bird.mp3`} /></div>{!active && <button className="focus-cta" onClick={() => setCreateOpen(true)}><span>F.</span><div><small>READY WHEN YOU ARE</small>Focus</div><i>→</i></button>}</div><div className="swipe-tip">Swipe left to plan your day</div>
      {createOpen && <section className="create-overlay overlay open"><button className="overlay-close" onClick={() => setCreateOpen(false)}>×</button><div className="task-art"><div className="art-ring" /><img src={`${import.meta.env.BASE_URL}media/gekoFighting.png`} alt="Geko cheering" /></div><form className="task-form" onSubmit={beginFocus}><span className="eyebrow">FOCUS SESSION</span><label>What would you like to focus on?</label><input value={title} onChange={event => setTitle(event.target.value)} autoFocus /><div className="tags">{tags.map(tag => <button type="button" key={tag.id} onClick={() => setTagId(tag.id)} className={`tag ${tag.id} ${tag.id === tagId ? 'selected' : ''}`} style={{ background: tag.color }}>{tag.name}</button>)}<button type="button" id="newTag" onClick={addTag}>+ New tag</button></div><button className="start-focus" type="submit">Focus <span>→</span></button></form></section>}
      {active && <section className="focus-overlay show"><div className="focus-time"><span>FOCUSING</span><strong>{formatTime(seconds)}</strong></div><div className="focus-task"><span className="tiny-tag" style={{ background: activeTag?.color }}>{activeTag?.name}</span><b>{active.title}</b></div><div className="focus-tools"><WaterReminder /><NeckRestReminder /><button className="finish" onClick={finishFocus} aria-label="Finish focus"><span className="stop-mark" /></button></div></section>}
    </section>}

    {page === 'checklist' && <section className="screen checklist active"><header className="topbar checklist-topbar"><button className="back" onClick={() => setPage('home')}>←</button><div><span className="eyebrow">TODAY</span><h2>Checklist</h2></div><div className="checklist-progress"><Progress title="DAILY" current={done} total={tasks.length} /><Progress title="WEEKLY" current={Math.min(done * 3, 28)} total={28} weekly /></div></header><div className="check-body"><div className="check-list">{tasks.map(task => <button key={task.id} className={`check-item ${checked[task.id] ? 'done' : ''}`} onClick={() => toggle(task)}><i>✓</i><span>{task.title}</span><small>{task.category}</small></button>)}</div></div></section>}
    {page === 'report' && <section className="screen report active"><header className="topbar"><button className="back" onClick={() => setPage('checklist')}>←</button><div><span className="eyebrow">YOUR DAY AT A GLANCE</span><h2>Report</h2></div><button className="calendar">◷ Today</button></header><div className="report-body"><section className="report-summary"><span>Focus time</span><strong>{Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m</strong><div className="ring"><div><b>{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</b></div></div></section><section className="timeline"><div className="timeline-head"><b>Timeline</b><button>Today</button></div><div className="hours"><span>08</span><span>10</span><span>12</span><span>14</span><span>16</span><span>18</span></div><div className="bars">{sessions.filter(item => item.endedAt).slice(0, 3).map((session, index) => <div className="bar work" key={session.id} style={{ left: `${4 + index * 27}%`, width: '22%' }}>{session.title}</div>)}</div></section></div></section>}
  </section></main>;
}
function Progress({ title, current, total, weekly = false }: { title: string; current: number; total: number; weekly?: boolean }) { const pct = total ? Math.min(100, current / total * 100) : 0; return <div className={`progress-set ${weekly ? 'weekly-progress' : ''}`}><span>{title} <b>{current} / {total}</b></span><div className="progress"><i style={{ width: `${pct}%` }} /></div></div>; }
