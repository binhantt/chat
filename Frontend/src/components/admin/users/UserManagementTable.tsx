"use client";

import Link from "next/link";
import { Avatar, Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import type { AdminUserRecord } from "@/lib/admin-users";
import { useUserManagement } from "@/hooks/useUserManagement";

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

export function UserManagementTable({ users }: { users: AdminUserRecord[] }) {
  const { filteredUsers, query, resultCount, setQuery } = useUserManagement(users);

  return (
    <section className="overflow-hidden rounded-[28px] bg-white/88 p-0 backdrop-blur-xl">
      <div className="space-y-6 p-6 lg:p-7">
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <div className="space-y-1">
            <Text size="2" weight="medium" className="uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </Text>
            <Heading size="5" className="text-slate-950">
              Danh sach nguoi dung
            </Heading>
            <Text size="2" className="text-slate-500">
              {resultCount} ket qua trong bang dieu phoi.
            </Text>
          </div>

          <Flex align="center" gap="3" wrap="wrap">
            <div className="min-w-[18rem] max-w-full">
              <TextField.Root
                placeholder="Tim theo ten, email, role"
                size="3"
                variant="soft"
                className="outline-none"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon width="16" height="16" />
                </TextField.Slot>
              </TextField.Root>
            </div>
            <Button size="3" className="rounded-xl font-semibold">
              <PlusIcon width="16" height="16" />
              Them user
            </Button>
          </Flex>
        </Flex>

        <div className="overflow-x-auto rounded-[24px] bg-slate-50">
          <div className="min-w-[58rem]">
            <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(7rem,0.6fr)] gap-4 bg-slate-100/60 px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Tai khoan</span>
              <span>Role</span>
              <span>Trang thai</span>
              <span>Lan cuoi</span>
              <span className="text-right">Chi tiet</span>
            </div>

            <div className="bg-transparent">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-[minmax(0,1.8fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)_minmax(7rem,0.6fr)] items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70"
                  >
                    <Flex align="center" gap="3" className="min-w-0">
                      <Avatar size="2" fallback={user.fullName.charAt(0)} variant="soft" color="cyan" radius="full" />
                      <div className="min-w-0">
                        <Text as="p" size="2" weight="bold" className="truncate text-slate-900">
                          {user.fullName}
                        </Text>
                        <Text as="p" size="1" className="truncate text-slate-500">
                          {user.email}
                        </Text>
                      </div>
                    </Flex>

                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleTone[user.role]}`}>
                        {user.role}
                      </span>
                    </div>

                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone[user.status]}`}>
                        {user.status}
                      </span>
                    </div>

                    <Text size="2" className="text-slate-600">
                      {user.lastSeen}
                    </Text>

                    <div className="text-right">
                      <Link href={`/admin/users/${user.id}`} className="text-sm font-medium text-cyan-700 hover:text-cyan-900">
                        Mo
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <Text size="2" className="text-slate-500">
                    Khong tim thay nguoi dung phu hop.
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
