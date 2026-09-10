'use strict';
/* Dependency-free harness: loads critters.js + walker.js against a fake DOM,
   drives their rAF loops with a manual clock, checks draw calls / visibility
   / geometry sanity / pause-resume behaviour. */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------- fake canvas 2d context ---------- */
function finite(args) { for (const v of args) if (typeof v === 'number' && !Number.isFinite(v)) return false; return true; }
function makeCtx() {
  const ctx = {
    calls: 0, bad: false,
    fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: '', lineJoin: '', globalAlpha: 1, lineDashOffset: 0,
    save() {}, restore() {}, closePath() {}, clearRect() {}, setTransform() {}, setLineDash() {}, clip() {},
    translate() { if (!finite(arguments)) ctx.bad = true; },
    scale() { if (!finite(arguments)) ctx.bad = true; },
    rotate() {},
    beginPath() { ctx.bad = false; },
    moveTo() { if (!finite(arguments)) ctx.bad = true; },
    lineTo() { if (!finite(arguments)) ctx.bad = true; },
    quadraticCurveTo() { if (!finite(arguments)) ctx.bad = true; },
    bezierCurveTo() { if (!finite(arguments)) ctx.bad = true; },
    arc() { if (!finite(arguments)) ctx.bad = true; },
    ellipse() { if (!finite(arguments)) ctx.bad = true; },
    fill() { ctx.calls++; if (ctx.bad) throw new Error('non-finite geometry'); },
    stroke() { ctx.calls++; if (ctx.bad) throw new Error('non-finite geometry'); },
  };
  return ctx;
}
function makeCanvas() {
  return {
    className: '', width: 0, height: 0, ctx: makeCtx(), isConnected: true,
    getContext() { return this.ctx; }, setAttribute() {}, addEventListener() {},
    closest() { return strip; },
  };
}

/* ---------- fake DOM ---------- */
const strip = {
  clientWidth: 1070, walkerCanvas: null,
  getBoundingClientRect() { return { left: 272, top: 1600, right: 1342, bottom: 1656, width: 1070, height: 56 }; },
  querySelector() { return null; },
  appendChild(el) { strip.walkerCanvas = el; },
};
const crittersCanvas = makeCanvas();
const deerLink = { handlers: {}, addEventListener(type, fn) { (deerLink.handlers[type] = deerLink.handlers[type] || []).push(fn); } };

const docListeners = {};
const document = {
  documentElement: { dataset: { deer: 'on', raccoon: 'on', walker: 'on', palette: 'alley' }, style: { setProperty() {} } },
  hidden: false, visibilityState: 'visible', readyState: 'complete',
  querySelector(sel) {
    if (sel === 'canvas.critters') return crittersCanvas;
    if (sel === '.foot__walk') return strip;
    if (sel === '.walker' || sel === 'canvas.walker') return strip.walkerCanvas || null;
    if (sel === '.side__deer') return deerLink;
    return null;
  },
  createElement() { return makeCanvas(); },
  addEventListener(type, fn) { (docListeners[type] = docListeners[type] || []).push(fn); },
  dispatchEvent(ev) { (docListeners[ev.type] || []).forEach(fn => fn(ev)); },
};

const winListeners = {};
function windowAddEventListener(type, fn) { (winListeners[type] = winListeners[type] || []).push(fn); }
function windowDispatch(type, ev) { ev.type = type; (winListeners[type] || []).forEach(fn => fn(ev)); }

/* ---------- manual clock + rAF ---------- */
let clock = 0, nextId = 1, pending = [];
function requestAnimationFrame(cb) { const id = nextId++; pending.push({ id, cb }); return id; }
function cancelAnimationFrame(id) { pending = pending.filter(p => p.id !== id); }
function tick(ms) { clock += ms; const q = pending; pending = []; for (const p of q) p.cb(clock); }

/* ---------- install globals ---------- */
globalThis.window = globalThis;
globalThis.document = document;
globalThis.performance = { now: () => clock };
globalThis.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
globalThis.ResizeObserver = class ResizeObserver { observe() {} disconnect() {} };
globalThis.requestAnimationFrame = requestAnimationFrame;
globalThis.cancelAnimationFrame = cancelAnimationFrame;
globalThis.getComputedStyle = () => ({ getPropertyValue: k => ({ '--cat': '#3A3344', '--bg': '#121016', '--accent': '#F5A742', '--muted': '#9B939E' }[k] || '') });
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.devicePixelRatio = 1;
globalThis.innerWidth = 1200;
globalThis.innerHeight = 800;
globalThis.addEventListener = windowAddEventListener;
globalThis.dispatch = windowDispatch;

/* ---------- load scripts under test ---------- */
const critPath = path.join(__dirname, 'critters.js');
const walkPath = path.join(__dirname, 'walker.js');
vm.runInThisContext(fs.readFileSync(critPath, 'utf8'), { filename: critPath });
vm.runInThisContext(fs.readFileSync(walkPath, 'utf8'), { filename: walkPath });
windowDispatch('load', {});

/* ---------- drive ---------- */
const DT = 16.6667, TOTAL_MS = 20 * 60 * 1000;
let ticks = 0, maxCalls = 0, deerVis = 0, raccVis = 0, catVis = 0;
let posIdentityOk = null, pauseOk = null, resumeOk = null, resumeArmed = false, pauseWindowEnd = null;
let m5 = false, m6 = false, m7 = false, m9 = false, m905 = false, m11 = false, m115 = false;

function bookkeep() {
  const c = crittersCanvas.ctx.calls + (strip.walkerCanvas ? strip.walkerCanvas.ctx.calls : 0);
  if (c > maxCalls) maxCalls = c;
  crittersCanvas.ctx.calls = 0;
  if (strip.walkerCanvas) strip.walkerCanvas.ctx.calls = 0;
  const pos = window.Critters.positions(), wpos = window.Walker.position();
  if (pos[0] && Number.isFinite(pos[0].x) && pos[0].visible) deerVis++;
  if (pos[1] && Number.isFinite(pos[1].x) && pos[1].visible) raccVis++;
  if (wpos && Number.isFinite(wpos.x) && wpos.visible) catVis++;
  if (posIdentityOk === null && clock >= 60 * 1000) posIdentityOk = window.Walker.position() === window.Walker.position();
}

try {
  while (clock < TOTAL_MS) {
    tick(DT); ticks++;
    bookkeep();

    if (resumeArmed) { resumeOk = pending.length > 0; resumeArmed = false; }
    if (pauseWindowEnd !== null) {
      if (pending.length !== 0) pauseOk = false;
      if (clock >= pauseWindowEnd) pauseWindowEnd = null;
    }

    if (!m5 && clock >= 5 * 60000) { m5 = true; document.documentElement.dataset.deer = 'off'; document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key: 'deer', value: 0 } })); }
    if (!m6 && clock >= 6 * 60000) { m6 = true; document.documentElement.dataset.deer = 'on'; document.dispatchEvent(new CustomEvent('tweakchange', { detail: { key: 'deer', value: 1 } })); }
    if (!m7 && clock >= 7 * 60000) {
      m7 = true;
      windowDispatch('pointermove', { clientX: 500, clientY: 1500, timeStamp: clock });
      tick(40); ticks++; bookkeep();
      windowDispatch('pointermove', { clientX: 900, clientY: 1520, timeStamp: clock });
    }
    if (!m9 && clock >= 9 * 60000) { m9 = true; (deerLink.handlers.mouseenter || []).forEach(fn => fn()); }
    if (!m905 && clock >= 9.05 * 60000) { m905 = true; (deerLink.handlers.mouseleave || []).forEach(fn => fn()); }
    if (!m11 && clock >= 11 * 60000) {
      m11 = true; document.hidden = true; document.visibilityState = 'hidden';
      document.dispatchEvent({ type: 'visibilitychange' });
      pauseOk = true; pauseWindowEnd = clock + 30000;
    }
    if (!m115 && clock >= 11.5 * 60000) {
      m115 = true; document.hidden = false; document.visibilityState = 'visible';
      document.dispatchEvent({ type: 'visibilitychange' });
      resumeArmed = true;
    }
  }
} catch (err) {
  console.error(err.stack);
  process.exit(1);
}

console.log(`ticks=${ticks} maxDrawCalls=${maxCalls} deerVisibleTicks=${deerVis} raccoonVisibleTicks=${raccVis} catVisibleTicks=${catVis}`);

let allPass = true;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { console.log('FAIL ' + name + ' ' + detail); allPass = false; }
}
check('maxDrawCalls<150', maxCalls < 150, `maxCalls=${maxCalls}`);
check('deerVisibleTicks>600', deerVis > 600, `deerVisibleTicks=${deerVis}`);
check('raccoonVisibleTicks>600', raccVis > 600, `raccoonVisibleTicks=${raccVis}`);
check('catVisibleTicks>600', catVis > 600, `catVisibleTicks=${catVis}`);
check('no exceptions', true, '');
check('position identity stable', posIdentityOk === true, `posIdentityOk=${posIdentityOk}`);
check('pause/resume worked', pauseOk === true && resumeOk === true, `pauseOk=${pauseOk} resumeOk=${resumeOk}`);

process.exit(allPass ? 0 : 1);
