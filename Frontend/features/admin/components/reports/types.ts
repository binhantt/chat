export type AdminReport = {
  createdAt: string;
  description: string | null;
  id: string;
  lockType?: string;
  reason: string;
  recentPartners?: {
    avatarUrl: string | null;
    email?: string;
    fullName: string | null;
    id: string;
  }[];
  reportedUser: {
    email: string;
    fullName: string | null;
    id: string;
    isActive?: boolean;
    lockedUntil?: string | null;
    lockType?: string;
  };
  reporter: {
    email: string;
    fullName: string | null;
    id: string;
  };
  status: string;
};

export type ReportStatusFilter = "all" | "pending" | "reviewed" | "resolved" | "rejected";

export type ReportStatsValue = {
  pending: number;
  rejected: number;
  resolved: number;
  total: number;
};

export type ReportAiReview = {
  evidenceMessages: Array<{
    content: string;
    conversationId: string;
    createdAt: string;
    id: string;
    matchedRule: string;
  }>;
  matchedRules: string[];
  recommendation: "block" | "review" | "none";
  reportId: string;
  riskLevel: "high" | "medium" | "low";
  score: number;
  summary: string;
  suggestedLockType: string;
  suggestedStatus: string;
};
