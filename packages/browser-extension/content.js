const api = globalThis.browser ?? globalThis.chrome;
const selector = '[data-jsx-open-in-code-file]';
let active = false;
let token = '';
let current;

const overlay = document.createElement('div');
Object.assign(overlay.style, { position: 'fixed', pointerEvents: 'none', zIndex: '2147483647', border: '2px solid #22c55e', background: 'rgba(34,197,94,.12)', display: 'none', boxSizing: 'border-box' });
document.documentElement.appendChild(overlay);

const breadcrumb = document.createElement('div');
Object.assign(breadcrumb.style, { position: 'fixed', pointerEvents: 'none', zIndex: '2147483647', display: 'none', padding: '8px 12px', border: '2px solid #7c3aed', borderRadius: '6px', background: 'white', color: '#111827', font: '600 12px/1.35 system-ui, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,.2)', whiteSpace: 'nowrap' });
document.documentElement.appendChild(breadcrumb);

function targetAt(node) { return node instanceof Element ? node.closest(selector) : null; }
function componentBreadcrumbs(element) {
  const names = [];
  for (let currentElement = element; currentElement; currentElement = currentElement.parentElement) {
    const name = currentElement.dataset.jsxOpenInCodeComponentLabel;
    if (name && names[0] !== name) names.unshift(name);
  }
  return names;
}
function addText(text, color) {
  const span = document.createElement('span');
  span.textContent = text;
  span.style.color = color;
  breadcrumb.appendChild(span);
}
function renderBreadcrumb(labels) {
  breadcrumb.replaceChildren();
  labels.forEach((label, index) => {
    if (index) addText(' › ', '#111827');
    const parts = label.split(' › ');
    const lastPart = parts.at(-1);
    const functionName = lastPart?.endsWith('()') ? parts.pop() : null;
    const fileName = parts.length ? parts.join(' › ') : label;
    addText(fileName || label, '#2563eb');
    if (functionName) {
      addText(' › ', '#111827');
      addText(functionName, '#15803d');
    }
  });
}
function draw(element) {
  current = element;
  if (!element) { overlay.style.display = 'none'; breadcrumb.style.display = 'none'; return; }
  const rect = element.getBoundingClientRect();
  Object.assign(overlay.style, { display: 'block', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  const labels = componentBreadcrumbs(element);
  if (!labels.length) { breadcrumb.style.display = 'none'; return; }
  renderBreadcrumb(labels);
  breadcrumb.style.display = 'block';
  const labelHeight = breadcrumb.offsetHeight;
  const desiredLeft = Math.max(4, Math.min(rect.left, window.innerWidth - breadcrumb.offsetWidth - 4));
  Object.assign(breadcrumb.style, { left: `${desiredLeft}px`, top: `${Math.max(4, rect.top - labelHeight - 5)}px` });
}
function onMove(event) { if (active) draw(targetAt(event.target)); }
async function onClick(event) {
  if (!active) return;
  const element = targetAt(event.target);
  if (!element) return;
  event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
  const body = { file: element.dataset.jsxOpenInCodeFile, line: Number(element.dataset.jsxOpenInCodeLine), column: Number(element.dataset.jsxOpenInCodeColumn) };
  try {
    const response = await fetch('http://127.0.0.1:48732/open', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-JSX-Open-In-Code-Token': token }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(await response.text());
    disable();
  } catch (error) { alert(`JSX Open in Code could not open this file: ${error.message}`); }
}
function disable() { active = false; draw(null); }
document.addEventListener('mousemove', onMove, true);
document.addEventListener('click', onClick, true);
window.addEventListener('scroll', () => { if (active && current) draw(current); }, true);
api.runtime.onMessage.addListener((message) => {
  if (message.type === 'jsx-open-in-code:enable') { token = message.token; active = true; }
});
