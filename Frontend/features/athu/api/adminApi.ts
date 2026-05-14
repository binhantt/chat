const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchWithCookie(url: string, options: RequestInit = {}) {
  const request = () => fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let response = await request();

  if (response.status === 401 || response.status === 403) {
    const refresh = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (refresh.ok) {
      response = await request();
    }
  }

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    }
  }

  return response;
}

// ============ CHAT API ============

export async function getAdminConversations(limit = 50, offset = 0) {
  const res = await fetchWithCookie(
    `/api/v1/admin/chats?limit=${limit}&offset=${offset}`,
    { method: "GET" },
  );
  if (!res.ok) throw new Error("Không thể lấy danh sách cuộc trò chuyện");
  return res.json();
}

export async function getConversation(id: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${id}`, { method: "GET" });
  if (!res.ok) throw new Error("Không thể lấy thông tin cuộc trò chuyện");
  return res.json();
}

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const res = await fetchWithCookie(
    `/api/v1/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    { method: "GET" }
  );
  if (!res.ok) throw new Error("Không thể lấy tin nhắn");
  return res.json();
}

export async function sendMessage(conversationId: string, content: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Không thể gửi tin nhắn");
  return res.json();
}

export async function markAsRead(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Không thể đánh dấu đã đọc");
  return res.json();
}

export async function blockConversation(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/block`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Không thể chặn cuộc trò chuyện");
  return res.json();
}

export async function endConversation(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/end`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Không thể kết thúc cuộc trò chuyện");
  return res.json();
}

// ============ MATCH API ============

export async function joinMatchQueue() {
  const res = await fetchWithCookie("/api/v1/match", { method: "POST" });
  if (!res.ok) throw new Error("Không thể tham gia hàng đợi");
  return res.json();
}

export async function leaveMatchQueue() {
  const res = await fetchWithCookie("/api/v1/match", { method: "DELETE" });
  if (!res.ok) throw new Error("Không thể rời hàng đợi");
  return res.json();
}

export async function getMatchStatus() {
  const res = await fetchWithCookie("/api/v1/match", { method: "GET" });
  if (!res.ok) throw new Error("Không thể lấy trạng thái tìm kiếm");
  return res.json();
}

// ============ ADMIN API ============

export async function getAdminUsers() {
  const res = await fetchWithCookie("/api/v1/admin/users", { method: "GET" });
  if (!res.ok) throw new Error("Không thể lấy danh sách người dùng");
  return res.json();
}

export async function getAdminUser(id: string) {
  const res = await fetchWithCookie(`/api/v1/admin/users/${id}`, { method: "GET" });
  if (!res.ok) throw new Error("Không thể lấy thông tin người dùng");
  return res.json();
}

export async function createAdminUser(data: {
  email: string;
  fullName?: string;
  password?: string;
  role?: string;
}) {
  const res = await fetchWithCookie("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể tạo người dùng");
  return res.json();
}

export async function updateAdminUser(
  id: string,
  data: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    gender?: string;
    city?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
  }
) {
  const res = await fetchWithCookie(`/api/v1/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể cập nhật người dùng");
  return res.json();
}

export async function updateAdminUserAccess(
  id: string,
  data: {
    isActive?: boolean;
    role?: string;
  }
) {
  const res = await fetchWithCookie(`/api/v1/admin/users/${id}/access`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể cập nhật quyền truy cập");
  return res.json();
}

// ============ CONDUCT RULES API ============

export interface ConductRule {
  id: string;
  phrase: string;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getConductRules(): Promise<ConductRule[]> {
  const res = await fetchWithCookie("/api/v1/admin/conduct-rules", { method: "GET" });
  if (!res.ok) throw new Error("Không thể lấy danh sách luật ứng xử");
  return res.json();
}

export async function createConductRule(data: { phrase: string; note?: string }) {
  const res = await fetchWithCookie("/api/v1/admin/conduct-rules", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Không thể tạo luật ứng xử" }));
    throw new Error(err.message || "Không thể tạo luật ứng xử");
  }
  return res.json();
}

export async function updateConductRule(
  id: string,
  data: { phrase?: string; note?: string | null; isActive?: boolean },
) {
  const res = await fetchWithCookie(`/api/v1/admin/conduct-rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Không thể cập nhật luật ứng xử" }));
    throw new Error(err.message || "Không thể cập nhật luật ứng xử");
  }
  return res.json();
}

export async function deleteConductRule(id: string) {
  const res = await fetchWithCookie(`/api/v1/admin/conduct-rules/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không thể xóa luật ứng xử");
  return res.json();
}

// ============ TYPES ============

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
  user2?: { id: string; email: string; fullName: string | null; avatarUrl: string | null };
  status: "active" | "ended" | "blocked";
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
  status?: "waiting" | "matched" | "connecting";
  conversationId?: string;
  matchedWithUserId?: string;
  joinedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  googleId?: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  gender?: "male" | "female" | "other" | null;
  city?: string | null;
  role: string;
  isActive: boolean;
  lockType?: "none" | "15_days" | "30_days" | "permanent";
  lockedUntil?: string | null;
  lockReason?: string | null;
  lockedByReportId?: string | null;
  createdAt: string;
  updatedAt: string;
}
