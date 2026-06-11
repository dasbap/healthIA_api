import { env } from '../config/env';

type RequestOptions = RequestInit & {
  fallbackLabel?: string;
};

export const apiFallbackEventName = 'healthai-api-fallback';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new ApiError(options.fallbackLabel ?? 'Erreur API HealthAI', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function shouldUseMocks() {
  return env.useMocks;
}

function reportApiFallback(reason: 'forced-mock' | 'api-error') {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(apiFallbackEventName, { detail: { reason } }));
}

export async function withApiFallback<T>(
  request: () => Promise<T>,
  fallback: () => Promise<T> | T
): Promise<T> {
  if (shouldUseMocks()) {
    reportApiFallback('forced-mock');
    return fallback();
  }

  try {
    return await request();
  } catch {
    reportApiFallback('api-error');
    return fallback();
  }
}

export function mockDelay(ms = 450) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function checkApiHealth(): Promise<{ status: string; mocked: boolean }> {
  return withApiFallback(
    () => httpClient<{ status: string; mocked?: boolean }>('/health', { fallbackLabel: 'Healthcheck indisponible' }),
    async () => {
      await mockDelay(150);
      return { status: 'mocked', mocked: true };
    }
  ).then((health) => ({ status: health.status, mocked: Boolean(health.mocked) || shouldUseMocks() }));
}
