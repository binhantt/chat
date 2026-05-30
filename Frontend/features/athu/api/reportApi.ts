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

export type ReportReason = 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'underage' | 'other';

export interface CreateReportPayload {
  reportedUserId: string;
  reason: ReportReason;
  description?: string;
}

export interface RecentPartner {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ReportWithContext {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; fullName: string | null; email: string };
  reportedUser: { id: string; fullName: string | null; email: string };
  recentPartners: RecentPartner[];
}

export async function createReport(payload: CreateReportPayload) {
  const res = await fetchWithCookie('/api/v1/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Cannot submit report' }));
    throw new Error(err.message || 'Cannot submit report');
  }
  return res.json();
}

export async function getReports(): Promise<ReportWithContext[]> {
  const res = await fetchWithCookie('/api/v1/manager/reports', { method: 'GET' });
  if (!res.ok) throw new Error("Cannot fetch reports list");
  return res.json();
}
