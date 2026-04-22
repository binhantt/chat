import { useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import type { AuthState, User } from '../types/auth.type';

interface UseAuthReturn extends AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

/**
 * Custom hook to access auth store
 * Provides type-safe access to authentication state and actions
 */
export const useAuth = (): UseAuthReturn => {
  const store = useAuthStore();
  
  return useMemo(() => ({
    ...store,
    isAuthenticated: !!(store.user && store.accessToken),
    token: store.accessToken,
  }), [store]);
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { user, accessToken } = useAuthStore();
  return !!(user && accessToken);
};

/**
 * Hook to get current user
 */
export const useCurrentUser = (): User | null => {
  return useAuthStore().user;
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role: string): boolean => {
  const user = useAuthStore().user;
  if (!user || !user.attributes) return false;
  return user.attributes.role === role;
};

export default useAuth;
