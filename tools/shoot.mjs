// tools/shoot.mjs — zero-dependency headless screenshotter for visual iteration.
//
// Serves the repo over HTTP (ES modules need http, not file://), launches the
// installed Chrome in headless mode, navigates to a page, waits for the render
// signal (window.__rendered) and captures a PNG. Drives Chrome over the
// DevTools Protocol using Node's built-in WebSocket + fetch (Node >= 22).
//
//   node tools/shoot.mjs test/grid.html#mode=on&temp=1 shots/on.png
//   node tools/shoot.mjs "test/grid.html#mode=off"      shots/off.png
//
// Defaults: page = test/grid.html, out = test/shots/shot.png
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

const page = process.argv[2] || 'test/grid.html';
const out = resolve(ROOT, process.argv[3] || 'test/shots/shot.png');

// --- static file server ---------------------------------------------------
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('404'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/${page}`;

// --- launch headless Chrome with remote debugging -------------------------
const profile = join(ROOT, 'test/.chrome-profile');
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--force-device-scale-factor=2', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

// Chrome prints "DevTools listening on ws://..." to stderr — grab the port.
const wsBrowser = await new Promise((res, rej) => {
  let buf = '';
  const to = setTimeout(() => rej(new Error('Chrome did not start')), 15000);
  chrome.stderr.on('data', (d) => {
    buf += d;
    const m = buf.match(/ws:\/\/[^\s]+/);
    if (m) { clearTimeout(to); res(m[0]); }
  });
});

// --- minimal CDP client over WebSocket ------------------------------------
function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id); pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) listeners.forEach((fn) => fn(msg));
  });
  const ready = new Promise((r) => ws.addEventListener('open', r));
  return {
    ready,
    send: (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const i = ++id; pending.set(i, { resolve, reject });
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    }),
    on: (fn) => listeners.push(fn),
    close: () => ws.close(),
  };
}

const browser = cdp(wsBrowser);
await browser.ready;
// open a fresh tab and attach a flat session to it
const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
const S = sessionId;

await browser.send('Page.enable', {}, S);
await browser.send('Runtime.enable', {}, S);

// navigate and wait for load
const loaded = new Promise((r) => browser.on((m) => { if (m.method === 'Page.loadEventFired' && m.sessionId === S) r(); }));
await browser.send('Page.navigate', { url }, S);
await loaded;

// poll for the render signal the harness sets when drawing is complete
const deadline = Date.now() + 8000;
let okRender = false;
while (Date.now() < deadline) {
  const { result } = await browser.send('Runtime.evaluate', { expression: 'window.__rendered === true', returnByValue: true }, S);
  if (result.value) { okRender = true; break; }
  await new Promise((r) => setTimeout(r, 100));
}
if (!okRender) console.warn('⚠️  render signal not seen — capturing anyway');

const { data } = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, S);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(data, 'base64'));
console.log('📸', out);

browser.close();
chrome.kill();
server.close();
process.exit(0);
