/**
 * Storage utilities with error handling
 */

interface StorageItem<T> {
  value: T;
  expiry?: number;
}

/**
 * Set item in localStorage with optional expiry
 */
export const setStorageItem = <T,>(
  key: string,
  value: T,
  expiryMinutes?: number
): void => {
  try {
    const item: StorageItem<T> = {
      value,
      expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : undefined,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting storage item '${key}':`, error);
  }
};

/**
 * Get item from localStorage
 */
export const getStorageItem = <T,>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed: StorageItem<T> = JSON.parse(item);

    // Check if expired
    if (parsed.expiry && parsed.expiry < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch (error) {
    console.error(`Error getting storage item '${key}':`, error);
    return null;
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage item '${key}':`, error);
  }
};

/**
 * Clear all localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

/**
 * Check if key exists in localStorage
 */
export const hasStorageItem = (key: string): boolean => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking storage item '${key}':`, error);
    return false;
  }
};

export default {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  clearStorage,
  hasStorageItem,
};
