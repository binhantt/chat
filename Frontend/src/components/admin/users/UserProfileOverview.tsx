import { Badge, Flex, Heading, Text } from "@radix-ui/themes";
import type { AdminUserRecord } from "@/lib/admin-users";

const roleTone: Record<string, string> = {
  admin: "bg-cyan-50 text-cyan-700",
  moderator: "bg-slate-100 text-slate-700",
  support: "bg-amber-50 text-amber-700",
  user: "bg-slate-100 text-slate-700",
};

const statusTone: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-rose-50 text-rose-700",
};

export function UserProfileOverview({ user }: { user: AdminUserRecord }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_20rem]">
      <div className="rounded-3xl bg-white">
        <div className="space-y-5 p-6 lg:p-7 h-full">
          <Flex align="start" justify="between" gap="4" wrap="wrap">
            <div className="space-y-3">
              <Badge color="cyan" size="2" variant="soft">
                User profile
              </Badge>
              <div className="space-y-2">
                <Heading size="8" className="text-slate-950 font-sans tracking-tight">
                  {user.fullName}
                </Heading>
                <Text size="3" className="max-w-2xl leading-7 text-slate-600">
                  Theo doi role, trang thai va lich su session cua tai khoan nay
                  trong cung mot man hinh quan tri.
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleTone[user.role]}`}
              >
                {user.role}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone[user.status]}`}
              >
                {user.status}
              </span>
            </div>
          </Flex>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <Text size="1" className="uppercase tracking-[0.16em] text-slate-400 font-bold block mb-1">
                Email
              </Text>
              <Text as="p" size="3" className="mt-2 text-slate-900 font-medium">
                {user.email}
              </Text>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Text size="1" className="uppercase tracking-[0.16em] text-slate-400 font-bold block mb-1">
                Team
              </Text>
              <Text as="p" size="3" className="mt-2 text-slate-900 font-medium">
                {user.team}
              </Text>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Text size="1" className="uppercase tracking-[0.16em] text-slate-400 font-bold block mb-1">
                Joined
              </Text>
              <Text as="p" size="3" className="mt-2 text-slate-900 font-medium">
                {user.joinedAt}
              </Text>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Text size="1" className="uppercase tracking-[0.16em] text-slate-400 font-bold block mb-1">
                Open cases
              </Text>
              <Text as="p" size="3" className="mt-2 text-slate-900 font-medium">
                {user.openCases}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white h-full">
        <div className="space-y-4 p-6 lg:p-7 h-full flex flex-col">
          <Text
            size="2"
            weight="medium"
            className="uppercase tracking-[0.18em] text-slate-400"
          >
            Access snapshot
          </Text>
          <div className="rounded-2xl bg-slate-50 p-5 flex-1 flex flex-col justify-center">
            <Text size="2" className="text-slate-500 font-bold block mb-1">
              Lần cuối hoạt động
            </Text>
            <Text as="p" className="mt-2 text-2xl font-semibold text-slate-950">
              {user.lastSeen}
            </Text>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 flex-1 flex flex-col justify-center">
            <Text size="2" className="text-slate-500 font-bold block mb-1">
              Mức độ ưu tiên
            </Text>
            <Text as="p" className="mt-2 text-2xl font-semibold text-slate-950">
              {user.status === "suspended" ? "Cần xem xét" : "Đang xử lý"}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
