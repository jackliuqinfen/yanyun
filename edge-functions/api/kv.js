
export async function onRequest(context) {
  const { request, env } = context;

  // 1. 设置跨域头 (CORS)，允许前端访问
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
  };

  // 2. 处理预检请求 (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 3. 获取 KV 绑定实例
    const db = env.YANYUN_DB;
    
    if (!db) {
        throw new Error('Server Config Error: KV Binding "YANYUN_DB" not found.');
    }

    // 4. 安全校验 (验证 Token)
    const authHeader = request.headers.get('Authorization');
    const EXPECTED_TOKEN = '8CG4Q0zhUzrvt14hsymoLNa+SJL9ioImlqabL5R+fJA=';
    
    if (!authHeader || !authHeader.includes(EXPECTED_TOKEN)) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Token' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
    }

    const url = new URL(request.url);

    // --- GET 请求: 获取数据 ---
    if (request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) {
            return new Response(JSON.stringify({ error: 'Key is required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            });
        }
        
        // CRITICAL FIX: Consistency Setting
        // EdgeOne KV 默认为最终一致性。
        // 设置 cacheTtl: 0 或较短时间，强制边缘节点回源确认或尽快过期缓存，
        // 减少"写完读不到"的情况。
        // type: 'text' 确保我们拿到的是字符串，方便 JSON.parse 处理。
        const value = await db.get(key, { type: 'text', cacheTtl: 5 }); 
        
        const responseBody = value === null ? 'null' : value; 
        
        return new Response(responseBody, {
            headers: { 
                'Content-Type': 'application/json', 
                'Cache-Control': 'no-store, max-age=0', // Tell browser not to cache API responses
                ...corsHeaders 
            }
        });
    }

    // --- POST 请求: 保存数据 ---
    if (request.method === 'POST') {
        const body = await request.json();
        
        if (!body.key || body.value === undefined) {
            return new Response(JSON.stringify({ error: 'Missing key or value' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            });
        }
        
        const stringValue = JSON.stringify(body.value);

        // CRITICAL FIX: Size Check
        // EdgeOne KV 单个 Value 最大限制通常为 25MB (视套餐而定)，但建议控制在 2MB 以内以保证性能。
        // 此处做一个简单的长度检查，避免超大包导致 Worker 崩溃
        if (stringValue.length > 25 * 1024 * 1024) {
             throw new Error('Payload too large: Value exceeds 25MB limit.');
        }

        // 写入数据
        await db.put(body.key, stringValue);
        
        return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (err) {
      return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
  }
}
