/**
 * 文件上传 / 读取接口（后台媒体库、新闻配图、案例图片）
 *
 * 与 kv.js 相同：KV 绑定通过 global YANYUN_DB / context.env.YANYUN_DB 双通道解析。
 * 另修正：get(key, 'arrayBuffer') 第二个参数必须是字符串，不是 options 对象。
 */

const TOKEN = '8CG4Q0zhUzrvt14hsymoLNa+SJL9ioImlqabL5R+fJA=';
const MAX_FILE_BYTES = 25 * 1024 * 1024; // KV 单值上限

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
};

const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  pdf: 'application/pdf',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
  });

// 只允许安全字符，且禁止 .. 与绝对路径，防路径穿越
const validKey = (k) =>
  !!k && /^[A-Za-z0-9_.\-/]+$/.test(k) && !k.includes('..') && !k.startsWith('/');

function resolveKV(context) {
  try {
    if (typeof YANYUN_DB !== 'undefined' && YANYUN_DB !== null) return YANYUN_DB;
  } catch (e) {
    // 未绑定，继续尝试下一通道
  }
  const fromEnv = context && context.env ? context.env.YANYUN_DB : undefined;
  return fromEnv || null;
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const db = resolveKV(context);
  if (!db) {
    return json({ error: 'KV binding "YANYUN_DB" is not reachable at runtime.' }, 500);
  }

  const key = new URL(request.url).searchParams.get('key');

  try {
    // --- GET: 读取（公开访问，用于前台图片展示） ---
    if (request.method === 'GET') {
      if (!key) return new Response('Key required', { status: 400, headers: corsHeaders });
      if (!validKey(key)) return new Response('Invalid key', { status: 400, headers: corsHeaders });

      const fileData = await db.get(key, 'arrayBuffer');
      if (!fileData) {
        return new Response('File not found', { status: 404, headers: corsHeaders });
      }

      const ext = (key.split('.').pop() || '').toLowerCase();
      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // --- POST: 上传（需要鉴权） ---
    if (request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.includes(TOKEN)) {
        return json({ error: 'Unauthorized' }, 401);
      }
      if (!key) return json({ error: 'Key is required' }, 400);
      if (!validKey(key)) return json({ error: 'Invalid key' }, 400);

      const fileData = await request.arrayBuffer();
      if (fileData.byteLength > MAX_FILE_BYTES) {
        return json({ error: 'File too large (max 25MB)' }, 413);
      }

      await db.put(key, fileData);
      return json({ success: true, url: `/api/file?key=${key}` });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
