const STORAGE_KEY = 'collatz.app';

const defaults = {
  startN: 27,
};

let state = { ...defaults };
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.startN === 'number' && parsed.startN >= 1) {
      state = { ...defaults, ...parsed };
    }
  } catch {
    /* ignore */
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function notify() {
  const snapshot = getState();
  listeners.forEach((fn) => fn(snapshot));
}

export function initState() {
  load();
  notify();
}

export function getState() {
  return { ...state };
}

export function setStartN(n) {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v) || v < 1) return;
  state = { ...state, startN: v };
  persist();
  notify();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
