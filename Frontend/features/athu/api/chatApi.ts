async function fetchWithCookie(url: string, options: RequestInit = {}) {
  const request = () => fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  let response = await request();

  if (response.status === 401 && (await isAccessTokenResponse(response))) {
    const refresh = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (refresh.ok) {
      response = await request();
    }
  }

  return response;
}

async function isAccessTokenResponse(response: Response): Promise<boolean> {
  const data = (await response.clone().json().catch(() => null)) as { message?: string } | null;
  const message = data?.message?.toLowerCase() ?? "";

  return message.includes("access token");
}

// ============ CHAT API ============

export async function getConversations(limit = 20, offset = 0) {
  const res = await fetchWithCookie(
    `/api/v1/chat/conversations?limit=${limit}&offset=${offset}`,
    { method: 'GET' },
  );
  if (!res.ok) throw new Error('Cannot fetch conversations');
  return res.json();
}

export async function getConversation(id: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${id}`, { method: 'GET' });
  if (!res.ok) throw new Error('Cannot fetch conversation info');
  return res.json();
}

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const res = await fetchWithCookie(
    `/api/v1/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    { method: 'GET' }
  );
  if (!res.ok) throw new Error('Cannot fetch messages');
  return res.json();
}

export async function sendMessage(conversationId: string, content: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Cannot send message');
  return res.json();
}

export async function markAsRead(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Cannot mark as read');
  return res.json();
}

export async function blockConversation(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/block`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Cannot block conversation');
  return res.json();
}

export async function endConversation(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/end`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Cannot end conversation');
  return res.json();
}

// ============ MATCH API ============

export async function joinMatchQueue() {
  const res = await fetchWithCookie('/api/v1/match', { method: 'POST' });
  if (!res.ok) throw new Error('Cannot join queue');
  return res.json();
}

export async function leaveMatchQueue() {
  const res = await fetchWithCookie('/api/v1/match', { method: 'DELETE' });
  if (!res.ok) throw new Error('Cannot leave queue');
  return res.json();
}

export async function getMatchStatus() {
  const res = await fetchWithCookie('/api/v1/match', { method: 'GET' });
  if (!res.ok) throw new Error('Cannot fetch search status');
  return res.json();
}

// ============ TYPES ============

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
  user2?: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
  status: 'active' | 'ended' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface MatchStatus {
  inQueue: boolean;
  status?: 'waiting' | 'matched' | 'connecting';
  conversationId?: string;
  matchedWithUserId?: string;
  joinedAt?: string;
}
