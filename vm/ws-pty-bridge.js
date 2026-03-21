// WebSocket-to-PTY bridge for ghostty-web
// Single PTY spawned on startup. Multiple WebSocket clients share the same view.
// New clients get a replay of all buffered output, then live updates.
// PTY is resized to the smallest connected viewport (like tmux).

import { createServer } from 'http';
import pty from '@lydell/node-pty';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const DEFAULT_COLS = parseInt(process.env.COLS) || 80;
const DEFAULT_ROWS = parseInt(process.env.ROWS) || 24;

// Spawn the PTY once on startup
const user = process.env.SHELL_USER;
const shell = process.env.SHELL || '/bin/sh';
const cmd = user ? ['su', ['-', user, '-c', 'exec bash -l']] : [shell, ['-l']];

let ptyCols = DEFAULT_COLS;
let ptyRows = DEFAULT_ROWS;

const term = pty.spawn(cmd[0], cmd[1], {
  name: 'xterm-256color',
  cols: ptyCols,
  rows: ptyRows,
  cwd: process.cwd(),
  env: { ...process.env, TERM: 'xterm-256color' },
});

// Buffer all PTY output for replay
const buffer = [];
// Map of ws -> { cols, rows }
const clients = new Map();

term.onData(data => {
  buffer.push(data);
  for (const ws of clients.keys()) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
});

term.onExit(() => {
  console.log('PTY exited');
  for (const ws of clients.keys()) ws.close();
});

function resizeToSmallest() {
  if (clients.size === 0) return;
  let minCols = Infinity, minRows = Infinity;
  for (const size of clients.values()) {
    minCols = Math.min(minCols, size.cols);
    minRows = Math.min(minRows, size.rows);
  }
  if (minCols !== ptyCols || minRows !== ptyRows) {
    ptyCols = minCols;
    ptyRows = minRows;
    term.resize(ptyCols, ptyRows);
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
  const cols = parseInt(params.get('cols')) || DEFAULT_COLS;
  const rows = parseInt(params.get('rows')) || DEFAULT_ROWS;

  // Replay buffered output
  for (const chunk of buffer) {
    ws.send(chunk);
  }

  clients.set(ws, { cols, rows });
  resizeToSmallest();

  ws.on('message', msg => {
    const str = msg.toString();
    try {
      const parsed = JSON.parse(str);
      if (parsed.type === 'resize') {
        clients.set(ws, { cols: parsed.cols, rows: parsed.rows });
        resizeToSmallest();
        return;
      }
    } catch {}
    term.write(str);
  });

  ws.on('close', () => {
    clients.delete(ws);
    resizeToSmallest();
  });
});

server.listen(PORT, () => {
  console.log(`WS-PTY bridge listening on port ${PORT} (shared PTY)`);
});
