import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';
import type { AuthState, User } from '../types/auth.type';

/**
 * Auth Store with Zustand
 * Persists token and user in localStorage
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
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
