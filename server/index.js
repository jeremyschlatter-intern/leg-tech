// Leg Tech server — serves the site + handles auth + machine provisioning.

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { sign, unsign } from 'cookie-signature';
import { createMachine, destroyMachine, getMachineStatus } from './machines.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DOCS_DIR = join(__dirname, '..', 'docs');

const PORT = process.env.PORT || 3001;
const COOKIE_SECRET = process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ORIGIN = process.env.ORIGIN || `http://localhost:${PORT}`;
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'palisaderesearch.org';
const DISABLE_AUTH = process.env.DISABLE_AUTH === '1';

// Load project slugs for routing
const { projects, slugFor } = await import(join(DOCS_DIR, 'projects.js'));
const projectSlugs = new Set(projects.map(slugFor));

// Test-only project slugs (routable but not shown on index page)
const testSlugs = new Set(projects.filter(p => p.testOnly).map(slugFor));

// --- Helpers ---

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.wasm': 'application/wasm',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const pair of header.split(';')) {
    const [k, ...v] = pair.trim().split('=');
    cookies[k] = decodeURIComponent(v.join('='));
  }
  return cookies;
}

// Session is encoded directly in the cookie: base64(JSON) + signature.
// No server-side state — survives restarts and works across multiple machines.
function getSession(req) {
  const raw = parseCookies(req.headers.cookie).session;
  if (!raw) return null;
  const payload = unsign(raw, COOKIE_SECRET);
  if (payload === false) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64').toString()); }
  catch { return null; }
}

function setSessionCookie(res, data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  const signed = sign(payload, COOKIE_SECRET);
  res.setHeader('Set-Cookie',
    `session=${encodeURIComponent(signed)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  );
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function serveFile(res, filePath) {
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

// --- Google OAuth ---

function googleAuthUrl(returnTo) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${ORIGIN}/api/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    hd: ALLOWED_DOMAIN,
    prompt: 'select_account',
    state: returnTo || '/',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeCode(code) {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${ORIGIN}/api/auth/callback`,
      grant_type: 'authorization_code',
    }),
  });
  return resp.json();
}

async function getGoogleUserInfo(accessToken) {
  const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return resp.json();
}

// --- Routes ---

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- Auth routes ---

  if (path === '/api/auth/login' && req.method === 'GET') {
    const returnTo = url.searchParams.get('return') || '/';
    res.writeHead(302, { Location: googleAuthUrl(returnTo) });
    res.end();
    return;
  }

  if (path === '/api/auth/callback' && req.method === 'GET') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const returnTo = url.searchParams.get('state') || '/';
    if (error || !code) {
      res.writeHead(302, { Location: `/?auth_error=${error || 'no_code'}` });
      res.end();
      return;
    }

    const tokens = await exchangeCode(code);
    if (tokens.error) {
      res.writeHead(302, { Location: `/?auth_error=token_exchange_failed` });
      res.end();
      return;
    }

    const userInfo = await getGoogleUserInfo(tokens.access_token);
    if (!userInfo.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
      res.writeHead(302, { Location: `/?auth_error=wrong_domain` });
      res.end();
      return;
    }

    setSessionCookie(res, {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });
    res.writeHead(302, { Location: returnTo });
    res.end();
    return;
  }

  if (path === '/api/auth/me' && req.method === 'GET') {
    if (DISABLE_AUTH) return json(res, 200, { authenticated: true, name: 'Demo', email: 'demo@example.com' });
    const session = getSession(req);
    if (!session) return json(res, 200, { authenticated: false });
    return json(res, 200, {
      authenticated: true,
      email: session.email,
      name: session.name,
      picture: session.picture,
    });
  }

  if (path === '/api/auth/logout' && req.method === 'POST') {
    clearSessionCookie(res);
    return json(res, 200, { ok: true });
  }

  // --- Machine routes ---

  if (path === '/api/machines' && req.method === 'POST') {
    if (!DISABLE_AUTH) {
      const session = getSession(req);
      if (!session) return json(res, 401, { error: 'Not authenticated' });
    }

    // Find the most recent started VM in the leg-tech-vms app
    {
      const FLY_APP_NAME = process.env.FLY_APP_NAME || 'leg-tech-vms';
      const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
      if (FLY_API_TOKEN) {
        const resp = await fetch(`https://api.machines.dev/v1/apps/${FLY_APP_NAME}/machines`, {
          headers: { 'Authorization': `Bearer ${FLY_API_TOKEN}` },
        });
        if (resp.ok) {
          const machines = await resp.json();
          const started = machines
            .filter(m => m.state === 'started')
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
          if (started.length > 0) {
            const vm = started[0];
            return json(res, 201, {
              machineId: vm.id,
              wsUrl: `wss://${FLY_APP_NAME}.fly.dev/ws?fly_instance_id=${vm.id}`,
              status: 'started',
            });
          }
        }
      }
    }

    const body = await readBody(req);
    const { repoUrl, projectTitle } = body;
    if (!repoUrl) return json(res, 400, { error: 'repoUrl is required' });

    const machine = await createMachine({ repoUrl, projectTitle, user: session.email });
    return json(res, 201, machine);
  }

  if (path.startsWith('/api/machines/') && req.method === 'GET') {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: 'Not authenticated' });
    const machineId = path.split('/').pop();
    const status = await getMachineStatus(machineId);
    return json(res, 200, status);
  }

  if (path.startsWith('/api/machines/') && req.method === 'DELETE') {
    const session = getSession(req);
    if (!session) return json(res, 401, { error: 'Not authenticated' });
    const machineId = path.split('/').pop();
    await destroyMachine(machineId);
    return json(res, 200, { ok: true });
  }

  // --- Health ---

  if (path === '/health') {
    res.writeHead(200);
    res.end('ok');
    return;
  }

  // --- Static files + project routes ---

  // GET only from here
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  // Project slug → serve view.html
  const slug = path.slice(1); // strip leading /
  if (slug && !slug.includes('/') && projectSlugs.has(slug)) {
    // Test-only projects are not shown on the index page but are still routable
    return serveFile(res, join(DOCS_DIR, 'view.html'));
  }

  // Static files from docs/
  const filePath = path === '/' ? '/index.html' : path;
  return serveFile(res, join(DOCS_DIR, filePath));
});

server.listen(PORT, () => {
  console.log(`Leg Tech server on port ${PORT}`);
  if (!GOOGLE_CLIENT_ID) console.warn('Warning: GOOGLE_CLIENT_ID not set');
});
