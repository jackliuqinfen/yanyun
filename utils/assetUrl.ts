const publicBase = (import.meta.env.VITE_OSS_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

// 上线前保持本地静态资源可用；配置 OSS 域名后统一切换到对象存储。
export const assetUrl = (url: string): string =>
  publicBase && url.startsWith('/image/') ? `${publicBase}${url}` : url;
