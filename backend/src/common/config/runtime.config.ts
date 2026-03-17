import { isAbsolute, resolve } from 'path';

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_REQUEST_BODY_LIMIT = '1mb';
const INSECURE_JWT_SECRETS = new Set([
  'nexo-secret-change-me',
  'cambiar-esto-en-produccion-usar-clave-segura-256bits',
  'cambiar-esto-en-produccion-usar-clave-segura-minimo-256bits',
]);

function normalizeUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function splitEnvList(value?: string | null) {
  return (value || '')
    .split(',')
    .map((item) => normalizeUrl(item))
    .filter(Boolean);
}

function parseBooleanEnv(value?: string | boolean | null, defaultValue = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value == null) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export function isProduction(nodeEnv: string | null | undefined = process.env.NODE_ENV) {
  return (nodeEnv || '').trim().toLowerCase() === 'production';
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

export function getRequestBodyLimit(limit?: string | null) {
  const normalizedLimit = (limit || DEFAULT_REQUEST_BODY_LIMIT).trim();
  return normalizedLimit || DEFAULT_REQUEST_BODY_LIMIT;
}

export function isSwaggerEnabled(nodeEnv?: string | null, enableSwagger?: string | boolean | null) {
  if (isProduction(nodeEnv)) {
    return parseBooleanEnv(enableSwagger, false);
  }

  return parseBooleanEnv(enableSwagger, true);
}

export function assertSecureRuntimeConfig(options: {
  nodeEnv?: string | null;
  jwtSecret?: string | null;
  allowedOrigins?: string[];
}) {
  if (!isProduction(options.nodeEnv)) {
    return;
  }

  const jwtSecret = options.jwtSecret?.trim() || '';
  if (!jwtSecret || jwtSecret.length < 32 || INSECURE_JWT_SECRETS.has(jwtSecret)) {
    throw new Error(
      '[security] JWT_SECRET is missing, too short, or still using an insecure default. Use at least 32 random characters in production.',
    );
  }

  if ((options.allowedOrigins || []).some((origin) => origin === '*')) {
    throw new Error(
      '[security] CORS_ORIGINS cannot include "*" in production while credentialed requests are enabled.',
    );
  }
}
