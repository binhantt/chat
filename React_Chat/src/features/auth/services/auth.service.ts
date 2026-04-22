import axiosClient from '../../../shared/api/axiosClient';
import type { LoginResponse } from '../types/auth.type';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login with Google credential
   */
  loginWithGoogle: async (credential: string): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginResponse>('/auth/google', {
        idToken: credential, // Changed 'credential' to 'idToken'
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    try {
      const response = await axiosClient.post<{ accessToken: string }>(
        '/auth/refresh'
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
