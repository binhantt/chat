import axiosClient from '../../../shared/api/axiosClient';
import { API_ENDPOINTS } from '../../../shared/constants/config';
import type { User } from '../types/auth.type';
import type { LoginResponse } from '../types/auth.type';

const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
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
      const response = await axiosClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN_GOOGLE, {
        idToken: credential, // Changed 'credential' to 'idToken'
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get current user profile from server cookie session
   */
  getCurrentUserProfile: async (): Promise<User> => {
    const response = await axiosClient.get<{ user?: User }>(API_ENDPOINTS.USERS.PROFILE);
    if (!response.data.user) {
      throw new Error('User profile not found.');
    }
    return response.data.user;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    try {
      const response = await axiosClient.post<{ accessToken?: string; token?: string }>(
        API_ENDPOINTS.AUTH.REFRESH
      );
      return {
        accessToken: response.data.accessToken ?? response.data.token ?? '',
      };
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
