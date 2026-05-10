async function fetchWithCookie(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
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
  const res = await fetchWithCookie('/api/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Không thể gửi báo cáo' }));
    throw new Error(err.message || 'Không thể gửi báo cáo');
  }
  return res.json();
}

export async function getReports(): Promise<ReportWithContext[]> {
  const res = await fetchWithCookie('/api/reports', { method: 'GET' });
  if (!res.ok) throw new Error('Không thể lấy danh sách báo cáo');
  return res.json();
}
