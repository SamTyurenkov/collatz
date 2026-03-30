import './dualGraph.css';
import { collatzTrajectory } from '../collatz.js';
import { getState, subscribe } from '../state.js';
import template from './dualGraph.html?raw';

const ROOT_ODD_MAX = 17;
const MAX_VALUE = 2500;

const ROOT_ODDS = Array.from({ length: ROOT_ODD_MAX }, (_, i) => i + 1).filter(
  (n) => n % 2 === 1,
);

function maxLevelForRoot(root) {
  let level = 0;
  let value = root;
  while (value * 2 <= MAX_VALUE) {
    value *= 2;
    level++;
  }
  return level;
}

const MAX_LEVEL = Math.max(...ROOT_ODDS.map((r) => maxLevelForRoot(r)));
const X0 = 52;
const Y0 = 42;
const X_STEP = 92;
const Y_STEP = 42;
const NODE_RADIUS = 8;

const NODES = [];
for (let col = 0; col < ROOT_ODDS.length; col++) {
  const root = ROOT_ODDS[col];
  let value = root;
  let level = 0;
  while (value <= MAX_VALUE) {
    NODES.push({
      value,
      level,
      x: X0 + col * X_STEP,
      y: Y0 + (MAX_LEVEL - level) * Y_STEP,
    });
    value *= 2;
    level++;
  }
}

const GRID = new Set(NODES.map((n) => n.value));
const POS = Object.fromEntries(NODES.map((n) => [n.value, [n.x, n.y]]));
const SVG_WIDTH = X0 * 2 + (ROOT_ODDS.length - 1) * X_STEP;
const SVG_HEIGHT = Y0 * 2 + MAX_LEVEL * Y_STEP;
const FULL_BOUNDS = {
  minX: Math.min(...NODES.map((n) => n.x)),
  maxX: Math.max(...NODES.map((n) => n.x)),
  minY: Math.min(...NODES.map((n) => n.y)),
  maxY: Math.max(...NODES.map((n) => n.y)),
};

function oddRoot(n) {
  let x = n;
  while (x % 2 === 0) x /= 2;
  return x;
}

function oddPreimage(n) {
  if ((n - 1) % 3 !== 0) return null;
  const candidate = (n - 1) / 3;
  if (!Number.isInteger(candidate)) return null;
  if (candidate <= 1) return null;
  if (candidate % 2 === 0) return null;
  return candidate;
}

function buildClassicTree(maxValue) {
  const childrenByNode = new Map([[1, []]]);
  const parentByNode = new Map([[1, null]]);
  const depthByNode = new Map([[1, 0]]);
  const queue = [1];
  let qIndex = 0;

  while (qIndex < queue.length) {
    const node = queue[qIndex++];
    const children = [];

    const evenChild = node * 2;
    if (evenChild <= maxValue) children.push(evenChild);

    const oddChild = oddPreimage(node);
    if (oddChild !== null && oddChild <= maxValue) children.push(oddChild);

    children.sort((a, b) => a - b);
    childrenByNode.set(node, children);

    for (const child of children) {
      if (parentByNode.has(child)) continue;
      parentByNode.set(child, node);
      depthByNode.set(child, depthByNode.get(node) + 1);
      if (!childrenByNode.has(child)) childrenByNode.set(child, []);
      queue.push(child);
    }
  }

  const levels = new Map();
  for (const [value, depth] of depthByNode.entries()) {
    if (!levels.has(depth)) levels.set(depth, []);
    levels.get(depth).push(value);
  }
  for (const nodes of levels.values()) {
    nodes.sort((a, b) => a - b);
  }

  const maxDepth = Math.max(...depthByNode.values());
  const maxRank = Math.max(...Array.from(levels.values(), (nodes) => nodes.length - 1));
  const marginX = 36;
  const marginY = 34;
  const diagX = 46;
  const branchX = 26;
  const width = marginX * 2 + maxDepth * diagX + Math.max(0, maxRank) * branchX;
  const height = marginY * 2 + maxDepth * 52;
  const positions = new Map();
  const values = Array.from(parentByNode.keys());
  const maxTreeValue = Math.max(...values);
  const usableHeight = Math.max(1, height - marginY * 2);
  for (const [depth, nodes] of levels.entries()) {
    for (let rank = 0; rank < nodes.length; rank++) {
      const value = nodes[rank];
      const x = marginX + depth * diagX + rank * branchX;
      const y = height - marginY - (value / maxTreeValue) * usableHeight;
      positions.set(value, [x, y]);
    }
  }
  for (const value of values) {
    if (positions.has(value)) continue;
    const depth = depthByNode.get(value);
    const x = marginX + depth * diagX;
    const y = height - marginY - (value / maxTreeValue) * usableHeight;
    positions.set(value, [x, y]);
  }

  return {
    nodes: values,
    depthByNode,
    childrenByNode,
    parentByNode,
    positions,
    width,
    height,
  };
}

const CLASSIC_TREE = buildClassicTree(MAX_VALUE);
const CLASSIC_POS = CLASSIC_TREE.positions;
const CLASSIC_NODE_SET = new Set(CLASSIC_TREE.nodes);

function doublingSegments() {
  const segs = [];
  for (const n of GRID) {
    const doubled = n * 2;
    if (GRID.has(doubled)) segs.push([n, doubled]);
  }
  return segs;
}

function bridgeSegmentsBetweenSets() {
  const segs = [];
  for (const n of GRID) {
    if (n % 2 === 0) continue;
    const target = 3 * n + 1;
    if (!GRID.has(target)) continue;
    if (oddRoot(target) === oddRoot(n)) continue;
    segs.push([n, target]);
  }
  return segs;
}

const DOUBLING_SEGMENTS = doublingSegments();
const BRIDGE_SEGMENTS = bridgeSegmentsBetweenSets();

function pathEdgesOnGrid(traj) {
  const edges = [];
  for (let i = 0; i < traj.length - 1; i++) {
    const a = traj[i];
    const b = traj[i + 1];
    if (GRID.has(a) && GRID.has(b)) edges.push([a, b]);
  }
  return edges;
}

function pathEdgesOnClassicTree(traj) {
  const edges = [];
  for (let i = 0; i < traj.length - 1; i++) {
    const a = traj[i];
    const b = traj[i + 1];
    if (!CLASSIC_NODE_SET.has(a) || !CLASSIC_NODE_SET.has(b)) continue;
    if (CLASSIC_TREE.parentByNode.get(a) === b || CLASSIC_TREE.parentByNode.get(b) === a) {
      edges.push([a, b]);
    }
  }
  return edges;
}

function stepIndexByValue(traj) {
  const out = new Map();
  for (let i = 0; i < traj.length; i++) {
    const v = traj[i];
    if (!out.has(v)) out.set(v, i);
  }
  return out;
}

function firstVisibleIndex(traj, visibleSet) {
  for (let i = 0; i < traj.length; i++) {
    if (visibleSet.has(traj[i])) return i;
  }
  return -1;
}

function lineEl(x1, y1, x2, y2, className) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  line.setAttribute('class', className);
  return line;
}

function treeNodeGroup(visibleValues, stepByValue) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'dual-graph-nodes');
  const ordered = Array.from(visibleValues).sort((a, b) => {
    const da = CLASSIC_TREE.depthByNode.get(a) ?? 0;
    const db = CLASSIC_TREE.depthByNode.get(b) ?? 0;
    if (da !== db) return da - db;
    return a - b;
  });
  for (const value of ordered) {
    const [x, y] = CLASSIC_POS.get(value);
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(x));
    c.setAttribute('cy', String(y));
    c.setAttribute('r', '6.5');
    c.setAttribute('class', 'dual-graph-node');
    c.setAttribute('data-value', String(value));
    const step = stepByValue.get(value);
    c.setAttribute('data-step', step == null ? '' : String(step));

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x));
    t.setAttribute('y', String(y - 9));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('class', 'dual-graph-node-label');
    t.textContent = String(value);

    g.appendChild(c);
    g.appendChild(t);
  }
  return g;
}

function focusValuesFromPath(traj) {
  const focus = new Set();
  for (const value of traj) {
    if (!GRID.has(value)) continue;
    focus.add(value);
    const half = value / 2;
    const doubled = value * 2;
    if (Number.isInteger(half) && GRID.has(half)) focus.add(half);
    if (GRID.has(doubled)) focus.add(doubled);
    if (value % 2 === 1) {
      const oddForward = 3 * value + 1;
      if (GRID.has(oddForward)) focus.add(oddForward);
    } else if ((value - 1) % 3 === 0) {
      const oddBack = (value - 1) / 3;
      if (oddBack > 0 && oddBack % 2 === 1 && GRID.has(oddBack)) focus.add(oddBack);
    }
  }
  return focus;
}

function treeFocusValuesFromPath(traj) {
  const focus = new Set();
  for (const value of traj) {
    if (!CLASSIC_NODE_SET.has(value)) continue;
    focus.add(value);
    const parent = CLASSIC_TREE.parentByNode.get(value);
    if (parent !== null && parent !== undefined) focus.add(parent);
    const children = CLASSIC_TREE.childrenByNode.get(value) ?? [];
    for (const child of children) focus.add(child);
  }
  if (!focus.size) {
    focus.add(1);
    const rootChildren = CLASSIC_TREE.childrenByNode.get(1) ?? [];
    for (const child of rootChildren) focus.add(child);
  }
  return focus;
}

function buildViewBox(focusValues) {
  if (!focusValues.size) return `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const v of focusValues) {
    const [x, y] = POS[v];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const padX = X_STEP * 0.9;
  const padY = Y_STEP * 1.1;
  const globalPad = NODE_RADIUS * 2;
  minX = Math.max(minX - padX, FULL_BOUNDS.minX - globalPad);
  maxX = Math.min(maxX + padX, FULL_BOUNDS.maxX + globalPad);
  minY = Math.max(minY - padY, FULL_BOUNDS.minY - globalPad);
  maxY = Math.min(maxY + padY, FULL_BOUNDS.maxY + globalPad);

  let width = maxX - minX;
  let height = maxY - minY;
  if (width < 180) {
    const extra = (180 - width) / 2;
    minX -= extra;
    maxX += extra;
    width = 180;
  }
  if (height < 180) {
    const extra = (180 - height) / 2;
    minY -= extra;
    maxY += extra;
    height = 180;
  }

  return `${minX} ${minY} ${width} ${height}`;
}

function buildTreeViewBox(focusValues) {
  if (!focusValues.size) return `0 0 ${CLASSIC_TREE.width} ${CLASSIC_TREE.height}`;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const value of focusValues) {
    const point = CLASSIC_POS.get(value);
    if (!point) continue;
    const [x, y] = point;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const padX = 85;
  const padY = 70;
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(CLASSIC_TREE.width, maxX + padX);
  maxY = Math.min(CLASSIC_TREE.height, maxY + padY);

  let width = maxX - minX;
  let height = maxY - minY;
  if (width < 250) {
    const extra = (250 - width) / 2;
    minX = Math.max(0, minX - extra);
    maxX = Math.min(CLASSIC_TREE.width, maxX + extra);
    width = maxX - minX;
  }
  if (height < 220) {
    const extra = (220 - height) / 2;
    minY = Math.max(0, minY - extra);
    maxY = Math.min(CLASSIC_TREE.height, maxY + extra);
    height = maxY - minY;
  }

  return `${minX} ${minY} ${width} ${height}`;
}

function nodeGroup(stepByValue) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'dual-graph-nodes');
  for (const { value, x, y } of NODES) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(x));
    c.setAttribute('cy', String(y));
    c.setAttribute('r', String(NODE_RADIUS));
    c.setAttribute('class', 'dual-graph-node');
    c.setAttribute('data-value', String(value));
    const step = stepByValue.get(value);
    c.setAttribute('data-step', step == null ? '' : String(step));

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x));
    t.setAttribute('y', String(y + 3));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('class', 'dual-graph-node-label');
    t.textContent = String(value);

    g.appendChild(c);
    g.appendChild(t);
  }
  return g;
}

function setViewBox(svg, viewBox) {
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
}

function parseViewBox(viewBox) {
  const [minX, minY, width, height] = viewBox.split(' ').map(Number);
  return { minX, minY, width, height };
}

function renderExternalStart(svg, viewBox, startValue, targetPoint, skippedSteps) {
  const NS = 'http://www.w3.org/2000/svg';
  const { minX, minY, width, height } = parseViewBox(viewBox);
  const sx = minX + width * 0.88;
  const sy = minY + height * 0.12;

  const layer = document.createElementNS(NS, 'g');
  layer.setAttribute('class', 'dual-graph-layer-external');

  if (targetPoint) {
    const [tx, ty] = targetPoint;
    layer.appendChild(lineEl(sx, sy, tx, ty, 'dual-graph-edge-external'));
  }

  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('cx', String(sx));
  c.setAttribute('cy', String(sy));
  c.setAttribute('r', '7');
  c.setAttribute('class', 'dual-graph-node dual-graph-node-external');
  c.setAttribute('data-value', String(startValue));
  c.setAttribute('data-step', '0');
  layer.appendChild(c);

  const t = document.createElementNS(NS, 'text');
  t.setAttribute('x', String(sx - 10));
  t.setAttribute('y', String(sy - 10));
  t.setAttribute('text-anchor', 'end');
  t.setAttribute('class', 'dual-graph-node-label dual-graph-node-label-external');
  t.textContent =
    skippedSteps > 0 ? `start ${startValue} -> +${skippedSteps} step(s)` : `start ${startValue}`;
  layer.appendChild(t);

  svg.appendChild(layer);
}

function renderClassicTree(svg, pathEdges, focusValues, viewBox, stepByValue, externalStart) {
  svg.innerHTML = '';
  setViewBox(svg, viewBox);
  const NS = 'http://www.w3.org/2000/svg';
  const treeLayer = document.createElementNS(NS, 'g');
  treeLayer.setAttribute('class', 'dual-graph-layer-tree');
  for (const parent of focusValues) {
    const [x1, y1] = CLASSIC_POS.get(parent);
    const children = CLASSIC_TREE.childrenByNode.get(parent) ?? [];
    for (const child of children) {
      if (!focusValues.has(child)) continue;
      const [x2, y2] = CLASSIC_POS.get(child);
      const edgeClass =
        child === parent * 2 ? 'dual-graph-edge-double' : 'dual-graph-edge-bridge';
      treeLayer.appendChild(lineEl(x1, y1, x2, y2, edgeClass));
    }
  }
  svg.appendChild(treeLayer);

  const pathLayer = document.createElementNS(NS, 'g');
  pathLayer.setAttribute('class', 'dual-graph-layer-path');
  for (const [a, b] of pathEdges) {
    const [x1, y1] = CLASSIC_POS.get(a);
    const [x2, y2] = CLASSIC_POS.get(b);
    pathLayer.appendChild(lineEl(x1, y1, x2, y2, 'dual-graph-edge-path'));
  }
  svg.appendChild(pathLayer);
  if (externalStart) {
    const targetPoint = externalStart.targetValue != null ? CLASSIC_POS.get(externalStart.targetValue) : null;
    renderExternalStart(svg, viewBox, externalStart.startValue, targetPoint, externalStart.skippedSteps);
  }
  svg.appendChild(treeNodeGroup(focusValues, stepByValue));
}

function renderStructure(svg, pathEdges, viewBox, stepByValue, externalStart) {
  svg.innerHTML = '';
  setViewBox(svg, viewBox);
  const NS = 'http://www.w3.org/2000/svg';

  const gDouble = document.createElementNS(NS, 'g');
  gDouble.setAttribute('class', 'dual-graph-layer-double');
  for (const [a, b] of DOUBLING_SEGMENTS) {
    const [x1, y1] = POS[a];
    const [x2, y2] = POS[b];
    gDouble.appendChild(lineEl(x1, y1, x2, y2, 'dual-graph-edge-double'));
  }
  svg.appendChild(gDouble);

  const gBridge = document.createElementNS(NS, 'g');
  gBridge.setAttribute('class', 'dual-graph-layer-bridge');
  for (const [a, b] of BRIDGE_SEGMENTS) {
    const [x1, y1] = POS[a];
    const [x2, y2] = POS[b];
    gBridge.appendChild(lineEl(x1, y1, x2, y2, 'dual-graph-edge-bridge'));
  }
  svg.appendChild(gBridge);

  const gPath = document.createElementNS(NS, 'g');
  gPath.setAttribute('class', 'dual-graph-layer-pathoverlay');
  for (const [a, b] of pathEdges) {
    const [x1, y1] = POS[a];
    const [x2, y2] = POS[b];
    gPath.appendChild(lineEl(x1, y1, x2, y2, 'dual-graph-edge-path'));
  }
  svg.appendChild(gPath);

  if (externalStart) {
    const targetPoint = externalStart.targetValue != null ? POS[externalStart.targetValue] : null;
    renderExternalStart(svg, viewBox, externalStart.startValue, targetPoint, externalStart.skippedSteps);
  }

  svg.appendChild(nodeGroup(stepByValue));
}

export function mountDualGraph(container) {
  container.innerHTML = template;
  const svgPath = container.querySelector('#dual-graph-svg-path');
  const svgStruct = container.querySelector('#dual-graph-svg-structure');
  const tooltip = container.querySelector('#dual-graph-tooltip');
  const note = container.querySelector('#dual-graph-note');

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function showTooltip(value, step, clientX, clientY) {
    tooltip.textContent = step ? `${value} (step ${step})` : `${value} (step -)`;
    const box = container.getBoundingClientRect();
    tooltip.style.left = `${clientX - box.left + 12}px`;
    tooltip.style.top = `${clientY - box.top + 12}px`;
    tooltip.hidden = false;
  }

  container.addEventListener('mousemove', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      hideTooltip();
      return;
    }
    const node = target.closest('.dual-graph-node');
    if (!node) {
      hideTooltip();
      return;
    }
    const value = node.getAttribute('data-value');
    if (!value) {
      hideTooltip();
      return;
    }
    const step = node.getAttribute('data-step');
    showTooltip(value, step, event.clientX, event.clientY);
  });

  container.addEventListener('mouseleave', hideTooltip);

  function render() {
    const { startN } = getState();
    const traj = collatzTrajectory(startN);
    const start = traj[0];
    const pathEdges = pathEdgesOnGrid(traj);
    const treePathEdges = pathEdgesOnClassicTree(traj);
    const stepByValue = stepIndexByValue(traj);
    const gridFirstVisible = firstVisibleIndex(traj, GRID);
    const treeFirstVisible = firstVisibleIndex(traj, CLASSIC_NODE_SET);
    const focusValues = focusValuesFromPath(traj);
    const treeFocusValues = treeFocusValuesFromPath(traj);
    const viewBox = buildViewBox(focusValues);
    const treeViewBox = buildTreeViewBox(treeFocusValues);
    const gridExternalStart =
      gridFirstVisible !== 0
        ? {
            startValue: start,
            targetValue: gridFirstVisible > 0 ? traj[gridFirstVisible] : null,
            skippedSteps: gridFirstVisible > 0 ? gridFirstVisible : 0,
          }
        : null;
    const treeExternalStart =
      treeFirstVisible !== 0
        ? {
            startValue: start,
            targetValue: treeFirstVisible > 0 ? traj[treeFirstVisible] : null,
            skippedSteps: treeFirstVisible > 0 ? treeFirstVisible : 0,
          }
        : null;

    renderClassicTree(
      svgPath,
      treePathEdges,
      treeFocusValues,
      treeViewBox,
      stepByValue,
      treeExternalStart,
    );
    renderStructure(svgStruct, pathEdges, viewBox, stepByValue, gridExternalStart);

    const hasAny = pathEdges.length > 0;
    const startOnGrid = start != null && GRID.has(start);
    if (!hasAny && start === 1) {
      note.hidden = false;
      note.textContent = 'Starting at 1, there is no Collatz step to draw on this diagram.';
    } else if (!hasAny && startOnGrid) {
      note.hidden = false;
      note.textContent =
        'Your starting value is visible, but subsequent Collatz steps quickly leave this finite window. Try a value that stays in this window longer (for example 160, 96, or 48).';
    } else if (!hasAny && !startOnGrid) {
      note.hidden = false;
      note.textContent =
        'This window shows odd roots 1 to 17 with doubling values up to 2500. Choose a starting value from this window to see path segments.';
    } else {
      note.hidden = true;
      note.textContent = '';
    }
  }

  subscribe(() => render());
  render();
}
