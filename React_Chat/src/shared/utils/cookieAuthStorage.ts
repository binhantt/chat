import type { StateStorage } from 'zustand/middleware';

export const AUTH_STORAGE_COOKIE_NAME = 'auth-storage';
export const AUTH_CREDENTIALS_COOKIE_NAME = 'auth-credentials';
const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

type PersistedAuthState = {
  state?: {
    user?: Record<string, unknown> | null;
    accessToken?: string | null;
  };
  version?: number;
};

type AuthCredentialCookie = {
  email: string;
  password: string;
};

const isBrowser = (): boolean => typeof document !== 'undefined';

const readCookie = (name: string): string | null => {
  if (!isBrowser()) return null;

  const prefix = `${name}=`;
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }

  return null;
};

const writeCookie = (name: string, value: string): void => {
  if (!isBrowser()) return;

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
};

const removeCookie = (name: string): void => {
  if (!isBrowser()) return;

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

export const authCookieStorage: StateStorage = {
  getItem: (name: string): string | null => readCookie(name),
  setItem: (name: string, value: string): void => {
    writeCookie(name, value);
  },
  removeItem: (name: string): void => {
    removeCookie(name);
  },
};

export const getAccessTokenFromAuthCookie = (): string | null => {
  const rawAuthStorage = readCookie(AUTH_STORAGE_COOKIE_NAME);
  if (!rawAuthStorage) return null;

  try {
    const parsed = JSON.parse(rawAuthStorage) as PersistedAuthState;
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

export const getAuthStateFromCookie = (): PersistedAuthState | null => {
  const rawAuthStorage = readCookie(AUTH_STORAGE_COOKIE_NAME);
  if (!rawAuthStorage) return null;

  try {
    return JSON.parse(rawAuthStorage) as PersistedAuthState;
  } catch {
    return null;
  }
};

export const setAuthSessionInCookie = (params: {
  accessToken: string;
  user?: Record<string, unknown> | null;
}): void => {
  const current = getAuthStateFromCookie();
  const next: PersistedAuthState = {
    version: current?.version ?? 0,
    state: {
      ...current?.state,
      accessToken: params.accessToken,
      ...(params.user !== undefined ? { user: params.user } : {}),
    },
  };

  writeCookie(AUTH_STORAGE_COOKIE_NAME, JSON.stringify(next));
};

export const clearAuthSessionCookie = (): void => {
  removeCookie(AUTH_STORAGE_COOKIE_NAME);
};

export const setAuthCredentialsCookie = (email: string, password: string): void => {
  const payload: AuthCredentialCookie = { email, password };
  writeCookie(AUTH_CREDENTIALS_COOKIE_NAME, JSON.stringify(payload));
};

export const getAuthCredentialsFromCookie = (): AuthCredentialCookie | null => {
  const raw = readCookie(AUTH_CREDENTIALS_COOKIE_NAME);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthCredentialCookie>;
    if (!parsed.email || !parsed.password) return null;
    return { email: parsed.email, password: parsed.password };
  } catch {
    return null;
  }
};

export const clearAuthCredentialsCookie = (): void => {
  removeCookie(AUTH_CREDENTIALS_COOKIE_NAME);
};
