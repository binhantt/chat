async function fetchWithCookie(url: string, options: RequestInit = {}) {
  const buildHeaders = () => ({
    "Content-Type": "application/json",
    ...getCsrfHeader(),
    ...options.headers,
  });

  const request = () => fetch(url, {
    ...options,
    credentials: "include",
    headers: buildHeaders(),
  });

  let response = await request();

  if (response.status === 403 && (await isCsrfResponse(response))) {
    await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: buildHeaders(),
    }).catch(() => null);

    response = await request();
  }

  if (response.status === 401 && (await isAccessTokenResponse(response))) {
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

  if (response.status === 401) {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    }
  }

  return response;
}

async function isCsrfResponse(response: Response): Promise<boolean> {
  const data = (await response.clone().json().catch(() => null)) as {
    message?: string;
  } | null;

  return Boolean(data?.message?.toLowerCase().includes("csrf"));
}

async function isAccessTokenResponse(response: Response): Promise<boolean> {
  const data = (await response.clone().json().catch(() => null)) as {
    message?: string;
  } | null;
  const message = data?.message?.toLowerCase() ?? "";

  return message.includes("access token");
}

function getCsrfHeader(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }

  const csrfToken = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrf_token="))
    ?.split("=")
    .slice(1)
    .join("=");

  return csrfToken ? { "x-csrf-token": decodeURIComponent(csrfToken) } : {};
}

const ADMIN_GET_CACHE_TTL_MS = 3000;
const adminGetCache = new Map<string, { data: unknown; expiresAt: number }>();
const adminGetInflight = new Map<string, Promise<unknown>>();

async function getCachedAdminJson<T = unknown>(url: string, errorMessage: string): Promise<T> {
  const cached = adminGetCache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const inflight = adminGetInflight.get(url);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const request = fetchWithCookie(url, { method: "GET" })
    .then(async (res) => {
      if (!res.ok) throw new Error(errorMessage);
      const data: unknown = await res.json();
      adminGetCache.set(url, {
        data,
        expiresAt: Date.now() + ADMIN_GET_CACHE_TTL_MS,
      });
      return data;
    })
    .finally(() => {
      adminGetInflight.delete(url);
    });

  adminGetInflight.set(url, request);
  return request as Promise<T>;
}

function clearAdminGetCache() {
  adminGetCache.clear();
  adminGetInflight.clear();
}

// ============ CHAT API ============

export interface AdminConversationPage {
  items: Conversation[];
  limit: number;
  nextCursor: string | null;
  stats?: {
    active: number;
    blocked: number;
    ended: number;
    total: number;
  };
}

export async function getAdminConversations({
  cursor,
  limit = 20,
  status,
}: {
  cursor?: string | null;
  limit?: number;
  status?: Conversation["status"] | "all";
} = {}): Promise<AdminConversationPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  if (status && status !== "all") params.set("status", status);

  const data = await getCachedAdminJson(
    `/api/v1/manager/chats?${params.toString()}`,
    "Cannot fetch conversations",
  );
  if (Array.isArray(data)) {
    return { items: data as Conversation[], limit, nextCursor: null };
  }
  return data as AdminConversationPage;
}

export async function getConversation(id: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${id}`, { method: "GET" });
  if (!res.ok) throw new Error("Cannot fetch conversation info");
  return res.json();
}

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const res = await fetchWithCookie(
    `/api/v1/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    { method: "GET" }
  );
  if (!res.ok) throw new Error("Cannot fetch messages");
  return res.json();
}

export async function sendMessage(conversationId: string, content: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Cannot send message");
  return res.json();
}

export async function markAsRead(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Cannot mark as read");
  return res.json();
}

export async function blockConversation(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/block`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Cannot block conversation");
  return res.json();
}

export async function endConversation(conversationId: string) {
  const res = await fetchWithCookie(`/api/v1/chat/conversations/${conversationId}/end`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Cannot end conversation");
  return res.json();
}

// ============ MATCH API ============

export async function joinMatchQueue() {
  const res = await fetchWithCookie("/api/v1/match", { method: "POST" });
  if (!res.ok) throw new Error("Cannot join queue");
  return res.json();
}

export async function leaveMatchQueue() {
  const res = await fetchWithCookie("/api/v1/match", { method: "DELETE" });
  if (!res.ok) throw new Error("Cannot leave queue");
  return res.json();
}

export async function getMatchStatus() {
  const res = await fetchWithCookie("/api/v1/match", { method: "GET" });
  if (!res.ok) throw new Error("Cannot fetch search status");
  return res.json();
}

// ============ ADMIN API ============

export interface AdminUserPage {
  items: AdminUser[];
  limit: number;
  nextCursor: string | null;
}

export async function getAdminUsers({
  cursor,
  limit = 20,
  status,
}: {
  cursor?: string | null;
  limit?: number;
  status?: "active" | "all" | "banned";
} = {}): Promise<AdminUserPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  if (status && status !== "all") params.set("status", status);

  const data = await getCachedAdminJson(
    `/api/v1/manager/users?${params.toString()}`,
    "Cannot fetch users list",
  );
  if (Array.isArray(data)) {
    return { items: data as AdminUser[], limit, nextCursor: null };
  }
  return data as AdminUserPage;
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  return getCachedAdminJson<AdminUser>(
    `/api/v1/manager/users/${id}`,
    "Cannot fetch user info",
  );
}

export async function createAdminUser(data: {
  email: string;
  fullName?: string;
  password?: string;
}) {
  const res = await fetchWithCookie("/api/v1/manager/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cannot create user");
  clearAdminGetCache();
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
  const res = await fetchWithCookie(`/api/v1/manager/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cannot update user");
  clearAdminGetCache();
  return res.json();
}

export async function updateAdminUserAccess(
  id: string,
  data: {
    isActive?: boolean;
  }
) {
  const res = await fetchWithCookie(`/api/v1/manager/users/${id}/access`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cannot update permissions");
  clearAdminGetCache();
  return res.json();
}

export interface AdminServerMetrics {
  cpu: {
    cores: number;
    usagePercent: number;
  };
  memory: {
    freeBytes: number;
    totalBytes: number;
    usedBytes: number;
    usedPercent: number;
  };
  process: {
    heapTotalBytes: number;
    heapUsedBytes: number;
    rssBytes: number;
    uptimeSeconds: number;
  };
  sampledAt: string;
  system: {
    hostname: string;
    platform: string;
    uptimeSeconds: number;
  };
}

export async function getAdminServerMetrics(): Promise<AdminServerMetrics> {
  const res = await fetchWithCookie("/api/v1/manager/system/metrics", { method: "GET" });
  if (!res.ok) throw new Error("Cannot fetch server metrics");
  return res.json();
}

export interface AdminVisitStats {
  last7DaysViews: number;
  popularPaths: Array<{
    count: number;
    path: string;
  }>;
  sampledAt: string;
  todayViews: number;
  totalViews: number;
  uniqueVisitors: number;
}

export async function getAdminVisitStats(): Promise<AdminVisitStats> {
  return getCachedAdminJson<AdminVisitStats>(
    "/api/v1/manager/analytics/visits",
    "Cannot fetch visit stats",
  );
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

export interface ConductRulePage {
  items: ConductRule[];
  limit: number;
  nextCursor: string | null;
}

export async function getConductRules({
  cursor,
  limit = 10,
}: {
  cursor?: string | null;
  limit?: number;
} = {}): Promise<ConductRulePage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const data = await getCachedAdminJson(
    `/api/v1/manager/conduct-rules?${params.toString()}`,
    "Cannot fetch conduct rules",
  );
  if (Array.isArray(data)) {
    return { items: data as ConductRule[], limit, nextCursor: null };
  }
  return data as ConductRulePage;
}

export async function createConductRule(data: { phrase: string; note?: string }) {
  const res = await fetchWithCookie("/api/v1/manager/conduct-rules", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Cannot create conduct rule" }));
    throw new Error(err.message || "Cannot create conduct rule");
  }
  clearAdminGetCache();
  return res.json();
}

export async function updateConductRule(
  id: string,
  data: { phrase?: string; note?: string | null; isActive?: boolean },
) {
  const res = await fetchWithCookie(`/api/v1/manager/conduct-rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Cannot update conduct rule" }));
    throw new Error(err.message || "Cannot update conduct rule");
  }
  clearAdminGetCache();
  return res.json();
}

export async function deleteConductRule(id: string) {
  const res = await fetchWithCookie(`/api/v1/manager/conduct-rules/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Cannot delete conduct rule");
  clearAdminGetCache();
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
  isActive: boolean;
  lockType?: "none" | "15_days" | "30_days" | "permanent";
  lockedUntil?: string | null;
  lockReason?: string | null;
  lockedByReportId?: string | null;
  createdAt: string;
  updatedAt: string;
}
