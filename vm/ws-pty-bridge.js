// WebSocket-to-PTY bridge for ghostty-web
// One PTY per browser session (identified by sessionStorage UUID).
// PTYs persist across reconnects and never time out.
// Multiple viewers of the same session share the view.

import { createServer } from 'http';
import pty from '@lydell/node-pty';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const DEFAULT_COLS = parseInt(process.env.COLS) || 80;
const DEFAULT_ROWS = parseInt(process.env.ROWS) || 24;

const user = process.env.SHELL_USER;
const shell = process.env.SHELL || '/bin/sh';

// Map of sessionId -> { term, buffer, clients: Map<ws, {cols, rows}>, ptyCols, ptyRows }
const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (sessions.has(sessionId)) return sessions.get(sessionId);

  const cmd = user ? ['su', ['-', user, '-c', 'exec bash -l']] : [shell, ['-l']];
  const term = pty.spawn(cmd[0], cmd[1], {
    name: 'xterm-256color',
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
    cwd: process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  const session = {
    term,
    buffer: [],
    clients: new Map(),
    ptyCols: DEFAULT_COLS,
    ptyRows: DEFAULT_ROWS,
  };

  term.onData(data => {
    session.buffer.push(data);
    for (const ws of session.clients.keys()) {
      if (ws.readyState === ws.OPEN) ws.send('0' + data);
    }
  });

  term.onExit(() => {
    console.log(`[pty-exit] session=${sessionId}`);
    for (const ws of session.clients.keys()) ws.close();
    sessions.delete(sessionId);
  });

  sessions.set(sessionId, session);
  console.log(`[new-session] ${sessionId} | ${sessions.size} sessions`);
  return session;
}

function resizeToSmallest(session) {
  if (session.clients.size === 0) return;
  let minCols = Infinity, minRows = Infinity;
  for (const size of session.clients.values()) {
    minCols = Math.min(minCols, size.cols);
    minRows = Math.min(minRows, size.rows);
  }
  if (minCols !== session.ptyCols || minRows !== session.ptyRows) {
    session.ptyCols = minCols;
    session.ptyRows = minRows;
    session.term.resize(minCols, minRows);
    console.log(`[pty-resize] ${minCols}x${minRows}`);
  }
}

function broadcastClientCount(session) {
  const msg = '1' + JSON.stringify({ type: 'clients', count: session.clients.size });
  for (const ws of session.clients.keys()) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

// HTTP + WebSocket server
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost`);
  if (url.pathname === '/health') {
    res.writeHead(200);
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const params = new URL(req.url, `http://localhost`).searchParams;
  const sessionId = params.get('session') || 'default';
  const cols = parseInt(params.get('cols')) || DEFAULT_COLS;
  const rows = parseInt(params.get('rows')) || DEFAULT_ROWS;

  const session = getOrCreateSession(sessionId);

  // Replay buffered output
  for (const chunk of session.buffer) {
    ws.send('0' + chunk);
  }

  session.clients.set(ws, { cols, rows });
  console.log(`[connect] session=${sessionId} (${cols}x${rows}) | ${session.clients.size} viewers | ${sessions.size} sessions`);
  resizeToSmallest(session);
  broadcastClientCount(session);

  ws.on('message', msg => {
    const str = msg.toString();
    try {
      const parsed = JSON.parse(str);
      if (parsed.type === 'resize') {
        session.clients.set(ws, { cols: parsed.cols, rows: parsed.rows });
        console.log(`[resize] session=${sessionId} client->${parsed.cols}x${parsed.rows} | ${session.clients.size} viewers`);
        resizeToSmallest(session);
        return;
      }
    } catch {}
    session.term.write(str);
  });

  ws.on('close', () => {
    session.clients.delete(ws);
    console.log(`[close] session=${sessionId} | ${session.clients.size} viewers | ${sessions.size} sessions`);
    resizeToSmallest(session);
    broadcastClientCount(session);
  });
});

server.listen(PORT, () => {
  console.log(`WS-PTY bridge listening on port ${PORT}`);
});
