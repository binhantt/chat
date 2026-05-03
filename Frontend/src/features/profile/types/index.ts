export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  bio?: string;
}

export interface BackendProfile {
  id: string;
  email: string;
  fullName: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
}

export const PROFILE_KEY = "chat.user.profile";

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
