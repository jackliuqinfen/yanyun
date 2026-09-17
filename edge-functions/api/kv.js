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

const TOKEN = '8CG4Q0zhUzrvt14hsymoLNa+SJL9ioImlqabL5R+fJA=';
const MAX_VALUE_BYTES = 25 * 1024 * 1024;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      ...corsHeaders,
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

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const db = resolveKV(context);
  if (!db) {
    return json({ error: 'KV binding "YANYUN_DB" is not reachable at runtime.' }, 500);
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.includes(TOKEN)) {
    return json({ error: 'Unauthorized: Invalid Token' }, 401);
  }

  try {
    // --- GET: 读取 ---
    if (request.method === 'GET') {
      const key = new URL(request.url).searchParams.get('key');
      if (!key) return json({ error: 'Key is required' }, 400);

      // 官方 API：get(key, type?)，type 必须是字符串 'text' | 'json' | 'arrayBuffer' | 'stream'
      // key 不存在时返回 null，前端会自动回退到初始常量数据
      const value = await db.get(key, 'text');
      return new Response(value === null ? 'null' : value, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
          ...corsHeaders,
        },
      });
    }

    // --- POST: 写入 ---
    if (request.method === 'POST') {
      const body = await request.json();
      if (!body.key || body.value === undefined) {
        return json({ error: 'Missing key or value' }, 400);
      }

      const stringValue = JSON.stringify(body.value);
      if (stringValue.length > MAX_VALUE_BYTES) {
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
