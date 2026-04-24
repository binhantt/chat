import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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

let refreshPromise: Promise<boolean> | null = null;

const isBrowser = typeof window !== 'undefined';

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
  redirectToLogin();
};

const requestNewToken = async (): Promise<boolean> => {
  try {
    await authRequester.post<LoginResponseShape>('/auth/refresh');
    return true;
  } catch (refreshError) {
    throw refreshError;
  }
};

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

        const refreshed = await refreshPromise;

        if (refreshed) {
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
