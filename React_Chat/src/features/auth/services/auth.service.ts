import axiosClient from '../../../shared/api/axiosClient';
import { API_ENDPOINTS } from '../../../shared/constants/config';
import type { LoginResponse } from '../types/auth.type';

type LoginApiResponse = LoginResponse & {
  token?: string;
};

const normalizeLoginResponse = (payload: LoginApiResponse): LoginResponse => {
  return {
    ...payload,
    accessToken: payload.accessToken ?? payload.token ?? '',
  };
};

const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginApiResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      return normalizeLoginResponse(response.data);
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login with Google credential
   */
  loginWithGoogle: async (credential: string): Promise<LoginResponse> => {
    try {
      const response = await axiosClient.post<LoginApiResponse>(API_ENDPOINTS.AUTH.LOGIN_GOOGLE, {
        idToken: credential, // Changed 'credential' to 'idToken'
      });
      return normalizeLoginResponse(response.data);
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
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
