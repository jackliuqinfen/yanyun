import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE = 'yanyun_admin';
const SESSION_SECONDS = 8 * 60 * 60;
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${mac}`;
}

export function validSession(request, secret) {
  if (!secret) return false;
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return false;
  const [data, signature] = token.split('.');
  if (!data || !signature) return false;
  const expected = createHmac('sha256', secret).update(data).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return payload.role === 'admin' && Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored || '').split(':');
  if (scheme !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(expected || '')) return false;
  const actual = scryptSync(password, salt, 64);
  const wanted = Buffer.from(expected, 'hex');
  return timingSafeEqual(actual, wanted);
}

export async function onRequest({ request, env }) {
  const secret = env.ADMIN_SESSION_SECRET;
  const passwordHash = env.ADMIN_PASSWORD_HASH;
  const username = env.ADMIN_USERNAME || 'admin';
  if (!secret || !passwordHash) return json({ error: 'Admin authentication is not configured' }, 503);

  if (request.method === 'GET') {
    return json({ authenticated: validSession(request, secret), username });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({ error: 'Invalid origin' }, 403);

  const action = new URL(request.url).searchParams.get('action');
  if (action === 'logout') {
    return json({ success: true }, 200, { 'Set-Cookie': `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` });
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid request' }, 400); }
  if (body?.username !== username || typeof body?.password !== 'string' || !verifyPassword(body.password, passwordHash)) {
    return json({ error: '账号或密码错误' }, 401);
  }
  const token = sign({ role: 'admin', exp: Date.now() + SESSION_SECONDS * 1000 }, secret);
  return json({ success: true, username }, 200, {
    'Set-Cookie': `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`,
  });
}
