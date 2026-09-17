/**
 * 健康检查接口 — 后台能否进入「云端同步」模式的开关
 *
 * 背景：storageService.checkHealth() 会 GET /api/health 并期待 JSON { status: 'ok' }。
 * 之前仓库缺少这个文件，请求落进 SPA 静态回退，返回 index.html（HTTP 200 + text/html），
 * 前端 res.json() 解析 HTML 抛错 → isCloudAvailable 恒为 false → 后台写操作只落在浏览器本地。
 * 该文件是让后台真正走云端的关键。
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

// KV 绑定探测：优先全局变量，其次 context.env（兼容不同注入方式）
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

  if (request.method !== 'GET') {
    return json({ status: 'error', message: 'Method not allowed' }, 405);
  }

  if (!resolveKV(context)) {
    return json({
      status: 'error',
      message: 'KV binding "YANYUN_DB" is not reachable at runtime.',
      storage: 'none',
    });
  }

  return json({
    status: 'ok',
    message: 'KV 已绑定，后台处于云端同步模式，数据可跨浏览器、跨设备生效。',
    storage: 'KV',
    ts: Date.now(),
  });
}
