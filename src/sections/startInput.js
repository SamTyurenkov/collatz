import './startInput.css';
import { collatzTrajectory } from '../collatz.js';
import { getState, setStartN, subscribe } from '../state.js';
import template from './startInput.html?raw';

function parsePositiveInt(raw) {
  const t = raw.trim();
  if (t === '') return null;
  const n = Number(t);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null;
  return n;
}

export function mountStartInput(container) {
  container.innerHTML = template;
  const input = container.querySelector('#collatz-start-input');
  const stepsBody = container.querySelector('#start-steps-body');

  function sanitizeDigits(raw) {
    return raw.replace(/\D+/g, '');
  }

  function commitInputValue() {
    const clean = sanitizeDigits(input.value);
    input.value = clean;
    const n = parsePositiveInt(clean);
    if (n !== null) {
      setStartN(n);
      return true;
    }
    return false;
  }

  function syncFromState() {
    input.value = String(getState().startN);
  }

  function renderSteps(startN) {
    const values = collatzTrajectory(startN);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < values.length; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i}</td><td>${values[i]}</td>`;
      frag.appendChild(tr);
    }
    stepsBody.innerHTML = '';
    stepsBody.appendChild(frag);
  }

  input.addEventListener('input', () => {
    commitInputValue();
  });

  input.addEventListener('change', () => {
    commitInputValue();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    commitInputValue();
    input.blur();
  });

  input.addEventListener('blur', () => {
    const isValid = commitInputValue();
    if (!isValid) syncFromState();
  });

  subscribe((s) => {
    if (document.activeElement !== input) {
      input.value = String(s.startN);
    }
    renderSteps(s.startN);
  });

  syncFromState();
  renderSteps(getState().startN);
}
