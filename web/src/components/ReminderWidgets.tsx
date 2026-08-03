import { useEffect, useRef, useState } from 'react';

const CUP_ML = 300;
const FILL_STEP_ML = 6;
const FILL_INTERVAL_MS = 45;
const DRINK_REMINDER_MS = 2 * 60 * 60 * 1000;
const NECK_WARN_MS = 30 * 60 * 1000;
const NECK_DANGER_MS = 60 * 60 * 1000;
const WATER_STATE_KEY = 'timetag-water-reminder-state';

type WaterState = { date: string; cups: number; waterMl: number; lastDrinkAt: number };
const dateKey = () => new Date().toISOString().slice(0, 10);
const defaults = (date: string): WaterState => ({ date, cups: 1.5, waterMl: 0, lastDrinkAt: Date.now() });
function loadWater(date: string): WaterState {
  try {
    const saved = JSON.parse(localStorage.getItem(WATER_STATE_KEY) ?? 'null') as Partial<WaterState> | null;
    if (!saved || saved.date !== date) return defaults(date);
    return { date, cups: typeof saved.cups === 'number' ? saved.cups : 1.5, waterMl: typeof saved.waterMl === 'number' ? saved.waterMl : 0, lastDrinkAt: typeof saved.lastDrinkAt === 'number' ? saved.lastDrinkAt : Date.now() };
  } catch { return defaults(date); }
}

export function WaterReminder() {
  const [state, setState] = useState(() => loadWater(dateKey()));
  const [now, setNow] = useState(Date.now());
  const fillTimer = useRef<number | null>(null);
  const fillPercent = Math.min(state.waterMl / CUP_ML, 1);
  const waterHeight = 72 * fillPercent;
  const waterY = 88 - waterHeight;
  const progress = Math.min((now - state.lastDrinkAt) / DRINK_REMINDER_MS, 1);
  const stroke = `rgb(${Math.round(34 + (239 - 34) * progress)}, ${Math.round(197 + (68 - 197) * progress)}, ${Math.round(94 + (68 - 94) * progress)})`;
  const shownCups = (state.cups + state.waterMl / CUP_ML).toFixed(1);

  const stop = () => { if (fillTimer.current !== null) { window.clearInterval(fillTimer.current); fillTimer.current = null; } };
  const fill = () => {
    if (fillTimer.current !== null) return;
    const timestamp = Date.now(); setNow(timestamp); setState(value => ({ ...value, lastDrinkAt: timestamp }));
    fillTimer.current = window.setInterval(() => setState(value => {
      const next = value.waterMl + FILL_STEP_ML;
      return next >= CUP_ML ? { ...value, cups: Math.round((value.cups + 1) * 10) / 10, waterMl: next - CUP_ML } : { ...value, waterMl: next };
    }), FILL_INTERVAL_MS);
  };
  useEffect(() => { localStorage.setItem(WATER_STATE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { const timer = window.setInterval(() => { const today = dateKey(); if (today !== state.date) setState(defaults(today)); setNow(Date.now()); }, 60_000); return () => window.clearInterval(timer); }, [state.date]);
  useEffect(() => () => stop(), []);
  return <div className="reminder-widget"><button type="button" className="focus-tool water reminder-button" onPointerDown={fill} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop} title="Hold to fill one 300ml cup" aria-label={`Water: ${shownCups} cups`}><svg viewBox="0 0 80 96" role="img" aria-hidden="true"><defs><clipPath id="geko-water-clip"><path d="M20 15h40l-5 70H25L20 15z" /></clipPath></defs><rect x="20" y={waterY} width="40" height={waterHeight} clipPath="url(#geko-water-clip)" fill="#38bdf8" opacity=".75" /><path d="M20 15h40l-5 70H25L20 15z" fill="none" stroke={stroke} strokeWidth="4" strokeLinejoin="round" /><path d="M26 27h28" stroke="currentColor" strokeWidth="2" opacity=".28" /></svg><small>{shownCups} cups</small></button></div>;
}

export function NeckRestReminder() {
  const [lastRestAt, setLastRestAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const elapsed = now - lastRestAt;
  const status = elapsed >= NECK_DANGER_MS ? 'danger' : elapsed >= NECK_WARN_MS ? 'warn' : 'ok';
  const color = status === 'danger' ? '#ef4444' : status === 'warn' ? '#eab308' : '#22c55e';
  const mouth = status === 'danger' ? 'M33 42 Q40 36 47 42' : status === 'warn' ? 'M34 39 H46' : 'M33 38 Q40 44 47 38';
  const label = status === 'danger' ? 'Move now' : status === 'warn' ? 'Move soon' : 'Move';
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  return <button type="button" className={`focus-tool move reminder-button neck-${status}`} onClick={() => { const timestamp = Date.now(); setLastRestAt(timestamp); setNow(timestamp); }} title="Reset neck rest timer" aria-label={`Neck rest: ${label}`}><svg viewBox="0 0 80 96" role="img" aria-hidden="true"><circle cx="40" cy="28" r="20" fill="none" stroke={color} strokeWidth="4" /><circle cx="33" cy="25" r="2.5" fill={color} /><circle cx="47" cy="25" r="2.5" fill={color} /><path d={mouth} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" /><path d="M34 49 V58 M46 49 V58" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" /><path d="M19 68 Q40 56 61 68" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" /></svg><small>{label}</small></button>;
}
