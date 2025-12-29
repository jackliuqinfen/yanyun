
export async function onRequest(context) {
  const { request, env } = context;
  const db = env.YANYUN_DB;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  try {
    // --- GET: 读取文件 (公开访问，用于图片展示) ---
    if (request.method === 'GET') {
      if (!key) return new Response('Key required', { status: 400, headers: corsHeaders });

      // 以 arrayBuffer 形式读取，支持二进制图片
      const fileData = await db.get(key, { type: 'arrayBuffer' });

      if (!fileData) {
        return new Response('File not found', { status: 404, headers: corsHeaders });
      }

      // 尝试从 key 后缀判断 mime type，默认 jpeg
      let contentType = 'image/jpeg';
      if (key.endsWith('.png')) contentType = 'image/png';
      if (key.endsWith('.gif')) contentType = 'image/gif';
      if (key.endsWith('.mp4')) contentType = 'video/mp4';
      if (key.endsWith('.pdf')) contentType = 'application/pdf';

      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          // 缓存控制：图片通常不会变，缓存久一点
          'Cache-Control': 'public, max-age=86400' 
        }
      });
    }

    // --- POST: 上传文件 (需要鉴权) ---
    if (request.method === 'POST') {
      // 1. 鉴权
      const authHeader = request.headers.get('Authorization');
      const EXPECTED_TOKEN = '8CG4Q0zhUzrvt14hsymoLNa+SJL9ioImlqabL5R+fJA=';
      
      if (!authHeader || !authHeader.includes(EXPECTED_TOKEN)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        });
      }

      if (!key) return new Response(JSON.stringify({ error: 'Key is required' }), { status: 400, headers: corsHeaders });

      // 2. 获取二进制数据
      const fileData = await request.arrayBuffer();

      // 3. 写入 KV
      await db.put(key, fileData);

      return new Response(JSON.stringify({ success: true, url: `/api/file?key=${key}` }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
