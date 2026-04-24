import axiosClient from '../../../shared/api/axiosClient';
import { API_ENDPOINTS } from '../../../shared/constants/config';
import type { PersonalDetail, User } from '../../auth/types/auth.type';

export interface UpdateProfilePayload {
  displayName?: string;
  email?: string;
  attributes?: Record<string, string | number | boolean>;
  personalDetail?: PersonalDetail;
}

type ProfileApiResponse =
  | User
  | { user?: User; data?: User | { user?: User } };

const resolveUserFromResponse = (payload: ProfileApiResponse): User | null => {
  if ((payload as User).id) {
    return payload as User;
  }

  const directUser = (payload as { user?: User }).user;
  if (directUser?.id) {
    return directUser;
  }

  const nestedData = (payload as { data?: User | { user?: User } }).data;
  if (!nestedData) {
    return null;
  }

  if ((nestedData as User).id) {
    return nestedData as User;
  }

  return (nestedData as { user?: User }).user ?? null;
};

const profileService = {
  getProfile: async (): Promise<User | null> => {
    const response = await axiosClient.get<ProfileApiResponse>(API_ENDPOINTS.USERS.PROFILE);
    return resolveUserFromResponse(response.data);
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User | null> => {
    const response = await axiosClient.put<ProfileApiResponse>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      payload
    );
    return resolveUserFromResponse(response.data);
  },
};

export default profileService;
