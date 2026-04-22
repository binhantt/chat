import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import authService from '../services/auth.service';
import type { AuthState } from '../types/auth.type';
import {
  AUTH_STORAGE_COOKIE_NAME,
  authCookieStorage,
  clearAuthCredentialsCookie,
  setAuthCredentialsCookie,
} from '../../../shared/utils/cookieAuthStorage';

/**
 * Auth Store with Zustand
 * Persists token and user in cookies
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      /**
       * Login with email and password
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(email, password);
          setAuthCredentialsCookie(email, password);
          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
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
            accessToken: null,
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
          clearAuthCredentialsCookie();
          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
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
            accessToken: null,
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
          clearAuthCredentialsCookie();
          set({
            user: null,
            accessToken: null,
            isLoading: false,
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
    }),
    {
      name: AUTH_STORAGE_COOKIE_NAME,
      storage: createJSONStorage(() => authCookieStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
