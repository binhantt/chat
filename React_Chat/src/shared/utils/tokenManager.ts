/**
 * Token management utilities
 */

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set token in localStorage
 */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
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
 * Clear all auth data
 */
export const clearAuthData = (): void => {
  try {
    removeToken();
    localStorage.removeItem(USER_KEY);
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
