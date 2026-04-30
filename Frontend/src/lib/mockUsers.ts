export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "moderator" | "support" | "user";
  status: "active" | "invited" | "suspended";
  team: string;
  lastSeen: string;
  joinedAt: string;
  openCases: number;
}

export const adminUsers: AdminUserRecord[] = [
  {
    id: "usr_adm_001",
    fullName: "Nguyen Minh Anh",
    email: "minhanh.admin@chat.local",
    role: "admin",
    status: "active",
    team: "Platform",
    lastSeen: "2 phut truoc",
    joinedAt: "12/03/2026",
    openCases: 3,
  },
  {
    id: "usr_mod_014",
    fullName: "Tran Quoc Bao",
    email: "quocbao.mod@chat.local",
    role: "moderator",
    status: "active",
    team: "Operations",
    lastSeen: "10 phut truoc",
    joinedAt: "28/02/2026",
    openCases: 8,
  },
  {
    id: "usr_sp_032",
    fullName: "Le Hoai Thu",
    email: "hoaithu.support@chat.local",
    role: "support",
    status: "invited",
    team: "Support",
    lastSeen: "Chua dang nhap",
    joinedAt: "25/04/2026",
    openCases: 0,
  },
  {
    id: "usr_usr_117",
    fullName: "Pham Duc Huy",
    email: "duchuy.user@chat.local",
    role: "user",
    status: "suspended",
    team: "External",
    lastSeen: "1 ngay truoc",
    joinedAt: "03/01/2026",
    openCases: 1,
  },
  {
    id: "usr_adm_008",
    fullName: "Vo Lan Chi",
    email: "lanchi.admin@chat.local",
    role: "admin",
    status: "active",
    team: "Security",
    lastSeen: "30 phut truoc",
    joinedAt: "19/11/2025",
    openCases: 2,
  },
];

export function getAdminUserById(id: string) {
  return adminUsers.find((user) => user.id === id) ?? null;
}
