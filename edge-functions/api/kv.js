/**
 * 通用键值对存储接口（后台所有结构化数据的落库点）
 *
 * 关键说明：
 * EdgeOne 的 KV 命名空间是「控制台绑定后注入的全局变量」，不在 context.env 上。
 * 绑定信息（已通过 DescribeProjectKVBindings 核实）：
 *   变量名 YANYUN_DB / 类型 edgekv / 命名空间 Y4LheRXq
 * 为兼容不同运行环境的注入差异，这里做双通道兜底：
 *   1) 全局变量 YANYUN_DB（官方文档指定方式）
 *   2) context.env.YANYUN_DB（兼容写法）
 * 注意：未绑定时裸引用全局变量会抛 ReferenceError，必须用 typeof 判断。
 */

const MAX_VALUE_BYTES = 25 * 1024 * 1024;
const PUBLIC_KEYS = new Set([
  'news', 'projects', 'services', 'branches', 'branch_categories', 'links',
  'partners', 'honors', 'honor_categories', 'settings', 'page_content',
  'team', 'history', 'tenders', 'performances',
].map(name => `yanyun_${name}_v4`));
const PRIVATE_KEYS = new Set([
  'users', 'roles', 'audit_logs', 'login_attempts', 'security_config', 'media',
].map(name => `yanyun_${name}_v4`));
const ALL_KEYS = new Set([...PUBLIC_KEYS, ...PRIVATE_KEYS]);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

// 解析 KV 绑定：优先全局变量，其次 context.env
function resolveKV(context) {
  try {
    if (typeof YANYUN_DB !== 'undefined' && YANYUN_DB !== null) return YANYUN_DB;
  } catch (e) {
    // 未绑定导致 ReferenceError，继续尝试下一通道
  }
  const fromEnv = context && context.env ? context.env.YANYUN_DB : undefined;
  return fromEnv || null;
}

async function isAdmin(request, secret) {
  if (!secret) return false;
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith('yanyun_admin='))?.slice(13);
  const [data, signature] = (token || '').split('.');
  if (!data || !signature) return false;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const normalized = signature.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, bytes, new TextEncoder().encode(data));
    if (!valid) return false;
    const encoded = data.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    return payload.role === 'admin' && payload.exp > Date.now();
  } catch { return false; }
}

export async function onRequest(context) {
  const { request } = context;

  const db = resolveKV(context);
  if (!db) {
    return json({ error: 'KV binding "YANYUN_DB" is not reachable at runtime.' }, 500);
  }

  const secret = context.env?.ADMIN_SESSION_SECRET;

  try {
    // --- GET: 读取 ---
    if (request.method === 'GET') {
      const key = new URL(request.url).searchParams.get('key');
      if (!key) return json({ error: 'Key is required' }, 400);
      if (!ALL_KEYS.has(key)) return json({ error: 'Unknown key' }, 404);
      if (PRIVATE_KEYS.has(key) && !(await isAdmin(request, secret))) return json({ error: 'Unauthorized' }, 401);

      // 官方 API：get(key, type?)，type 必须是字符串 'text' | 'json' | 'arrayBuffer' | 'stream'
      // key 不存在时返回 null，前端会自动回退到初始常量数据
      const value = await db.get(key, 'text');
      return new Response(value === null ? 'null' : value, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // --- POST: 写入 ---
    if (request.method === 'POST') {
      if (request.headers.get('Origin') !== new URL(request.url).origin || !(await isAdmin(request, secret))) {
        return json({ error: 'Unauthorized' }, 401);
      }
      const body = await request.json();
      if (!body.key || body.value === undefined) {
        return json({ error: 'Missing key or value' }, 400);
      }
      if (!ALL_KEYS.has(body.key)) return json({ error: 'Unknown key' }, 400);

      const stringValue = JSON.stringify(body.value);
      if (new TextEncoder().encode(stringValue).byteLength > MAX_VALUE_BYTES) {
        return json({ error: 'Payload too large: value exceeds 25MB KV limit' }, 413);
      }

      await db.put(body.key, stringValue);
      return json({ success: true, timestamp: Date.now() });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
