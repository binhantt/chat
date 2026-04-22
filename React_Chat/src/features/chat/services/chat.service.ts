import axiosClient from '../../../shared/api/axiosClient';
import { API_ENDPOINTS } from '../../../shared/constants/config';
import type { ChatMessage } from '../types/chat.types';
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
};

export interface ChatSearchUser {
  id: string;
  name: string;
  avatar?: string;
  status: string;
  email?: string;
  address?: string;
  gender?: string;
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
});

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
