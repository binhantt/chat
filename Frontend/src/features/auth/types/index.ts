export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "user";
  fullName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}
