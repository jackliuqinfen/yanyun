/**
 * 媒体文件上传接口 —— Node.js 云函数版，直传腾讯云对象存储 COS
 *
 * 运行位置：cloud-functions/api/upload.js  →  路由 POST /api/upload
 * 运行时：Node.js v20.x（支持 npm 生态，因此可用 cos-nodejs-sdk-v5 做签名）
 *
 * 为什么不放在 edge-functions/：
 *   边缘函数是 V8 运行时，不支持 npm 包，无法做 COS 请求签名；
 *   且请求体上限仅 1MB。Node 云函数上限 6MB，满足媒体库图片上传。
 *
 * 为什么用新路径 /api/upload 而不是复用 /api/file：
 *   edge-functions/api/file.js 已占用 /api/file 且负责从 KV 读旧图。
 *   新开路径可完全避开两类函数的路由优先级问题，零风险。
 *   旧图仍由 /api/file?key=xxx 提供服务，互不影响。
 *
 * 依赖：需在项目根 package.json 的 dependencies 中加入
 *   "cos-nodejs-sdk-v5": "^2.14.6"
 */

import COS from 'cos-nodejs-sdk-v5';

const TOKEN = '8CG4Q0zhUzrvt14hsymoLNa+SJL9ioImlqabL5R+fJA=';

// COS 相关配置一律从 EdgeOne 控制台环境变量读取，不写进代码
const BUCKET = 'yanyun-1468935338';
const REGION = 'ap-shanghai';

const MAX_FILE_BYTES = 6 * 1024 * 1024; // Node 云函数请求体上限

const ALLOWED_EXT = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
  'mp4', 'webm', 'mov', 'pdf',
]);

const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', ico: 'image/x-icon',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', pdf: 'application/pdf',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
  });

// 生成安全的、不易碰撞的对象名：media/<yyyymmdd>/<时间戳>-<随机串>.<ext>
function buildObjectKey(originalName) {
  const rawExt = (originalName || '').split('.').pop() || '';
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ALLOWED_EXT.has(ext) ? ext : 'bin';

  const d = new Date();
  const ymd =
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0');

  const rand = Math.random().toString(36).slice(2, 10);
  return `media/${ymd}/${Date.now()}-${rand}.${safeExt}`;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // 1. 鉴权（与现有一致，后续建议改为短时效凭证）
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.includes(TOKEN)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // 2. 校验 COS 密钥是否已在控制台配置
  const secretId = env.COS_SECRET_ID;
  const secretKey = env.COS_SECRET_KEY;
  if (!secretId || !secretKey) {
    return json(
      {
        error:
          'COS credentials missing. Please set COS_SECRET_ID and COS_SECRET_KEY in the EdgeOne project environment variables.',
      },
      500
    );
  }

  try {
    // 3. 解析上传的文件
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return json({ error: 'No file provided (expected multipart field "file")' }, 400);
    }

    if (file.size > MAX_FILE_BYTES) {
      return json(
        {
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the 6MB limit of this runtime.`,
        },
        413
      );
    }

    const objectKey = buildObjectKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. 上传到 COS
    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

    await new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: BUCKET,
          Region: REGION,
          Key: objectKey,
          Body: buffer,
          ContentType: MIME[(objectKey.split('.').pop() || '').toLowerCase()] || 'application/octet-stream',
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });

    // 5. 返回公网访问地址
    //    优先使用控制台配置的自定义域名（如已绑定 CDN/自定义域名）
    const cdnDomain = env.COS_CDN_DOMAIN ? String(env.COS_CDN_DOMAIN).replace(/\/+$/, '') : '';
    const url = cdnDomain
      ? `${cdnDomain}/${objectKey}`
      : `https://${BUCKET}.cos.${REGION}.myqcloud.com/${objectKey}`;

    return json({
      success: true,
      url,
      key: objectKey,
      bucket: BUCKET,
      region: REGION,
      size: file.size,
    });
  } catch (err) {
    return json({ error: `Upload failed: ${err.message}` }, 500);
  }
}
