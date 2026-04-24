import axiosClient from '../../../shared/api/axiosClient';
import { API_ENDPOINTS } from '../../../shared/constants/config';
import type { ChatMessage, ChatRoomSummary } from '../types/chat.types';
import axios from 'axios';

type ApiMessage = {
  id?: string;
  content?: string;
  text?: string;
  senderId?: string;
  sender_id?: string;
  roomId?: string;
  room_id?: string;
  createdAt?: string;
  created_at?: string;
};

type ApiUser = {
  id?: string;
  userId?: string;
  name?: string;
  displayName?: string;
  avatar?: string;
  avatarUrl?: string;
  status?: string;
  email?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  birth_date?: string;
  isAnonymous?: boolean;
};

type ApiRoom = {
  id?: string;
  active?: boolean;
  identityRevealed?: boolean;
  currentUserLiked?: boolean;
  partnerLiked?: boolean;
  partner?: ApiUser;
};

export interface ChatSearchUser {
  id: string;
  name: string;
  avatar?: string;
  status: string;
  email?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  isAnonymous?: boolean;
}

export type MatchSearchResponse =
  | {
      status: 'waiting'
      queueSize: number
    }
  | {
      status: 'matched'
      roomId: string
      partner: ChatSearchUser
    }

const ENABLE_CHAT_USERS_API = import.meta.env.VITE_ENABLE_CHAT_USERS_API !== 'false';
let usersApiUnavailable = false;

const normalizeMessage = (payload: ApiMessage, roomId: string): ChatMessage => ({
  id: payload.id ?? `m-${Date.now()}`,
  conversationId: payload.roomId ?? payload.room_id ?? roomId,
  senderId: payload.senderId ?? payload.sender_id ?? 'unknown',
  text: payload.text ?? payload.content ?? '',
  createdAt: payload.createdAt ?? payload.created_at ?? new Date().toISOString(),
});

const normalizeUser = (payload: ApiUser): ChatSearchUser => ({
  id: payload.id ?? payload.userId ?? `u-${Date.now()}`,
  name: payload.name ?? payload.displayName ?? 'Unknown User',
  avatar: payload.avatar ?? payload.avatarUrl,
  status: payload.status ?? 'Offline',
  email: payload.email,
  address: payload.address,
  gender: payload.gender,
  birthDate: payload.birthDate ?? payload.birth_date,
  isAnonymous: payload.isAnonymous ?? false,
});

const normalizeStatus = (value?: string): ChatRoomSummary['partner']['status'] => {
  if (value === 'Online' || value === 'Away') {
    return value
  }

  return 'Offline'
}

const normalizeRoom = (payload?: ApiRoom | null): ChatRoomSummary | null => {
  if (!payload?.id || !payload.partner) {
    return null;
  }

  const partner = normalizeUser(payload.partner);

  return {
    id: payload.id,
    active: Boolean(payload.active ?? true),
    identityRevealed: Boolean(payload.identityRevealed),
    currentUserLiked: Boolean(payload.currentUserLiked),
    partnerLiked: Boolean(payload.partnerLiked),
    partner: {
      id: partner.id,
      name: partner.name,
      avatar: partner.avatar ?? '',
      status: normalizeStatus(partner.status),
      isAnonymous: partner.isAnonymous,
    },
  };
};

const chatService = {
  getRoomHistory: async (roomId: string): Promise<ChatMessage[]> => {
    const response = await axiosClient.get<{ messages?: ApiMessage[] } | ApiMessage[]>(
      `${API_ENDPOINTS.CHAT.ROOMS}/${roomId}/history`
    );

    const rawMessages = Array.isArray(response.data)
      ? response.data
      : response.data?.messages ?? [];

    return rawMessages.map((item) => normalizeMessage(item, roomId));
  },

  sendMessage: async (params: {
    roomId: string;
    content: string;
  }): Promise<ChatMessage> => {
    const response = await axiosClient.post<ApiMessage>(API_ENDPOINTS.CHAT.MESSAGES, {
      roomId: params.roomId,
      content: params.content,
    });

    return normalizeMessage(response.data, params.roomId);
  },

  leaveRoom: async (roomId: string): Promise<void> => {
    await axiosClient.post(`${API_ENDPOINTS.CHAT.ROOMS}/${roomId}/leave`);
  },

  getRoomSummary: async (roomId: string): Promise<ChatRoomSummary | null> => {
    const response = await axiosClient.get<{ room?: ApiRoom }>(
      `${API_ENDPOINTS.CHAT.ROOMS}/${roomId}`
    );
    return normalizeRoom(response.data.room);
  },

  likeRoom: async (roomId: string): Promise<ChatRoomSummary | null> => {
    const response = await axiosClient.post<{ room?: ApiRoom }>(
      `${API_ENDPOINTS.CHAT.ROOMS}/${roomId}/like`
    );
    return normalizeRoom(response.data.room);
  },

  searchUsers: async (query?: string): Promise<ChatSearchUser[]> => {
    if (!ENABLE_CHAT_USERS_API || usersApiUnavailable) {
      return [];
    }

    try {
      const response = await axiosClient.get<{ users?: ApiUser[] } | ApiUser[]>(
        API_ENDPOINTS.CHAT.USERS,
        {
          params: query ? { q: query } : undefined,
        }
      );

      const rawUsers = Array.isArray(response.data) ? response.data : response.data?.users ?? [];
      return rawUsers.map(normalizeUser);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        usersApiUnavailable = true;
        return [];
      }
      throw error;
    }
  },

  searchMatch: async (): Promise<MatchSearchResponse> => {
    const response = await axiosClient.post<MatchSearchResponse>(
      API_ENDPOINTS.CHAT.MATCHMAKING_SEARCH
    )
    return response.data
  },

  cancelMatchSearch: async (): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CHAT.MATCHMAKING_SEARCH)
  },
};

export default chatService;
