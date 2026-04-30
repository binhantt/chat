export const mockRoles = [
  {
    id: "R-001",
    name: "System Administrator",
    level: "admin",
    usersCount: 2,
    permissions: ["All Access", "System Config", "User Management"],
    status: "active",
  },
  {
    id: "R-002",
    name: "Chat Moderator",
    level: "moderator",
    usersCount: 15,
    permissions: ["View Chats", "Ban Users", "Delete Messages"],
    status: "active",
  },
  {
    id: "R-003",
    name: "Support Staff",
    level: "support",
    usersCount: 8,
    permissions: ["Reply to Chats", "View Histories"],
    status: "active",
  },
  {
    id: "R-004",
    name: "Read-only Guest",
    level: "user",
    usersCount: 0,
    permissions: ["View Public Dashboards"],
    status: "inactive",
  },
];
