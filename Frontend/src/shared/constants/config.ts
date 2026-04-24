/**
 * Application Constants
 */

export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Environment
  ENV: import.meta.env.VITE_ENV || 'development',
  
  // App Name
  APP_NAME: 'Chat Application',
  APP_VERSION: '1.0.0',
};

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please fix the errors below.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  GOOGLE_LOGIN_FAILED: 'Google login failed. Please try again.',
};

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  CHAT: '/chat',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'accessToken',
  AUTH_USER: 'user',
  AUTH_STORAGE: 'auth-storage',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  CHAT: {
    MESSAGES: '/chat/messages',
    ROOMS: '/chat/rooms',
    USERS: '/chat/users',
    MATCHMAKING_SEARCH: '/chat/matchmaking/search',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  FEEDBACK: {
    CREATE: '/feedback',
    MINE: '/feedback/mine',
  },
  NOTIFICATIONS: {
    STREAM: '/notifications/stream',
  },
};
