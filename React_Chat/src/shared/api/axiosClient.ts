import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthCredentialsCookie,
  clearAuthSessionCookie,
  getAccessTokenFromAuthCookie,
  getAuthCredentialsFromCookie,
  setAuthSessionInCookie,
} from '../utils/cookieAuthStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type LoginResponseShape = {
  accessToken?: string;
  token?: string;
  user?: Record<string, unknown>;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const authRequester = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

const isBrowser = typeof window !== 'undefined';

const getNormalizedToken = (payload: LoginResponseShape | undefined): string | null => {
  if (!payload) return null;
  return payload.accessToken ?? payload.token ?? null;
};

const hasJwtSignature = (token: string): boolean => {
  const tokenParts = token.split('.');
  return tokenParts.length === 3 && tokenParts[2].trim().length > 0;
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/google') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
};

const redirectToLogin = (): void => {
  if (!isBrowser) return;
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const forceLogout = (): void => {
  clearAuthSessionCookie();
  clearAuthCredentialsCookie();
  redirectToLogin();
};

const requestNewToken = async (): Promise<string | null> => {
  try {
    const refreshResponse = await authRequester.post<LoginResponseShape>('/auth/refresh');
    const nextToken = getNormalizedToken(refreshResponse.data);

    if (nextToken) {
      setAuthSessionInCookie({
        accessToken: nextToken,
        user: refreshResponse.data?.user,
      });
      return nextToken;
    }
  } catch (refreshError) {
    const refreshStatus = axios.isAxiosError(refreshError)
      ? refreshError.response?.status
      : undefined;

    if (refreshStatus === 404 || refreshStatus === 401) {
      const credentials = getAuthCredentialsFromCookie();
      if (!credentials) {
        throw refreshError;
      }

      const loginResponse = await authRequester.post<LoginResponseShape>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const nextToken = getNormalizedToken(loginResponse.data);
      if (!nextToken) {
        throw refreshError;
      }

      setAuthSessionInCookie({
        accessToken: nextToken,
        user: loginResponse.data?.user,
      });

      return nextToken;
    }

    throw refreshError;
  }

  return null;
};

// Request interceptor - add token to headers
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromAuthCookie();
    if (token && hasJwtSignature(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - refresh token then retry protected request
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!originalRequest || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = requestNewToken().finally(() => {
            refreshPromise = null;
          });
        }

        const nextToken = await refreshPromise;

        if (nextToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return axiosClient(originalRequest);
        }
      } catch {
        forceLogout();
      }
    }

    if (status === 401) {
      forceLogout();
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
