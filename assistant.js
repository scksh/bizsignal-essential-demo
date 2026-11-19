// Graph renderer and graph-view styles adapted from scksh/bizsignal-demo
// (index.html, fcd9425cb3217976070df408f48d7acf90a0d296). No mock graph is loaded.
(() => {
'use strict';
const graphCss = `
.kg-explorer{min-width:0;background:#fff;border:1px solid #e1e7eb;border-radius:13px;overflow:hidden;font-family:inherit;color:#28414e}
.kg-heading{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:21px 23px 18px;background:#fff}
.kg-eyebrow{display:block;color:#8c9ca5;font-size:8px;letter-spacing:1.6px;font-weight:650;margin-bottom:8px}
.kg-heading h2{font-size:15px;font-weight:650;letter-spacing:-.4px;margin:0;color:#294350}
.kg-mock-label{font-size:9px;color:#95a2a9;display:flex;gap:5px;align-items:center;white-space:nowrap}
.kg-mock-label i{width:4px;height:4px;background:#8cbaaa;border-radius:50%}
.kg-stage{position:relative;background:#102534;color:#e5f3f4;isolation:isolate}
.kg-toolbar{position:absolute;z-index:2;top:17px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:center;gap:10px;pointer-events:none}
.kg-toolbar button{pointer-events:auto}
.kg-view-switch,.kg-path-switch{display:flex;align-items:center;gap:3px;border-radius:6px;border:1px solid #7897a12b;padding:3px;background:#0f2534b8;backdrop-filter:blur(6px)}
.kg-view-switch button,.kg-path-switch button{display:flex;align-items:center;justify-content:center;gap:5px;border:0;background:transparent;color:#829fae;font:inherit;font-size:10px;line-height:1.1;min-height:27px;padding:6px 9px;border-radius:4px;cursor:pointer}
.kg-view-switch button[aria-pressed=true],.kg-path-switch button[aria-pressed=true]{color:#d9f6e9;background:#35675966}
.kg-toolbar button:disabled{cursor:default;color:#496673}
.kg-view-switch svg{width:14px;height:14px}
.kg-canvas{display:block;width:100%;height:420px;touch-action:none;outline:0;cursor:grab}
.kg-canvas:focus-visible{outline:2px solid #70c5b2;outline-offset:-3px}
.kg-canvas.is-dragging{cursor:grabbing!important}
.kg-canvas-bottom{position:absolute;bottom:47px;left:21px;right:20px;display:flex;justify-content:space-between;align-items:center;gap:10px;pointer-events:none}
.kg-interaction-hint{font-size:9px;color:#668593}
.kg-interaction-hint i{font-style:normal;margin:0 7px;color:#355969}
.kg-zoom-controls{display:flex;align-items:center;gap:3px;border:1px solid #75959e2c;background:#102635c9;backdrop-filter:blur(4px);border-radius:6px;padding:3px;pointer-events:auto}
.kg-zoom-controls button{width:26px;height:26px;display:grid;place-items:center;padding:0;border:0;border-radius:3px;color:#93afbc;background:none;cursor:pointer}
.kg-zoom-controls button:hover{background:#36566561;color:#e6f4f5}
.kg-zoom-controls button:disabled{opacity:.3;cursor:default}
.kg-zoom-controls button:last-child{border-left:1px solid #7898a32b;border-radius:0;margin-left:3px;padding-left:4px;width:30px}
.kg-zoom-controls svg{width:14px;height:14px}
.kg-zoom-value{font-size:9px;color:#8eacb9;min-width:33px;text-align:center;font-variant-numeric:tabular-nums}
.kg-legend{position:absolute;bottom:0;left:0;right:0;border-top:1px solid #7d9ea314;padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:17px;background:#0e24322b;pointer-events:none}
.kg-legend>span{display:flex;gap:5px;align-items:center;font-size:9px;color:#809da9;white-space:nowrap}
.kg-legend>span>i{width:5px;height:5px;border-radius:50%;background:var(--kg-dot);box-shadow:0 0 6px color-mix(in srgb,var(--kg-dot) 30%,transparent)}
.kg-legend .kg-edge-legend{margin-left:5px}
.kg-legend .kg-edge-legend i{width:13px;height:0;border-radius:0;border-top:1px dashed #9fa085;background:none;box-shadow:none}
.kg-empty{position:absolute;left:20px;right:20px;top:43%;text-align:center;pointer-events:none;color:#c2d8dd}
.kg-empty[hidden]{display:none}
.kg-empty strong{display:block;font-size:14px;font-weight:500}
.kg-empty span{display:block;font-size:11px;color:#7d9ca8;margin-top:9px}
.kg-accessible-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 21px;border-bottom:1px solid #edf1f3;background:#fafcfc}
.kg-accessible-bar label{display:flex;align-items:center;gap:10px;font-size:10px;color:#8a9aa3;flex:1;min-width:0;white-space:nowrap}
.kg-node-picker{font:inherit;font-size:11px;color:#4b6674;max-width:300px;min-width:0;width:100%;padding:6px 24px 6px 8px;background:#fff;border:1px solid #e2e9ec;border-radius:5px;cursor:pointer;text-overflow:ellipsis}
.kg-node-picker:disabled{cursor:default;color:#a0adb4}
.kg-graph-count{font-size:9px;color:#99a7af;white-space:nowrap;font-variant-numeric:tabular-nums}
.kg-inspector{padding:20px 22px 21px;background:white}
.kg-inspector-empty{font-size:12px;color:#91a3ac;line-height:1.8;text-align:center;margin:10px 0}
.kg-selected-heading{display:flex;align-items:center;justify-content:space-between;gap:15px}
.kg-selected-heading>div{min-width:0}
.kg-type-badge{display:inline-flex;align-items:center;gap:5px;font-size:9px;color:#7b919b}
.kg-type-badge i{height:5px;width:5px;border-radius:50%;background:var(--kg-dot)}
.kg-selected-heading h3{font-size:13px;font-weight:600;letter-spacing:-.25px;color:#344f5d;line-height:1.55;margin:7px 0 0;overflow-wrap:anywhere}
.kg-ask-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:10px;border:1px solid #dce9e4;border-radius:5px;padding:9px 10px;background:#f4f9f6;color:#39856f;cursor:pointer;white-space:nowrap;flex-shrink:0}
.kg-ask-button svg{width:13px;height:13px}
.kg-ask-button:hover{background:#e9f5ee;border-color:#bad9cb}
.kg-node-meta{display:flex;flex-wrap:wrap;gap:9px 17px;margin:12px 0 0}
.kg-node-meta:empty{display:none}
.kg-node-meta>span{display:flex;align-items:baseline;gap:7px;font-size:10px;line-height:1.6;color:#65808e;overflow-wrap:anywhere}
.kg-node-meta small{font-size:9px;color:#a1afb6;white-space:nowrap}
.kg-adjacent-header{display:flex;align-items:center;gap:6px;margin-top:19px;padding-top:16px;border-top:1px solid #eef2f3;color:#8a9ba4;font-size:10px}
.kg-adjacent-header strong{font-size:9px;font-weight:500;color:#629180;background:#eff6f2;padding:1px 5px;border-radius:3px}
.kg-adjacent-header>span{margin-left:auto;color:#b2bdc3;font-size:8px}
.kg-adjacent-list{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}
.kg-adjacent-list>button{display:grid;grid-template-columns:auto minmax(0,1fr) 12px;gap:4px 7px;align-items:center;border:1px solid #e8eeef;border-radius:6px;padding:9px 10px;background:#fff;text-align:left;font:inherit;cursor:pointer;min-width:0}
.kg-adjacent-list>button:hover{border-color:#bfdccf;background:#f9fcfa}
.kg-adjacent-type{font-size:8px;padding:3px 4px;background:#eff5f3;color:#729b8b;border-radius:3px;line-height:1.2;white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis}
.kg-adjacent-type.is-candidate{background:#faf5e9;color:#b19a67}
.kg-adjacent-name{font-size:10px;color:#657e8a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kg-adjacent-list small{grid-column:2;font-size:8px;color:#a9b6bc}
.kg-adjacent-list svg{grid-column:3;grid-row:1/3;width:11px;height:11px;color:#b2c0c7}
.kg-no-relations,.kg-more-relations{font-size:10px;color:#a2b1b8;line-height:1.7;margin:3px 0 0;grid-column:1/-1}
.kg-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.kg-explorer button:focus-visible,.kg-explorer select:focus-visible{outline:2px solid #40b79b;outline-offset:3px}
@media(max-width:1100px){.kg-heading{padding:19px 18px 16px}.kg-heading h2{font-size:14px}.kg-mock-label{font-size:8px}.kg-legend{gap:11px;padding-left:14px;padding-right:14px}.kg-accessible-bar{padding:12px 17px}.kg-graph-count{font-size:8px}.kg-inspector{padding:18px}.kg-adjacent-header>span{display:none}.kg-node-picker{max-width:230px}}
@media(max-width:700px){.kg-canvas{height:350px}.kg-accessible-bar{align-items:flex-start}.kg-accessible-bar label{align-items:flex-start;flex-direction:column;gap:6px}.kg-node-picker{max-width:none}.kg-graph-count{padding-top:2px}.kg-mock-label{display:none}.kg-legend{gap:12px;flex-wrap:wrap}.kg-legend>span{font-size:8px}.kg-legend .kg-edge-legend{margin-left:0}.kg-heading{padding:18px}.kg-heading h2{font-size:14px}}
@media(max-width:460px){.kg-canvas{height:300px}.kg-toolbar{left:12px;right:12px;top:12px}.kg-view-switch button,.kg-path-switch button{font-size:9px;padding:6px 7px;min-height:26px}.kg-canvas-bottom{left:13px;right:12px;bottom:48px}.kg-interaction-hint{max-width:135px;line-height:1.7;font-size:8px}.kg-interaction-hint i{margin:0 3px}.kg-legend{gap:9px;padding:12px 9px}.kg-legend .kg-edge-legend{display:none}.kg-heading h2{font-size:13px}.kg-selected-heading{align-items:flex-start}.kg-selected-heading h3{font-size:12px}.kg-ask-button{font-size:9px;padding:8px}.kg-adjacent-list{grid-template-columns:1fr}.kg-accessible-bar{padding:12px 15px}.kg-inspector{padding:16px}.kg-graph-count{font-size:8px}.kg-node-meta{gap:5px 12px}.kg-node-meta>span{font-size:9px}.kg-node-meta small{font-size:8px}}
@media(prefers-reduced-motion:reduce){.kg-explorer *{scroll-behavior:auto}}

`;
const KG_TYPES = {
  plan: { label: '발주계획', color: '#b6d471', angle: -.85, radius: 225 },
  organization: { label: '기관', color: '#e2b577', angle: -2.6, radius: 210 },
  notice: { label: '입찰공고', color: '#40c9a5', angle: -.7, radius: 148 },
  deadline: { label: '일정', color: '#93b5ff', angle: .35, radius: 205 },
  contract: { label: '계약', color: '#ed9fac', angle: .9, radius: 242 },
  supplier: { label: '조달업체', color: '#77c6e3', angle: 1.55, radius: 250 },
  document: { label: '문서', color: '#b4a3ef', angle: 2.5, radius: 180 },
  requirement: { label: '요구조건', color: '#d0b8e5', angle: -1.8, radius: 265 },
  task: { label: '과업', color: '#7fbfc0', angle: -1.1, radius: 290 },
};
const kgEscape = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const kgIcon = (name) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({ plus:'<path d="M10 4v12M4 10h12"/>', minus:'<path d="M4 10h12"/>', reset:'<path d="M4.5 5.5A6.5 6.5 0 1 1 3.5 10M4.5 2v4h4"/>', arrow:'<path d="M4 10h12m-5-5 5 5-5 5"/>', orbit:'<ellipse cx="10" cy="10" rx="8" ry="3.5" transform="rotate(-30 10 10)"/><circle cx="10" cy="10" r="2"/>', chevron:'<path d="m8 5 5 5-5 5"/>' })[name] || ''}</svg>`;
const kgBindings = new WeakMap();

function renderGraphExplorer(types) {
  return `<section class="kg-explorer" aria-label="사업 관계 탐색"><div class="kg-heading"><div><h2>사업 관계 탐색</h2></div></div><div class="kg-stage"><div class="kg-toolbar"><div class="kg-view-switch" role="group" aria-label="그래프 표시 차원"><button type="button" data-kg-view="3d" aria-pressed="true">${kgIcon('orbit')} 3D</button><button type="button" data-kg-view="2d" aria-pressed="false">2D</button></div><div class="kg-path-switch" role="group" aria-label="강조할 관계"><button type="button" data-kg-path="all" aria-pressed="true">관계 전체</button><button type="button" data-kg-path="evidence" aria-pressed="false" disabled>근거 경로</button></div></div><canvas class="kg-canvas" tabindex="0" role="img" aria-label="사업 관계 그래프. 방향키로 회전, 더하기와 빼기로 확대 및 축소할 수 있습니다. 그래프 아래 항목 선택에서도 모든 노드를 탐색할 수 있습니다."></canvas><div class="kg-empty" hidden><strong>아직 연결된 관계가 없습니다.</strong><span>분석할 공고를 선택해 주세요.</span></div><div class="kg-canvas-bottom"><span class="kg-interaction-hint">드래그하여 회전 <i>·</i> 스크롤하여 확대</span><div class="kg-zoom-controls"><button type="button" data-kg-action="out" aria-label="관계 그래프 축소">${kgIcon('minus')}</button><span class="kg-zoom-value" aria-live="off">100%</span><button type="button" data-kg-action="in" aria-label="관계 그래프 확대">${kgIcon('plus')}</button><button type="button" data-kg-action="reset" aria-label="관계 그래프 시점 초기화">${kgIcon('reset')}</button></div></div><div class="kg-legend" aria-label="노드 범례">${types.map(type => `<span><i style="--kg-dot:${KG_TYPES[type].color}"></i>${KG_TYPES[type].label}</span>`).join('')}<span class="kg-edge-legend"><i></i>파생·유사</span></div></div><div class="kg-accessible-bar"><label>연결된 항목 탐색<select class="kg-node-picker" aria-label="관계 그래프 항목 선택"><option value="">항목을 선택하세요</option></select></label><span class="kg-graph-count"></span></div><div class="kg-inspector" aria-label="선택한 항목의 관계"></div><div class="kg-selection-announcement kg-sr-only" role="status" aria-live="polite"></div></section>`;
}

/** 그래프 교체와 근거 경로 강조를 지원하며 영구 애니메이션 루프를 사용하지 않습니다. */
function bindGraphExplorer(container, { graph, focusId, onSelect = () => {} }) {
  const root = container.matches?.('.kg-explorer') ? container : container.querySelector('.kg-explorer');
  if (!root) throw new Error('관계 탐색기 화면을 열 수 없습니다.');
  kgBindings.get(root)?.destroy();
  const canvas = root.querySelector('.kg-canvas');
  const ctx = canvas.getContext('2d');
  const picker = root.querySelector('.kg-node-picker');
  const controller = new AbortController();
  let current = { nodes: [], edges: [] };
  let nodesById = new Map();
  let positions = new Map();
  let projected = [];
  let focus = focusId;
  let selected = null;
  let hovered = null;
  let yaw = -.2;
  let pitch = -.16;
  let zoom = 1;
  let mode = '3d';
  let pathView = false;
  let pathNodes = new Set();
  let pathEdges = new Set();
  let width = 0;
  let height = 0;
  let ratio = 1;
  let frame = 0;
  let destroyed = false;
  let drag = null;
  let lastTouch = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const hash = (value) => [...String(value)].reduce((result, char) => ((result << 5) - result + char.charCodeAt(0)) | 0, 17) >>> 0;
  const safeType = node => KG_TYPES[node.type] || KG_TYPES.notice;
  const announce = message => { root.querySelector('.kg-selection-announcement').textContent = message; };

  function layout() {
    const groups = new Map();
    current.nodes.forEach(node => {
      if (!groups.has(node.type)) groups.set(node.type, []);
      groups.get(node.type).push(node);
    });
    positions = new Map();
    groups.forEach(group => {
      group.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      group.forEach((node, index) => {
        if (node.id === focus) { positions.set(node.id, { x: 0, y: 0, z: 0 }); return; }
        const type = safeType(node);
        const spread = (index - (group.length - 1) / 2) * .31;
        const seed = hash(node.id);
        const angle = type.angle + spread;
        const radius = type.radius + (index % 3 - 1) * 23;
        positions.set(node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * .67, z: ((seed % 241) - 120) * .85 });
      });
    });
  }

  function schedule() {
    if (!frame && !destroyed) frame = requestAnimationFrame(() => { frame = 0; draw(); });
  }

  function resize() {
    if (destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    schedule();
  }

  function project(node) {
    const position = positions.get(node.id);
    let { x, y, z } = position;
    if (mode === '3d') {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
      const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
      z = y * Math.sin(pitch) + rz * Math.cos(pitch);
      x = rx; y = ry;
    } else { z = 0; }
    const perspective = 800 / (800 + z);
    const scale = Math.min(width / 700, height / 465) * zoom;
    const radius = (node.id === focus ? 10 : node.type === 'notice' ? 7 : 5.7) * perspective;
    return { node, x: width / 2 + x * scale * perspective, y: height * .48 + y * scale * perspective, z, radius, perspective };
  }

  function line(from, to, edge, highlighted) {
    const related = selected && (edge.source === selected || edge.target === selected);
    const fade = pathView && !highlighted;
    const color = highlighted ? '#70dec2' : related ? '#8caeae' : '#53707d';
    ctx.globalAlpha = fade ? .13 : highlighted ? .95 : related ? .7 : .35;
    ctx.strokeStyle = color;
    ctx.lineWidth = highlighted ? 1.8 : related ? 1.15 : .8;
    ctx.setLineDash(edge.status === 'candidate' ? [3, 5] : edge.status === 'derived' || edge.status === 'public-report' ? [2, 3] : []);
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.setLineDash([]);
    const direction = Math.atan2(to.y - from.y, to.x - from.x);
    const tipX = from.x + (to.x - from.x) * .82;
    const tipY = from.y + (to.y - from.y) * .82;
    ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX - Math.cos(direction - .45) * 4, tipY - Math.sin(direction - .45) * 4); ctx.moveTo(tipX, tipY); ctx.lineTo(tipX - Math.cos(direction + .45) * 4, tipY - Math.sin(direction + .45) * 4); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!ctx || !width || !height || destroyed) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const background = ctx.createRadialGradient(width * .48, height * .43, 20, width * .5, height * .5, width * .7);
    background.addColorStop(0, '#173a45'); background.addColorStop(.65, '#112b39'); background.addColorStop(1, '#102534');
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    for (let index = 0; index < 72; index++) {
      const seed = hash(`kg-star-${index}`);
      ctx.fillStyle = `rgba(170,206,216,${index % 4 === 0 ? .14 : .06})`;
      ctx.beginPath(); ctx.arc((seed % 1000) / 1000 * width, ((seed >> 9) % 1000) / 1000 * height, index % 4 === 0 ? 1 : .6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#84b9bd12'; ctx.lineWidth = .7;
    ctx.beginPath(); ctx.ellipse(width / 2, height * .49, width * .33, height * .19, mode === '3d' ? -.17 : 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width * .12, height * .48); ctx.lineTo(width * .88, height * .48); ctx.moveTo(width * .5, height * .14); ctx.lineTo(width * .5, height * .81); ctx.stroke();
    ctx.font = '8px system-ui, sans-serif'; ctx.fillStyle = '#92bac436'; ctx.fillText(mode === '3d' ? 'X' : '2D', width * .89, height * .49); ctx.fillText(mode === '3d' ? 'Y' : '', width * .5 + 6, height * .14);
    projected = current.nodes.map(project).sort((a, b) => b.z - a.z);
    const screen = new Map(projected.map(point => [point.node.id, point]));
    current.edges.forEach(edge => {
      const from = screen.get(edge.source); const to = screen.get(edge.target);
      if (from && to) line(from, to, edge, pathView && pathEdges.has(edge.id));
    });
    const occupied = [];
    const labelPoints = [];
    projected.forEach(point => {
      const { node, x, y, radius } = point;
      const chosen = node.id === selected;
      const active = chosen || node.id === hovered || node.id === focus;
      const onPath = pathNodes.has(node.id);
      ctx.globalAlpha = pathView && !onPath && !chosen ? .22 : 1;
      const color = safeType(node).color;
      const glow = ctx.createRadialGradient(x, y, radius * .4, x, y, radius * (active ? 4.5 : 3));
      glow.addColorStop(0, `${color}48`); glow.addColorStop(1, `${color}00`);
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius * (active ? 4.5 : 3), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `${color}${chosen ? 'd9' : '66'}`; ctx.lineWidth = chosen ? 1.5 : .8;
      ctx.beginPath(); ctx.arc(x, y, radius + (chosen ? 5 : 2.5), 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f1fff0a1'; ctx.beginPath(); ctx.arc(x - radius * .18, y - radius * .2, radius * .25, 0, Math.PI * 2); ctx.fill();
      labelPoints.push({ ...point, priority: chosen ? 10 : node.id === hovered ? 9 : node.id === focus ? 8 : onPath && pathView ? 7 : ['organization','notice','contract','supplier'].includes(node.type) ? 3 : 1 });
    });
    ctx.globalAlpha = 1;
    labelPoints.sort((a, b) => b.priority - a.priority).forEach(point => {
      const { node, x, y, radius, priority } = point;
      if (pathView && !pathNodes.has(node.id) && node.id !== selected && priority < 7) return;
      const labelLimit = width < 400 ? (priority >= 7 ? 16 : 12) : (priority >= 7 ? 24 : 15);
      const text = node.label.length > labelLimit ? `${node.label.slice(0, labelLimit - 1)}…` : node.label;
      ctx.font = `${priority >= 7 ? '500 11' : '10'}px system-ui, -apple-system, sans-serif`;
      const textWidth = ctx.measureText(text).width;
      const bx = clamp(x - textWidth / 2 - 5, 4, Math.max(4, width - textWidth - 14));
      const by = y + radius + 9;
      const box = { x: bx, y: by, w: textWidth + 10, h: 18 };
      const overlaps = candidate => occupied.some(item => candidate.x < item.x + item.w && candidate.x + candidate.w > item.x && candidate.y < item.y + item.h && candidate.y + candidate.h > item.y);
      if (priority >= 7 && overlaps(box)) {
        for (const offset of [21, -21, 42, -42]) {
          const candidate = { ...box, y: by + offset };
          if (candidate.y >= 46 && candidate.y + 18 < height - 65 && !overlaps(candidate)) { box.y = candidate.y; break; }
        }
      }
      const collides = overlaps(box);
      if (priority < 7 && (collides || by > height - 65 || by < 43)) return;
      occupied.push(box);
      ctx.fillStyle = priority >= 7 ? '#102c38e8' : '#102b37c7'; ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.fillStyle = priority >= 7 ? '#f1fffa' : '#b0c8d1'; ctx.textBaseline = 'middle'; ctx.fillText(text, box.x + 5, box.y + 9); ctx.textBaseline = 'alphabetic';
    });
  }

  function metaRows(node) {
    const names = { budget: '배정예산', contractAmount: '계약금액', amount: '금액', category: '분야', year: '연도', region: '지역', status: '상태', source: '근거', section: '문서 조항', noticeNumber: '공고번호', contractNumber: '계약번호', bidNtceNo: '공고번호', bidNtceOrd: '공고차수', title: '명칭', organization: '발주기관', supplier: '업체', matchStatus: '연결 상태', sourceKey: '원천 키', sourceField: '원천 필드' };
    return Object.entries(node.meta || {}).filter(([key, value]) => names[key] && value != null && ['string','number','boolean'].includes(typeof value)).slice(0, 3).map(([key, value]) => `<span><small>${names[key]}</small>${kgEscape(typeof value === 'number' && /amount|budget/i.test(key) ? `${value.toLocaleString('ko-KR')}원` : value)}</span>`).join('');
  }

  function inspect() {
    const node = nodesById.get(selected);
    const inspector = root.querySelector('.kg-inspector');
    if (!node) { inspector.innerHTML = '<p class="kg-inspector-empty">항목을 선택하면 연결된 관계와 근거를 확인할 수 있습니다.</p>'; picker.value = ''; return; }
    const adjacent = current.edges.filter(edge => edge.source === node.id || edge.target === node.id);
    const type = safeType(node);
    inspector.innerHTML = `<div class="kg-selected-heading"><div><span class="kg-type-badge" style="--kg-dot:${type.color}"><i></i>${type.label}</span><h3>${kgEscape(node.label)}</h3></div><button type="button" class="kg-ask-button" data-kg-action="ask">이 관계로 질문 ${kgIcon('arrow')}</button></div><div class="kg-node-meta">${metaRows(node)}</div><div class="kg-adjacent-header">연결된 관계 <strong>${adjacent.length}</strong><span></span></div><div class="kg-adjacent-list">${adjacent.slice(0, 6).map(edge => {
      const other = nodesById.get(edge.source === node.id ? edge.target : edge.source);
      if (!other) return '';
      const status = edge.status === 'candidate' ? '유사 후보' : edge.status === 'derived' ? '파생 관계' : edge.status === 'official-source' ? '공식 원문' : edge.status === 'public-report' ? '공개 집계 근거' : '공고 정보';
      return `<button type="button" data-kg-node="${kgEscape(other.id)}" title="${kgEscape(`${edge.label || edge.type} · ${status} · ${other.label}`)}"><span class="kg-adjacent-type ${edge.status === 'candidate' ? 'is-candidate' : ''}">${kgEscape(edge.label || edge.type)}</span><span class="kg-adjacent-name">${kgEscape(other.label)}</span><small>${status}${edge.evidence?.length ? ` · 근거 ${edge.evidence.length}` : ''}</small>${kgIcon('chevron')}</button>`;
    }).join('') || '<span class="kg-no-relations">연결된 관계가 없습니다.</span>'}</div>${adjacent.length > 6 ? '<p class="kg-more-relations">나머지 항목은 위의 항목 선택 목록에서 확인할 수 있습니다.</p>' : ''}`;
    picker.value = node.id;
  }

  function controls() {
    root.querySelectorAll('[data-kg-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.kgView === mode)));
    root.querySelectorAll('[data-kg-path]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.kgPath === 'evidence') === pathView)));
    root.querySelector('[data-kg-path="evidence"]').disabled = !pathNodes.size;
    root.querySelector('.kg-zoom-value').textContent = `${Math.round(zoom * 100)}%`;
    root.querySelector('.kg-interaction-hint').innerHTML = mode === '3d' ? '드래그하여 회전 <i>·</i> 스크롤하여 확대' : '항목을 선택해 관계 확인 <i>·</i> 스크롤하여 확대';
    root.querySelector('[data-kg-action="out"]').disabled = zoom <= .65;
    root.querySelector('[data-kg-action="in"]').disabled = zoom >= 2.2;
  }

  function selectNode(id, emit = true) {
    if (!nodesById.has(id) || destroyed) return;
    const changed = selected !== id;
    selected = id;
    inspect(); schedule();
    announce(`${safeType(nodesById.get(id)).label}, ${nodesById.get(id).label} 선택됨`);
    if (emit && changed) onSelect(nodesById.get(id));
  }

  function setGraph(nextGraph, nextFocusId) {
    if (destroyed) return;
    const inputNodes = Array.isArray(nextGraph?.nodes) ? nextGraph.nodes : [];
    nodesById = new Map(inputNodes.filter(node => node && node.id && typeof node.label === 'string').map(node => [node.id, node]));
    current = { nodes: [...nodesById.values()], edges: (Array.isArray(nextGraph?.edges) ? nextGraph.edges : []).filter(edge => edge && nodesById.has(edge.source) && nodesById.has(edge.target)) };
    focus = nodesById.has(nextFocusId) ? nextFocusId : current.nodes[0]?.id;
    selected = focus || null;
    hovered = null;
    pathNodes = new Set(); pathEdges = new Set(); pathView = false;
    yaw = -.2; pitch = -.16; zoom = 1;
    layout();
    const types = Object.keys(KG_TYPES);
    picker.innerHTML = current.nodes.length ? types.map(type => {
      const nodes = current.nodes.filter(node => node.type === type);
      return nodes.length ? `<optgroup label="${KG_TYPES[type].label}">${nodes.map(node => `<option value="${kgEscape(node.id)}">${kgEscape(node.label)}</option>`).join('')}</optgroup>` : '';
    }).join('') : '<option value="">연결된 항목 없음</option>';
    picker.disabled = !current.nodes.length;
    root.querySelector('.kg-graph-count').textContent = `${current.nodes.length}개 항목 · ${current.edges.length}개 관계`;
    root.querySelector('.kg-empty').hidden = Boolean(current.nodes.length);
    inspect(); controls(); schedule();
  }

  function highlightPath(nodeIds = [], edgeIds = []) {
    pathNodes = new Set(nodeIds.filter(id => nodesById.has(id)));
    pathEdges = new Set(edgeIds.filter(id => current.edges.some(edge => edge.id === id)));
    current.edges.filter(edge => pathEdges.has(edge.id)).forEach(edge => { pathNodes.add(edge.source); pathNodes.add(edge.target); });
    pathView = pathNodes.size > 0;
    controls(); schedule();
    announce(pathView ? `근거 경로 ${pathNodes.size}개 항목, ${pathEdges.size}개 관계를 강조합니다.` : '전체 관계를 표시합니다.');
  }

  function setZoom(value) { zoom = clamp(value, .65, 2.2); controls(); schedule(); }
  function pick(x, y) {
    return [...projected].reverse().filter(point => !pathView || pathNodes.has(point.node.id) || point.node.id === selected).find(point => Math.hypot(point.x - x, point.y - y) <= Math.max(point.radius + 8, 15))?.node;
  }
  function pointFromEvent(event) { const bounds = canvas.getBoundingClientRect(); return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; }
  function pointerEnd(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = pointFromEvent(event);
    if (drag.distance < 5 && event.type !== 'pointercancel') {
      const node = pick(point.x, point.y);
      if (node) selectNode(node.id);
    }
    drag = null; canvas.classList.remove('is-dragging');
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || !root.contains(button)) return;
    if (button.dataset.kgNode) { selectNode(button.dataset.kgNode); return; }
    if (button.dataset.kgView) { mode = button.dataset.kgView; controls(); schedule(); announce(`${mode === '3d' ? '3차원' : '2차원'} 보기`); return; }
    if (button.dataset.kgPath) { pathView = button.dataset.kgPath === 'evidence' && pathNodes.size > 0; controls(); schedule(); return; }
    switch (button.dataset.kgAction) {
      case 'in': setZoom(zoom + .15); break;
      case 'out': setZoom(zoom - .15); break;
      case 'reset': yaw = -.2; pitch = -.16; zoom = 1; controls(); schedule(); announce('그래프 시점을 초기화했습니다.'); break;
      case 'ask': if (nodesById.has(selected)) onSelect(nodesById.get(selected)); break;
    }
  }, { signal: controller.signal });
  picker.addEventListener('change', () => selectNode(picker.value), { signal: controller.signal });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    if (event.pointerType === 'touch') lastTouch = Date.now();
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging'); canvas.focus({ preventScroll: true });
  }, { signal: controller.signal });
  canvas.addEventListener('pointermove', event => {
    if (drag && drag.pointerId === event.pointerId) {
      const dx = event.clientX - drag.x; const dy = event.clientY - drag.y;
      drag.distance += Math.hypot(dx, dy); drag.x = event.clientX; drag.y = event.clientY;
      if (mode === '3d') { yaw += dx * .007; pitch = clamp(pitch + dy * .005, -1.1, 1.1); schedule(); }
      return;
    }
    if (Date.now() - lastTouch < 600) return;
    const point = pointFromEvent(event); const next = pick(point.x, point.y)?.id || null;
    if (next !== hovered) { hovered = next; canvas.style.cursor = next ? 'pointer' : mode === '3d' ? 'grab' : 'default'; schedule(); }
  }, { signal: controller.signal });
  canvas.addEventListener('pointerup', pointerEnd, { signal: controller.signal });
  canvas.addEventListener('pointercancel', pointerEnd, { signal: controller.signal });
  canvas.addEventListener('pointerleave', () => { if (!drag) { hovered = null; schedule(); } }, { signal: controller.signal });
  canvas.addEventListener('wheel', event => { event.preventDefault(); setZoom(zoom * (event.deltaY > 0 ? .92 : 1.08)); }, { passive: false, signal: controller.signal });
  canvas.addEventListener('keydown', event => {
    const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','_','Home'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === '+' || event.key === '=') setZoom(zoom + .15);
    else if (event.key === '-' || event.key === '_') setZoom(zoom - .15);
    else if (event.key === 'Home') { yaw = -.2; pitch = -.16; zoom = 1; controls(); }
    else if (mode === '3d') {
      const step = reducedMotion ? .12 : .16;
      if (event.key === 'ArrowLeft') yaw -= step;
      if (event.key === 'ArrowRight') yaw += step;
      if (event.key === 'ArrowUp') pitch = clamp(pitch - step, -1.1, 1.1);
      if (event.key === 'ArrowDown') pitch = clamp(pitch + step, -1.1, 1.1);
    }
    schedule();
  }, { signal: controller.signal });
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  if (!observer) window.addEventListener('resize', resize, { signal: controller.signal });
  function destroy() {
    if (destroyed) return;
    destroyed = true; controller.abort(); observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0; projected = []; positions.clear();
    kgBindings.delete(root);
  }
  const api = { setGraph, highlightPath, selectNode, destroy };
  kgBindings.set(root, api);
  setGraph(graph, focusId); resize();
  if (!ctx) announce('이 브라우저는 Canvas를 지원하지 않습니다. 항목 선택 목록으로 관계를 탐색할 수 있습니다.');
  return api;
}




  const chatCss=`
  .bzg {color:#28414e;--paper:#fff;line-height:1.55;min-width:0}
  .bzg *, .bzg *::before, .bzg *::after {box-sizing:border-box}
  .bzg h1,.bzg h2,.bzg h3,.bzg p {margin:0}
  .bzg .page-heading h1{font-size:29px;letter-spacing:-1.1px;margin:7px 0 8px}
  .bzg header p,.bzg .smallnote{color:#788c98;font-size:12px;line-height:1.55}
  .bzg-head,.bzg-pick,.bzg-composer,.bzg-tools,.bzg-mode,.bzg-evidence-links {display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .bzg-head {justify-content:space-between;align-items:center;margin-bottom:25px}
  .bzg-mode {color:#598774;border:1px solid #c5ded0;border-radius:6px;background:#f0f8f4;font-size:11px;padding:7px 10px}
  .bzg-mode:before{content:'';width:5px;height:5px;background:#58ad88;border-radius:50%}
  .bzg-pick {background:#fff;border:1px solid var(--line);border-radius:10px;padding:15px 18px;margin-bottom:18px}
  .bzg select,.bzg textarea,.bzg button {font:inherit;color:inherit}
  .bzg label {font-size:13px;font-weight:650}
  .bzg select {min-width:0;max-width:100%;border:1px solid #dfe7eb;border-radius:7px;background:white;font-size:14px;padding:7px;color:#334c5c}
  .bzg-pick select {flex:1 1 280px}
  .bzg-cols {display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:18px;align-items:start}
  .bzg .chatbox,.bzg .kbbox {min-width:0;background:#fff;border:1px solid var(--line);border-radius:11px;overflow:hidden}
  .bzg .chatbar {display:flex;align-items:center;justify-content:space-between;gap:7px;padding:12px 15px;border-bottom:1px solid var(--line);flex-wrap:wrap}
  .bzg h2 {font-size:17px;letter-spacing:-.045em}
  .bzg .chatbar select {max-width:195px;height:32px;font-size:12px}
  .bzg-action,.bzg-prompt {cursor:pointer;background:white;border:1px solid #c5d8cb;color:#164d38;border-radius:7px;padding:6px 9px;line-height:1.4;font-size:13px!important}
  .bzg-action:hover,.bzg-prompt:hover {background:#edf6ef}
  .bzg button:focus-visible,.bzg a:focus-visible,.bzg summary:focus-visible,.bzg select:focus-visible,.bzg textarea:focus-visible{outline:3px solid #39a185;outline-offset:2px}
  .bzg .thread {min-height:210px;max-height:500px;overflow:auto;padding:15px 16px;background:#fafcfc;overscroll-behavior:contain}
  .bzg .emptychat {padding:16px 0 14px}
  .bzg .emptychat b {display:block;font-size:18px;letter-spacing:-.04em;margin:0 0 6px}
  .bzg .user-msg {margin:12px 0 12px auto;width:fit-content;max-width:88%;border-radius:12px 12px 3px 12px;padding:8px 12px;background:#e0f1e9;color:#123e2b;font-size:15px;overflow-wrap:anywhere}
  .bzg .bot-msg {color:#28414e;padding-bottom:12px}
  .bzg .bot-msg>strong {color:#126047;font-size:12px}
  .bzg .answer-text {font-size:15px;line-height:1.65;margin:3px 0 6px;overflow-wrap:anywhere}
  .bzg .evidence-panel {margin:6px 0;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:white}
  .bzg .evidence-panel>summary {font-size:13px;font-weight:630;color:#27543e;cursor:pointer}
  .bzg .claim {margin-top:8px;border-top:1px solid #e0eae3;padding-top:8px;font-size:13px;color:#395749;line-height:1.6;overflow-wrap:anywhere}
  .bzg .claim b {color:#213e2f}
  .bzg .claim small {display:block;color:#596f61;margin:3px 0}
  .bzg a,.bzg .linkbtn {font:inherit;font-size:12px;color:#086747;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
  .bzg .linkbtn {border:0;background:transparent;padding:0}
  .bzg .messages-form {padding:13px 14px;border-top:1px solid var(--line)}
  .bzg .prompt-list {display:flex;gap:5px;flex-wrap:wrap;margin:0 0 9px}
  .bzg-prompt {background:#f5f9f4;font-size:12px!important}
  .bzg .bzg-composer {align-items:stretch;flex-wrap:nowrap}
  .bzg textarea {flex:1;min-width:0;min-height:52px;max-height:150px;resize:vertical;border:1px solid #bacdc1;border-radius:9px;padding:8px 10px;background:white;font-size:14px}
  .bzg .send {border:0;border-radius:8px;background:var(--teal);color:white;padding:6px 10px;min-width:55px;font-size:14px;cursor:pointer}
  .bzg .send:disabled {background:#a0b3a7;cursor:wait}
  .bzg .kg-heading {padding:12px 15px}.bzg .kg-heading h2{font-size:16px}
  .bzg .kg-explorer {border:0;border-radius:0}
  .bzg .kg-canvas {height:340px}.bzg .kg-inspector {padding:12px 13px}
  .bzg .kg-toolbar {top:9px;left:9px;right:9px}.bzg .kg-legend {flex-wrap:wrap;gap:7px 12px}
  .bzg .kg-interaction-hint {display:none}.bzg .kg-canvas-bottom {justify-content:flex-end}
  .bzg .kg-adjacent-header>span {display:none}.bzg .kg-accessible-bar {padding:8px 12px;flex-wrap:wrap}
  .bzg .kg-adjacent-list {grid-template-columns:repeat(auto-fit,minmax(min(100%,145px),1fr))}
  .bzg .kg-adjacent-list button {min-width:0}.bzg .kg-node-picker{min-width:0;max-width:100%}
  .bzg .kg-node-picker,.bzg .kg-graph-count,.bzg .kg-adjacent-name,.bzg .kg-ask-button,.bzg .kg-legend>span{font-size:11px}
  .bzg .kg-adjacent-name,.bzg .kg-inspector h3{color:#344f5d;font-size:13px}
  .bzg .kg-adjacent-type,.bzg .kg-adjacent-header,.bzg .kg-type-badge,.bzg .kg-adjacent-list small,.bzg .kg-graph-count,.bzg .kg-node-meta small{color:#6c8592;font-size:12px}
  .bzg .kg-legend>span,.bzg .kg-zoom-value{color:#c5dfd5}
  .bzg .graph-size{padding:8px 13px;border-bottom:1px solid var(--line);font-size:12px}
  .bzg .visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  @media(max-width:940px){.bzg-cols{grid-template-columns:1fr}.bzg .thread{max-height:445px}.bzg .kg-canvas{height:265px}}
  `;
  const nodeType={Notice:'notice',Organization:'organization',Document:'document',Passage:'document',Task:'task',Requirement:'requirement',Review:'requirement',Contract:'contract',Supplier:'supplier',Deadline:'deadline',Change:'deadline',Amount:'notice',OrderPlan:'plan'};
  const prompts=['어떤 과업을 수행하나요?','참가조건의 원문은?','유사 계약금액 범위는?','정정된 내용이 있나요?'];
  let graphCache, cacheSample, dispose=()=>{}, windowThreads;
  const safeText=kgEscape;
  function external(raw) {
    try {const u=new URL(raw);return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}
  }
  function loadThreads(version) {
    if(windowThreads?.version===version)return windowThreads;
    try {
      const state=JSON.parse(localStorage.getItem('bizsignal.graphchat.release.v1'));
      if(state?.version===version&&Array.isArray(state.threads)&&state.threads.every(t=>typeof t.id==='string'&&Array.isArray(t.messages)))return windowThreads=state;
    }catch {}
    return windowThreads={version,threads:[]};
  }
  function persist(){try{localStorage.setItem('bizsignal.graphchat.release.v1',JSON.stringify(windowThreads));}catch{}}
  function render(container,{noticeId,onOpenNotice}={}) {
    dispose();if(!container)return;
    const data=window.BIZ_SAMPLE, engine=window.BizGraph;
    if(!engine || !data?.notices?.length){container.textContent='로컬 공고 자료와 그래프 검색기를 불러와야 합니다.';return;}
    if(!graphCache||data!==cacheSample){graphCache=engine.build(data,window.BizMarket);cacheSample=data;}
    const graph=graphCache, threads=loadThreads(graph.version), sourceMap=graph.index.sourceMap;
    const localDocs=new Map();
    for(const f of data.measurement?.documentFiles||[]){
      const n=data.notices.find(n=>n.id===f.noticeId);
      const href=n?.docs?.find(doc=>doc.title===f.name)?.url;
      if(href&&/^[a-f0-9]{64}$/.test(f.sha256))localDocs.set(external(href).split('#')[0],f.sha256);
    }
    const controller=new AbortController(),host=document.createElement('div');
    host.className='bzg';container.replaceChildren(host);
    const styleId='bizsignal-rag-chat-style';
    if(!document.getElementById(styleId)){const style=document.createElement('style');style.id=styleId;style.textContent=graphCss+chatCss;document.head.append(style);}
    let current=data.notices.find(n=>n.id===noticeId)||data.notices[0],thread,turns=[],view,neighborhood,visible=new Set(),representatives=new Set(),allShown=false,transport='브라우저 검색',seq=0,busy=false;
    const localHost=(location.protocol==='http:'||location.protocol==='https:')&&['localhost','127.0.0.1'].includes(location.hostname);
    const $=s=>host.querySelector(s);
    function newThread() {
      const t={id:globalThis.crypto?.randomUUID?.()||('t-'+Date.now()+'-'+Math.random()),noticeId:current.id,messages:[]};
      threads.threads.unshift(t);
      if(threads.threads.length>50)threads.threads.length=50;
      persist();return t;
    }
    function restore(id) {
      thread=threads.threads.find(t=>t.noticeId===current.id&&(!id||t.id===id))||newThread();
      turns=[];
      for(const m of thread.messages.slice(-32)){
        const result=engine.ask(graph,{noticeId:current.id,question:m.question,focusNodeId:m.focusNodeId,history:turns.slice(-8).map(t=>t.context)});
        turns.push(result);
      }
    }
    function mode() {const badge=$('.bzg-mode');if(badge)badge.textContent=transport+' · GraphRAG';}
    async function detect() {
      if(!localHost)return;
      try{
        const r=await fetch('/v1/assistant/health',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(3000)])});
        if(r.ok){const h=await r.json();if(h.service==='bizsignal-graphrag'&&h.version===graph.version){transport='로컬 서버';mode();messages();}}
      }catch{}
    }
    function toVisual() {
      const nodes=[...visible].map(id=>graph.index.byId.get(id)).filter(Boolean).map(n=>({id:n.id,type:nodeType[n.type]||'document',label:n.label,
        meta:{section:n.locator,contractAmount:n.type==='Contract'?n.amount:undefined,noticeNumber:n.noticeNo}}));
      const edges=[...neighborhood.edgeMap.values()].filter(e=>visible.has(e.source)&&visible.has(e.target)).map(e=>({...e,label:engine.edgeLabels[e.type]||e.type,evidence:e.sourceIds}));
      return {nodes,edges};
    }
    function mark(paths) {
      if(!paths.length)return;
      const focus=new Set(paths.flatMap(p=>p.nodeIds)), ids=[...focus];
      if(ids.some(id=>!visible.has(id))){ids.forEach(id=>visible.add(id));view.setGraph(toVisual(),neighborhood.root);}
      view.highlightPath(ids,[...new Set(paths.flatMap(p=>p.edgeIds))]);
    }
    function link(s,i) {
      const url=external(s?.url);if(!url)return '';
      const base=url.split('#')[0],sha=localDocs.get(base),page=url.match(/#page=\d+$/)?.[0]||'';
      const online=`<a href="${safeText(url)}" target="_blank" rel="noopener noreferrer">[${i}] ${safeText(s.where)}</a>`;
      return transport==='로컬 서버'&&sha?online+` <a href="/v1/assistant/documents/${sha}${page}" target="_blank" rel="noopener noreferrer">로컬 원문</a>`:online;
    }
    function claimHtml(c,idx,turn,index) {
      const path=c.path.nodeIds.map(id=>graph.index.byId.get(id)?.label||'').filter(Boolean);
      const links=c.sourceIds.map(id=>link(sourceMap.get(id),index.get(id))).join(' ');
      return `<article class="claim"><b>${safeText(c.label)}</b>${c.status==='candidate'?' · 비교 후보':''}<p>${safeText(c.text)}</p><small>${path.map(safeText).join(' › ')}</small><div class="bzg-evidence-links">${links}<button class="linkbtn" type="button" data-turn="${turn}" data-claim="${idx}">그래프에서 보기</button></div></article>`;
    }
    function messages() {
      const el=$('.thread');
      if(!turns.length){el.innerHTML='<div class="emptychat"><b>이 공고에서 무엇을 확인할까요?</b><p class="smallnote">참가자격, 일정, 과거 계약을 물어보세요. 답변에서 문서의 쪽·조항과 연결 경로를 열 수 있습니다.</p></div>';return;}
      el.innerHTML=turns.map((r,idx)=>{
        const badge=({supported:'근거 확인',missing:'근거 부족',partial:'일부 확인', 'needs-review':'근거 대조 필요'})[r.status];
        const index=new Map(r.citations.map((s,i)=>[s.id,i+1]));
        const primary=[...new Set(r.claims.slice(0,3).map(c=>c.sourceIds[0]))];
        return `<p class="user-msg">${safeText(r.question)}</p><div class="bot-msg"><strong>BizSignal · ${badge}</strong><p class="answer-text">${safeText(r.summary)}</p>
        <div class="bzg-evidence-links">${primary.map(id=>link(sourceMap.get(id),index.get(id))).join('')}</div>
        ${r.claims.length?`<details class="evidence-panel"><summary>근거 ${r.citations.length}개 · ${r.claims.length}개 항목 확인</summary>${r.claims.map((c,i)=>claimHtml(c,i,idx,index)).join('')}</details>`:''}</div>`;
      }).join('');
      el.scrollTop=el.scrollHeight;
    }
    function threadOptions(){
      return threads.threads.filter(t=>t.noticeId===current.id).map(t=>`<option value="${safeText(t.id)}"${t===thread?' selected':''}>${safeText(t.messages[0]?.question||'대화 기록 선택')}</option>`).join('');
    }
    function mount(){
      seq++;busy=false;view?.destroy();neighborhood=engine.walk(graph,current.id);
      visible=new Set([neighborhood.root]);allShown=false;
      const reachable=[...neighborhood.paths.entries()];
      for(const type of ['OrderPlan','Organization','Contract','Requirement','Task','Deadline','Document','Change','Supplier','Review','Amount']){
        const match=reachable.find(([id])=>graph.index.byId.get(id)?.type===type && !visible.has(id));
        if(!match)continue;
        const path=match[1];
        if(visible.size+path.nodeIds.filter(x=>!visible.has(x)).length<=12)path.nodeIds.forEach(k=>visible.add(k));
      }
      representatives=new Set(visible);
      const types=[...new Set(toVisual().nodes.map(n=>n.type))];
      host.innerHTML=`<header class="bzg-head page-heading"><div><span class="eyebrow">BIZSIGNAL INTELLIGENCE</span><h1>AI 사업 도우미</h1><p>공고별 대화 · 근거를 검색해 구성하는 답변</p></div><span class="bzg-mode"></span></header>
        <div class="bzg-pick"><label for="bza-notice-select">검토할 공고</label><select id="bza-notice-select">${data.notices.map(n=>`<option value="${safeText(n.id)}"${n.id===current.id?' selected':''}>${safeText(n.title)}</option>`).join('')}</select>${onOpenNotice?'<button class="bzg-action" type="button" data-open-detail>공고 상세</button>':''}</div>
        <div class="bzg-cols"><aside class="kbbox" aria-label="공고 근거 그래프"><div class="graph-size"><button class="linkbtn" data-all-nodes type="button">연결된 항목 전체 ${neighborhood.paths.size}개 보기</button></div>${renderGraphExplorer(types)}</aside><section class="chatbox"><div class="chatbar"><h2>공고 검토 대화</h2><div class="bzg-tools"><select aria-label="이 공고의 대화 기록" class="thread-select">${threadOptions()}</select><button class="bzg-action" data-new-chat type="button">새 대화</button></div></div>
        <div class="thread" role="log" aria-live="polite" aria-label="대화 내용"></div>
        <form class="messages-form"><div class="prompt-list">${prompts.map(p=>`<button class="bzg-prompt" data-prompt="${safeText(p)}" type="button">${safeText(p)}</button>`).join('')}</div>
        <div class="bzg-composer"><textarea aria-label="공고 검토 질문" rows="2" maxlength="600" required placeholder="궁금한 내용을 입력하세요"></textarea><button class="send" type="submit">보내기</button></div><small class="smallnote" aria-live="polite" data-feedback>Enter로 전송 · Shift+Enter로 줄바꿈</small></form></section>
        </div>`;
      view=bindGraphExplorer(host,{graph:toVisual(),focusId:neighborhood.root,onSelect:n=>send(n.label+'의 근거를 보여줘',n.id)});
      mode();messages();
    }
    async function send(raw,focusNodeId) {
      if(busy)return;
      const q=raw.trim();if(!q||q.length>600)return;
      const ticket=++seq;
      const input=$('textarea'), pending=$('[data-feedback]');busy=true;$('.send').disabled=true;pending.textContent='공고의 근거와 관계 경로를 조회하고 있습니다.';
      try{
        const request={noticeId:current.id,question:q,focusNodeId,history:turns.slice(-8).map(t=>t.context)};
        let reply;
        if(transport==='로컬 서버'){
          try {
            const res=await fetch('/v1/assistant/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(6000)])});
            if(!res.ok) throw new Error('query');
            reply=await res.json();
            if(reply.version!==graph.version)throw new Error('release');
          }catch{if(controller.signal.aborted||ticket!==seq)return;transport='브라우저 검색';mode();}
        }
        if(!reply)reply=engine.ask(graph,request);
        if(controller.signal.aborted||ticket!==seq)return;
        turns.push(reply);thread.messages.push({question:q,focusNodeId:focusNodeId||undefined});
        if(thread.messages.length>32){thread.messages.shift();turns.shift();}
        persist();input.value='';$('.thread-select').innerHTML=threadOptions();messages();
        if(reply.claims.length) mark(reply.claims.map(c=>c.path));else view.highlightPath([],[]);
        pending.textContent=reply.followup?'이전 답변의 문맥을 사용했습니다.':'Enter로 전송 · Shift+Enter로 줄바꿈';
      }catch{if(ticket===seq)pending.textContent='질문을 처리하지 못했습니다. 다시 시도해 주세요.';}
      finally{if(ticket===seq&&!controller.signal.aborted){busy=false;$('.send').disabled=false;}}
    }
    host.addEventListener('click',event=>{
      const btn=event.target.closest('button');if(!btn)return;
      if(btn.hasAttribute('data-open-detail'))onOpenNotice?.(current.id);
      if(btn.hasAttribute('data-new-chat')){thread=newThread();turns=[];mount();$('textarea').focus();}
      if(btn.hasAttribute('data-all-nodes')){
        allShown=!allShown;visible=new Set(allShown?neighborhood.paths.keys():representatives);
        view.setGraph(toVisual(),neighborhood.root);
        btn.textContent=allShown?'대표 근거로 돌아가기':'연결된 항목 전체 '+neighborhood.paths.size+'개 보기';
      }
      if(btn.hasAttribute('data-prompt'))send(btn.dataset.prompt);
      if(btn.hasAttribute('data-claim')){
        const c=turns[+btn.dataset.turn]?.claims[+btn.dataset.claim];
        if(c){mark([c.path]);view.selectNode(c.id,false);$('.kbbox').scrollIntoView({block:'nearest'});}
      }
    },{signal:controller.signal});
    host.addEventListener('change',event=>{
      if(event.target.id==='bza-notice-select'){const n=data.notices.find(n=>String(n.id)===event.target.value);if(n){current=n;restore();mount();}}
      else if(event.target.matches('.thread-select')){restore(event.target.value);mount();}
    },{signal:controller.signal});
    host.addEventListener('submit',event=>{if(event.target.matches('.messages-form')){event.preventDefault();send($('textarea').value);}}, {signal:controller.signal});
    host.addEventListener('keydown',event=>{if(event.target.matches('textarea')&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229){event.preventDefault();send(event.target.value);}}, {signal:controller.signal});
    restore();mount();detect();
    dispose=()=>{seq++;view?.destroy();controller.abort();dispose=()=>{};};
  }
  window.BizAssistant={render,destroy:()=>dispose()};

})();
