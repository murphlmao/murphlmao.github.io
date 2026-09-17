/* Tweak state: merged defaults + localStorage, mirrored onto <html> as data-*
   attributes so CSS can react, and broadcast as a `tweakchange` event so the
   canvas modules can react. Ported from docs/redesign-previews/r4/site.js
   (initTweaks, lines 19-99). */
import { tweakDefaults, type Tweaks } from '../site.config';

declare global {
  interface Window { TWEAKS: Tweaks }
}

const KEY = 'tweaks';
export let state: Tweaks = { ...tweakDefaults };

export function readState(): Tweaks {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...tweakDefaults, ...s };
  } catch {
    return { ...tweakDefaults };
  }
}

export function writeAttrs(): void {
  const h = document.documentElement;
  const d = h.dataset as Record<string, string>;
  d.palette = state.palette; d.logo = state.logo; d.mich = state.mich; d.draw = state.draw;
  for (const k of ['orb', 'bg', 'strands', 'motes', 'paws', 'walker', 'deer', 'raccoon'] as const) {
    d[k] = state[k] ? 'on' : 'off';
  }
  h.style.setProperty('--bg-opacity', String(state.bgOpacity / 100));
  h.style.setProperty('--bg-dim', String(state.bgDim / 100));
  h.style.setProperty('--pen-speed', String(state.penSpeed / 100));
  h.style.setProperty('--laser-speed', String(state.laserSpeed / 100));
  h.style.setProperty('--glow-strength', String(state.glowStrength / 100));
  d.glowBreathe = state.glowBreathe ? 'on' : 'off';
  /* the favicon follows the logo + palette; orb.ts owns it (setFavicon) */
}

export function set<K extends keyof Tweaks>(key: K, value: Tweaks[K], persist = true): void {
  state[key] = value;
  if (persist) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ } }
  writeAttrs();
  document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key, value, state } }));
}

export function reset(): void {
  Object.assign(state, tweakDefaults); // keep identity: window.TWEAKS points here
  try { localStorage.removeItem(KEY); } catch { /* storage blocked */ }
  writeAttrs(); sync();
  document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key: 'reset', value: null, state } }));
}

/** Range readouts: the speeds show a multiplier, everything else the raw number. */
function fmtRange(k: keyof Tweaks, v: number): string {
  return k === 'penSpeed' || k === 'laserSpeed' ? `${(v / 100).toFixed(2).replace(/\.?0+$/, '')}x` : String(v);
}

function sync(): void {
  const form = document.getElementById('tweaks');
  if (!form) return;
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]').forEach((el) => {
    const k = el.name as keyof Tweaks;
    if (!(k in state)) return;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = !!state[k];
    else if (el instanceof HTMLInputElement && el.type === 'radio') el.checked = state[k] === el.value;
    else el.value = String(state[k]);
    if (el instanceof HTMLInputElement && el.type === 'range') {
      const out = el.parentNode?.querySelector('output');
      if (out) out.textContent = fmtRange(k, state[k] as number);
    }
  });
}

export function initTweaks(): void {
  state = readState();
  /* ?palette= / ?logo= / ?draw= override for previews; they do not persist */
  const qs = new URLSearchParams(location.search);
  for (const k of ['palette', 'logo', 'draw'] as const) {
    const v = qs.get(k);
    if (v) Object.assign(state, { [k]: v });
  }
  window.TWEAKS = state;
  writeAttrs(); sync();
  const form = document.getElementById('tweaks');
  form?.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement;
    const k = el.name as keyof Tweaks;
    if (!(k in state)) return;
    const v = el instanceof HTMLInputElement && el.type === 'checkbox' ? (el.checked ? 1 : 0)
      : el instanceof HTMLInputElement && el.type === 'range' ? Number(el.value)
      : el instanceof HTMLInputElement && el.type === 'radio' ? (el.checked ? el.value : null)
      : el.value;
    if (v === null) return; // radio's un-checked sibling firing input (defensive; browsers don't normally do this)
    if (el instanceof HTMLInputElement && el.type === 'range') {
      const out = el.parentNode?.querySelector('output');
      if (out) out.textContent = fmtRange(k, v as number);
    }
    set(k, v as Tweaks[typeof k]);
  });
  form?.querySelector('.tweak__reset')?.addEventListener('click', (e) => { e.preventDefault(); reset(); });
}
