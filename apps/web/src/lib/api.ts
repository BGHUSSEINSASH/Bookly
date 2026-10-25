export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const TOKEN_KEY = 'bookly.accessToken';
const REFRESH_KEY = 'bookly.refreshToken';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  getRefresh: () =>
    typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  raw?: boolean;
};

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) {
      tokenStore.clear();
      return null;
    }
    const json = await res.json();
    const access = json?.data?.accessToken;
    if (access) tokenStore.set(access, json?.data?.refreshToken ?? refresh);
    return access ?? null;
  } catch {
    return null;
  }
}

/** طلب موحّد للـ API مع دعم المصادقة وتحديث الرمز تلقائيًا */
export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, raw = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = auth ? tokenStore.get() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const send = () =>
    fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await send();

  // إعادة المحاولة مرة واحدة بعد تحديث الرمز
  if (res.status === 401 && auth) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      headers.Authorization = `Bearer ${fresh}`;
      res = await send();
    }
  }

  if (raw) return res as unknown as T;

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = json?.error ?? {};
    throw new ApiError(
      res.status,
      err.code ?? 'UNKNOWN',
      err.message ?? 'حدث خطأ غير متوقع',
      err.details,
    );
  }

  return (json?.data ?? json) as T;
}

export const api = {
  get: <T = any>(path: string, auth = true) => apiFetch<T>(path, { method: 'GET', auth }),
  post: <T = any>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: 'POST', body, auth }),
  patch: <T = any>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: 'PATCH', body, auth }),
  del: <T = any>(path: string, auth = true) => apiFetch<T>(path, { method: 'DELETE', auth }),
};
