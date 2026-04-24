/**
 * Token management utilities (cookie-based)
 */
import {
  clearAuthSessionCookie,
  getAccessTokenFromAuthCookie,
  setAuthSessionInCookie,
} from './cookieAuthStorage';

/**
 * Get token from cookie storage
 */
export const getToken = (): string | null => {
  try {
    return getAccessTokenFromAuthCookie();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set token in cookie storage
 */
export const setToken = (token: string): void => {
  try {
    setAuthSessionInCookie({ accessToken: token });
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

/**
 * Remove token from cookie storage
 */
export const removeToken = (): void => {
  try {
    clearAuthSessionCookie();
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if token exists and is valid
 */
export const hasValidToken = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT and check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return expirationTime > Date.now();
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (): number | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
  const expiration = getTokenExpiration();
  if (!expiration) return false;

  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return expiration < fiveMinutesFromNow;
};

/**
 * Clear auth token data
 */
export const clearAuthData = (): void => {
  try {
    removeToken();
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export default {
  getToken,
  setToken,
  removeToken,
  hasValidToken,
  getTokenExpiration,
  isTokenExpiringSoon,
  clearAuthData,
};
