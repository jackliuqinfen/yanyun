import OSS from 'ali-oss';
import { randomUUID } from 'node:crypto';
import { validSession } from './auth.js';

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_BY_EXT = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
  ico: 'image/x-icon', pdf: 'application/pdf',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (request.headers.get('Origin') !== new URL(request.url).origin || !validSession(request, env.ADMIN_SESSION_SECRET)) {
    return json({ error: '请重新登录后上传' }, 401);
  }

  const { OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_PUBLIC_BASE_URL } = env;
  const bucket = env.OSS_BUCKET || 'yanyun-officalweb';
  const region = env.OSS_REGION || 'oss-cn-shanghai';
  if (!OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET || !OSS_PUBLIC_BASE_URL) {
    return json({ error: 'OSS 尚未配置完成，请联系管理员' }, 503);
  }
  let publicBase;
  try {
    publicBase = new URL(OSS_PUBLIC_BASE_URL);
    if (publicBase.protocol !== 'https:' || publicBase.pathname !== '/' || publicBase.search || publicBase.hash) throw new Error('Invalid public URL');
  } catch {
    return json({ error: 'OSS 公网域名配置无效' }, 503);
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return json({ error: '请选择文件' }, 400);
    if (file.size === 0 || file.size > MAX_BYTES) return json({ error: '文件需小于 5 MB' }, 413);
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const mime = MIME_BY_EXT[ext];
    if (!mime || file.type !== mime) return json({ error: '文件格式不受支持' }, 415);

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const key = `media/${date}/${randomUUID()}.${ext}`;
    const client = new OSS({
      region, bucket,
      accessKeyId: OSS_ACCESS_KEY_ID,
      accessKeySecret: OSS_ACCESS_KEY_SECRET,
      secure: true,
    });
    await client.put(key, Buffer.from(await file.arrayBuffer()), {
      headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
    return json({ success: true, url: `${publicBase.origin}/${key}`, key, bucket, region, size: file.size });
  } catch (error) {
    console.error('OSS upload failed', error);
    return json({ error: '上传失败，请稍后重试' }, 500);
  }
}
