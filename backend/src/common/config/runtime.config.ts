import { isAbsolute, resolve } from 'path';

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function splitEnvList(value?: string | null) {
  return (value || '')
    .split(',')
    .map((item) => normalizeUrl(item))
    .filter(Boolean);
}

export function getAllowedOrigins(frontendUrl?: string | null, corsOrigins?: string | null) {
  const combined = [...splitEnvList(frontendUrl), ...splitEnvList(corsOrigins)];

  if (combined.length === 0) {
    return [DEFAULT_FRONTEND_URL];
  }

  return Array.from(new Set(combined));
}

export function isOriginAllowed(origin: string, allowedOrigins: string[]) {
  const normalizedOrigin = normalizeUrl(origin);

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === '*') {
      return true;
    }

    if (!allowedOrigin.includes('*')) {
      return normalizedOrigin === allowedOrigin;
    }

    const pattern = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^.]+');

    return new RegExp(`^${pattern}$`, 'i').test(normalizedOrigin);
  });
}

export function getUploadsDir(
  uploadDir = process.env.UPLOAD_DIR,
  volumeMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH,
) {
  const rawPath = (uploadDir || volumeMountPath || 'uploads').trim();
  return isAbsolute(rawPath) ? rawPath : resolve(process.cwd(), rawPath);
}

export function getPublicAppUrl(appUrl?: string | null, port?: number) {
  const normalizedAppUrl = appUrl?.trim();
  if (normalizedAppUrl) {
    return normalizeUrl(normalizedAppUrl);
  }

  const resolvedPort = port || Number.parseInt(process.env.PORT || '3000', 10) || 3000;
  return `http://localhost:${resolvedPort}`;
}
