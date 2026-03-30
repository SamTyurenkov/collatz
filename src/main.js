import './styles/global.css';
import { initState } from './state.js';
import { mountStartInput } from './sections/startInput.js';
import { mountDualGraph } from './sections/dualGraph.js';

initState();
mountStartInput(document.getElementById('section-start-input'));
mountDualGraph(document.getElementById('section-dual-graph'));
