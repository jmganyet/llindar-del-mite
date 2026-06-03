// tools/shoot.mjs — zero-dependency screenshotter + console capture for visual
// iteration and self-debugging.
//
// Serves the repo over HTTP (ES modules need http, not file://), drives Chrome
// over the DevTools Protocol (Node built-in WebSocket + fetch, Node >= 22),
// navigates to a page, waits for the render signal (window.__rendered),
// captures a PNG, AND prints every browser console message + uncaught
// exception to stdout — so a broken render shows its JS error, not a blank PNG.
//
//   node tools/shoot.mjs test/grid.html#mode=on&temp=1 shots/on.png
//   node tools/shoot.mjs "test/grid.html#mode=off"      shots/off.png
//
// Headless by default (spawns its own Chrome). To instead attach to a Chrome
// you already have open (so you can watch the tab live), launch that Chrome with
//   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
// then run with CHROME_REMOTE set:
//   CHROME_REMOTE=9222 node tools/shoot.mjs "test/grid.html#mode=on" shots/x.png
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

// --- get a browser-level CDP endpoint -------------------------------------
// either attach to a Chrome you already have open (CHROME_REMOTE=<port>),
// or spawn a fresh headless one and read its ws endpoint from stderr.
let chrome = null;
let wsBrowser;
if (process.env.CHROME_REMOTE) {
  const port = process.env.CHROME_REMOTE;
  const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  wsBrowser = info.webSocketDebuggerUrl;
  console.log(`🔗 attached to Chrome on :${port}`);
} else {
  const profile = join(ROOT, 'test/.chrome-profile');
  chrome = spawn(CHROME, [
    '--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--force-device-scale-factor=2', `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  wsBrowser = await new Promise((res, rej) => {
    let buf = '';
    const to = setTimeout(() => rej(new Error('Chrome did not start')), 15000);
    chrome.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(to); res(m[0]); }
    });
  });
}

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
await browser.send('Log.enable', {}, S);

// collect console output + uncaught exceptions so failures are visible to me
const logs = [];
browser.on((m) => {
  if (m.sessionId !== S) return;
  if (m.method === 'Runtime.consoleAPICalled') {
    const text = (m.params.args || []).map((a) => a.value ?? a.description ?? a.unserializableValue ?? a.type).join(' ');
    logs.push(`[console.${m.params.type}] ${text}`);
  } else if (m.method === 'Runtime.exceptionThrown') {
    const e = m.params.exceptionDetails;
    logs.push(`[exception] ${e.exception?.description || e.text}`);
  } else if (m.method === 'Log.entryAdded') {
    const en = m.params.entry;
    if (/favicon\.ico/.test(en.url || '')) return;  // harmless browser noise
    if (en.level === 'error' || en.level === 'warning') logs.push(`[${en.level}] ${en.text}${en.url ? ' @ ' + en.url : ''}`);
  }
});

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

if (logs.length) {
  console.log(`— browser console (${logs.length}) —`);
  for (const l of logs) console.log('  ' + l);
} else {
  console.log('— browser console: clean —');
}

// close the tab we opened, but leave an attached (user-owned) Chrome running
await browser.send('Target.closeTarget', { targetId }).catch(() => {});
browser.close();
if (chrome) chrome.kill();
server.close();
process.exit(0);
