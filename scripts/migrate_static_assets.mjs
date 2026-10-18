import OSS from 'ali-oss';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/image');
const apply = process.argv.includes('--apply');
const types = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf',
};

async function walk(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await walk(full));
    else if (item.isFile() && types[path.extname(item.name).toLowerCase()]) result.push(full);
  }
  return result;
}

const files = await walk(root);
const sizes = await Promise.all(files.map(file => stat(file)));
const totalMB = (sizes.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024).toFixed(1);
console.log(`${files.length} 个图片/文件，总计 ${totalMB} MB，目标：${process.env.OSS_BUCKET || 'yanyun-officalweb'}`);
if (!apply) {
  console.log('仅预览。设置 OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET 后使用 --apply 上传。');
  process.exit(0);
}

const { OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET } = process.env;
if (!OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET) throw new Error('缺少 OSS 访问凭据');
const client = new OSS({
  region: process.env.OSS_REGION || 'oss-cn-shanghai',
  bucket: process.env.OSS_BUCKET || 'yanyun-officalweb',
  accessKeyId: OSS_ACCESS_KEY_ID,
  accessKeySecret: OSS_ACCESS_KEY_SECRET,
  secure: true,
});

let uploaded = 0;
for (const file of files) {
  const key = 'image/' + path.relative(root, file).split(path.sep).join('/');
  await client.put(key, await readFile(file), {
    headers: { 'Content-Type': types[path.extname(file).toLowerCase()], 'Cache-Control': 'public, max-age=86400' },
  });
  uploaded += 1;
  if (uploaded % 10 === 0 || uploaded === files.length) console.log(`已上传 ${uploaded}/${files.length}`);
}
