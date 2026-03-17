import { clsx, type ClassValue } from 'clsx';

const DEFAULT_API_URL = '/api';
const ABSOLUTE_URL_PATTERN = /^(data:|blob:|https?:\/\/|\/\/)/i;
const UPLOADS_PATH_PATTERN = /^\/?uploads\//i;

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  const data = (value as any)?.data;
  if (Array.isArray(data)) {
    return data as T[];
  }

  const items = (value as any)?.items;
  if (Array.isArray(items)) {
    return items as T[];
  }

  const nestedItems = (value as any)?.data?.items;
  if (Array.isArray(nestedItems)) {
    return nestedItems as T[];
  }

  return [];
}

function getRuntimeOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:5173';
}

export function getApiOrigin() {
  const apiUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();

  if (ABSOLUTE_URL_PATTERN.test(apiUrl)) {
    return new URL(apiUrl, getRuntimeOrigin()).origin;
  }

  return getRuntimeOrigin();
}

export function resolveAssetUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed || ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return trimmed || '';
  }

  if (!UPLOADS_PATH_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return new URL(normalizedPath, `${getApiOrigin()}/`).toString();
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'En preparación',
    SHIPPED: 'Despachado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PREPARING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    VOIDED: 'Anulado',
    REFUNDED: 'Reembolsado',
  };
  return labels[status] || status;
}
