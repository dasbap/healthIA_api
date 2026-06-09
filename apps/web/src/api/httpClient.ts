import { env } from '../config/env';

type RequestOptions = RequestInit & {
  fallbackLabel?: string;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
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

export async function withApiFallback<T>(
  request: () => Promise<T>,
  fallback: () => Promise<T> | T
): Promise<T> {
  if (shouldUseMocks()) {
    return fallback();
  }

  try {
    return await request();
  } catch {
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
