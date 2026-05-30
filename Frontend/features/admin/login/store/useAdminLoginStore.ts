import { create } from "zustand";

type AdminLoginState = {
  email: string;
  error: string | null;
  isSubmitting: boolean;
  password: string;
  setEmail: (email: string) => void;
  setError: (error: string | null) => void;
  setPassword: (password: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
};

export const useAdminLoginStore = create<AdminLoginState>((set) => ({
  email: "",
  error: null,
  isSubmitting: false,
  password: "",
  setEmail: (email) => set({ email, error: null }),
  setError: (error) => set({ error }),
  setPassword: (password) => set({ password, error: null }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
