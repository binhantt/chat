import type { StateStorage } from 'zustand/middleware';

export const AUTH_STORAGE_COOKIE_NAME = 'auth-storage';
export const AUTH_CREDENTIALS_COOKIE_NAME = 'auth-credentials';
const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const COOKIE_CHUNK_SIZE = 1500;
const COOKIE_MAX_CHUNKS = 16;
const COOKIE_META_SUFFIX = '__meta';

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

type ChunkCookieMeta = {
  chunks: number;
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

const buildChunkCookieName = (name: string, index: number): string => `${name}__${index}`;

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

const clearChunkedCookie = (name: string): void => {
  removeCookie(name);

  const rawMeta = readCookie(`${name}${COOKIE_META_SUFFIX}`);
  removeCookie(`${name}${COOKIE_META_SUFFIX}`);

  if (!rawMeta) {
    return;
  }

  try {
    const meta = JSON.parse(rawMeta) as Partial<ChunkCookieMeta>;
    const chunkCount =
      typeof meta.chunks === 'number' && Number.isInteger(meta.chunks) && meta.chunks > 0
        ? meta.chunks
        : 0;

    for (let index = 0; index < chunkCount; index += 1) {
      removeCookie(buildChunkCookieName(name, index));
    }
  } catch {
    for (let index = 0; index < COOKIE_MAX_CHUNKS; index += 1) {
      removeCookie(buildChunkCookieName(name, index));
    }
  }
};

const readChunkedCookie = (name: string): string | null => {
  const legacyValue = readCookie(name);
  const rawMeta = readCookie(`${name}${COOKIE_META_SUFFIX}`);

  if (!rawMeta) {
    return legacyValue;
  }

  try {
    const meta = JSON.parse(rawMeta) as Partial<ChunkCookieMeta>;
    const chunkCount = meta.chunks;

    if (
      typeof chunkCount !== 'number' ||
      !Number.isInteger(chunkCount) ||
      chunkCount <= 0 ||
      chunkCount > COOKIE_MAX_CHUNKS
    ) {
      clearChunkedCookie(name);
      return null;
    }

    const chunks: string[] = [];

    for (let index = 0; index < chunkCount; index += 1) {
      const chunk = readCookie(buildChunkCookieName(name, index));
      if (chunk === null) {
        clearChunkedCookie(name);
        return null;
      }

      chunks.push(chunk);
    }

    return chunks.join('');
  } catch {
    clearChunkedCookie(name);
    return null;
  }
};

const writeChunkedCookie = (name: string, value: string): void => {
  clearChunkedCookie(name);

  const chunks =
    value.length > 0 ? value.match(new RegExp(`.{1,${COOKIE_CHUNK_SIZE}}`, 'g')) ?? [] : [''];

  if (chunks.length === 0 || chunks.length > COOKIE_MAX_CHUNKS) {
    throw new Error(`Cookie payload for ${name} exceeds chunk storage limit.`);
  }

  chunks.forEach((chunk, index) => {
    writeCookie(buildChunkCookieName(name, index), chunk);
  });

  writeCookie(
    `${name}${COOKIE_META_SUFFIX}`,
    JSON.stringify({
      chunks: chunks.length,
    } satisfies ChunkCookieMeta)
  );
};

export const authCookieStorage: StateStorage = {
  getItem: (name: string): string | null => readChunkedCookie(name),
  setItem: (name: string, value: string): void => {
    writeChunkedCookie(name, value);
  },
  removeItem: (name: string): void => {
    clearChunkedCookie(name);
  },
};

export const getAccessTokenFromAuthCookie = (): string | null => {
  const rawAuthStorage = readChunkedCookie(AUTH_STORAGE_COOKIE_NAME);
  if (!rawAuthStorage) return null;

  try {
    const parsed = JSON.parse(rawAuthStorage) as PersistedAuthState;
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
};

export const getAuthStateFromCookie = (): PersistedAuthState | null => {
  const rawAuthStorage = readChunkedCookie(AUTH_STORAGE_COOKIE_NAME);
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

  writeChunkedCookie(AUTH_STORAGE_COOKIE_NAME, JSON.stringify(next));
};

export const clearAuthSessionCookie = (): void => {
  clearChunkedCookie(AUTH_STORAGE_COOKIE_NAME);
};

export const setAuthCredentialsCookie = (email: string, password: string): void => {
  const payload: AuthCredentialCookie = { email, password };
  writeChunkedCookie(AUTH_CREDENTIALS_COOKIE_NAME, JSON.stringify(payload));
};

export const getAuthCredentialsFromCookie = (): AuthCredentialCookie | null => {
  const raw = readChunkedCookie(AUTH_CREDENTIALS_COOKIE_NAME);
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
  clearChunkedCookie(AUTH_CREDENTIALS_COOKIE_NAME);
};
