import { create } from 'zustand';
import authService from '../services/auth.service';
import type { AuthState } from '../types/auth.type';

const clearLegacyAuthClientStorage = (): void => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem('auth-storage');
  window.localStorage.removeItem('auth-credentials');
  window.localStorage.removeItem('banked-auth-storage');
};

/**
 * Auth Store with Zustand
 * Keeps auth state in memory and hydrates from server cookies
 */
export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initializeAuth: async () => {
      if (get().isInitialized) return;
      clearLegacyAuthClientStorage();

      try {
        const user = await authService.getCurrentUserProfile();
        set({
          user,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch {
        clearLegacyAuthClientStorage();
        set({
          user: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    },

    /**
     * Login with email and password
     */
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.login(email, password);
        set({
          user: data.user,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch (error: any) {
        const errorMessage =
          error?.message ||
          error?.error ||
          'Login failed. Please try again.';
        set({
          isLoading: false,
          error: errorMessage,
          user: null,
        });
        throw new Error(errorMessage);
      }
    },

    /**
     * Login with Google credential
     */
    loginWithGoogle: async (credential: string) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authService.loginWithGoogle(credential);
        set({
          user: data.user,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch (error: any) {
        const errorMessage =
          error?.message ||
          error?.error ||
          'Google login failed. Please try again.';
        set({
          isLoading: false,
          error: errorMessage,
          user: null,
        });
        throw new Error(errorMessage);
      }
    },

    /**
     * Logout user
     */
    logout: async () => {
      set({ isLoading: true });
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        clearLegacyAuthClientStorage();
        set({
          user: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    },

    /**
     * Clear error message
     */
    clearError: () => {
      set({ error: null });
    },
  })
);
