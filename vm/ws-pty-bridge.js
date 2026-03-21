// WebSocket-to-PTY bridge for ghostty-web
// Spawns a shell and bridges it to a WebSocket connection.

import { createServer } from 'http';
import { spawn } from 'node-pty';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;

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
  const cols = parseInt(params.get('cols')) || 80;
  const rows = parseInt(params.get('rows')) || 24;

  const pty = spawn('/bin/bash', ['-l'], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd: process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  pty.onData(data => {
    if (ws.readyState === ws.OPEN) ws.send(data);
  });

  pty.onExit(() => ws.close());

  ws.on('message', msg => {
    const str = msg.toString();
    try {
      const parsed = JSON.parse(str);
      if (parsed.type === 'resize') {
        pty.resize(parsed.cols, parsed.rows);
        return;
      }
    } catch {}
    pty.write(str);
  });

  ws.on('close', () => pty.kill());
});

server.listen(PORT, () => {
  console.log(`WS-PTY bridge listening on port ${PORT}`);
});
