# 官网后台与阿里云 OSS 部署清单

此分支需要先完成云端配置，再合并到生产分支。未配置管理员认证和 OSS 时，登录及上传接口会拒绝请求。

## 1. Bucket 与资源域名

- Bucket 名称：`yanyun-officalweb`（按需求保留此拼写）；地域：`oss-cn-shanghai`；标准存储。
- Bucket 保持「私有」并开启「阻止公共访问」，存储冗余使用同城冗余。资源域名为 `assets.yysjzx.com`，通过阿里云 CDN 的「OSS 私有 Bucket 回源」读取，不将域名直接指向 OSS 默认域名。
- `assets` 的 CNAME 已指向阿里云 CDN；域名已正常运行，且已添加 `Access-Control-Allow-Origin: https://www.yysjzx.com` 响应头。HTTPS 尚需配置覆盖 `assets.yysjzx.com` 的正式证书；阿里云个人测试证书禁止用于生产环境。中国内地加速需要域名已备案。
- 阿里云 CDN 的私有 OSS 回源一键授权是**账号级**一次性授权，官方策略允许 CDN 对账号下所有 OSS Bucket 执行 `oss:List*` / `oss:Get*`。若不能接受此范围，应通过 RAM 创建仅限 `yanyun-officalweb` 的自定义只读角色，再开启同账号 STS 回源。开启后，该 CDN 域名可读取此 Bucket 的全部对象。
- 水印组件通过 canvas 读取跨域 Logo，需验证 CDN 响应实际携带上述 CORS 头；目前 Bucket 为空，尚未完成端到端验证。
- 私有回源只保护 OSS 源站：CDN 缓存中的图片默认仍可通过资源 URL 公开访问。已在浏览器显示的图片无法保证用户不能保存或截图；如需限制未授权访问，应另行设计 CDN URL 鉴权，且不得把不能保存当作其安全保证。

## 2. 最小权限上传身份

为网站云函数创建单独的 RAM 身份，只授予对 `yanyun-officalweb/media/*` 的 `oss:PutObject` 权限。不要使用主账号 AccessKey。静态资源迁移可另用临时身份；不要把迁移权限留在运行时身份上。

## 3. EdgeOne Pages 环境变量

| 名称 | 用途 |
|---|---|
| `ADMIN_USERNAME` | 管理员账号，默认 `admin` |
| `ADMIN_PASSWORD_HASH` | scrypt 密码摘要；在私人终端运行 `node scripts/hash_admin_password.mjs` 生成 |
| `ADMIN_SESSION_SECRET` | 随机 32 字节以上字符串，用于签名 HttpOnly 会话 Cookie |
| `OSS_ACCESS_KEY_ID` | 上述 RAM 身份的 AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | 上述 RAM 身份的 AccessKey Secret |
| `OSS_BUCKET` | `yanyun-officalweb` |
| `OSS_REGION` | `oss-cn-shanghai` |
| `OSS_PUBLIC_BASE_URL` | 已验证可通过 CDN 读取的 HTTPS 资源域名 `https://assets.yysjzx.com`，不带尾部斜杠 |

环境变量变更只对新部署生效。请在设置后重新部署，并先在预览环境验证登录、读写与上传。

## 4. 迁移现有资源

`node scripts/migrate_static_assets.mjs` 可先预览本地资源数量。上传时由受限迁移身份提供 `OSS_ACCESS_KEY_ID` 和 `OSS_ACCESS_KEY_SECRET`，运行 `node scripts/migrate_static_assets.mjs --apply`。脚本保持对象键为 `image/...`，已有内容 URL 的路径无需变化。

上传后，检查 Logo、证书、首页图片等抽样 URL 是否返回 200 且在页面中正常显示。再将 `OSS_PUBLIC_BASE_URL` 设为资源域名并重新部署；构建会让所有 `/image/...` URL 指向 OSS。确认没有遗漏后，才从 Pages 的 `public/image` 移除旧文件。

## 5. 验证与切换

1. 未登录请求 `POST /api/upload` 应返回 401。
2. 使用新管理员密码登录；旧的 `admin/admin` 不应再有效。
3. 后台修改一条可回滚的内容，确认另一设备读取到云端内容。
4. 分别上传 JPG 和 PDF，确认返回 URL 属于资源域名，浏览器可打开。
5. 验证原有 `/api/file?key=...` 旧图仍可读。
6. 轮换此前已暴露的凭据；从当前 Git 树移除的 `server/.env` 仍存在于历史提交，历史中的密钥必须失效。

当前上传函数的单文件上限为 5 MB，受 EdgeOne 云函数 6 MB 请求体上限约束。大文件需要单独设计分片上传。
