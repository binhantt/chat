export interface PersonalDetail {
  gender?: string;
  birthDate?: string;
}

export interface User {
  id: string;
  email?: string;
  displayName: string;
  trustScore: number;
  attributes?: Record<string, string | number | boolean>;
  personalDetail?: PersonalDetail;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface LoginResponse {
  user: User;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
