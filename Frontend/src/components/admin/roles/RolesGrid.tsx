"use client";

import { Badge, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { IdCardIcon, PersonIcon, PlusIcon } from "@radix-ui/react-icons";
import { mockRoles } from "./mockRoles";

const levelTone: Record<string, { bg: string; icon: string; accent: string }> = {
  admin: { bg: "bg-rose-50", icon: "text-rose-600", accent: "bg-rose-500" },
  moderator: { bg: "bg-indigo-50", icon: "text-indigo-600", accent: "bg-indigo-500" },
  support: { bg: "bg-cyan-50", icon: "text-cyan-600", accent: "bg-cyan-500" },
  user: { bg: "bg-slate-100", icon: "text-slate-600", accent: "bg-slate-400" },
};

export function RolesGrid() {
  return (
    <div className="space-y-8">
      <Flex align="center" justify="between" wrap="wrap" gap="4">
        <div className="space-y-2">
          <Heading size="6" className="font-sans tracking-tight text-slate-950">
            Ma tran chuc vu
          </Heading>
          <Text size="2" className="block text-slate-500">
            He thong dang nap {mockRoles.length} role van hanh trong nen tang.
          </Text>
        </div>
        <Button size="3" color="cyan" className="cursor-pointer rounded-xl font-bold">
          <PlusIcon width="18" height="18" />
          Tao quy tac moi
        </Button>
      </Flex>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockRoles.map((role) => {
          const tone = levelTone[role.level] || levelTone.user;

          return (
            <div key={role.id} className="overflow-hidden rounded-[28px] bg-white/82 backdrop-blur-xl">
              <div className={`h-1.5 w-full ${tone.accent}`} />

              <Flex direction="column" gap="6" className="h-full p-7">
                <Flex align="start" justify="between" gap="4">
                  <Flex align="center" gap="4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tone.bg} ${tone.icon}`}>
                      <IdCardIcon width="24" height="24" />
                    </div>
                    <div>
                      <Text as="p" size="4" weight="bold" className="block tracking-tight text-slate-950">
                        {role.name}
                      </Text>
                      <Text as="p" size="1" className="mt-1 block font-bold uppercase tracking-[0.2em] text-slate-400">
                        {role.id}
                      </Text>
                    </div>
                  </Flex>
                  <Badge color={role.status === "active" ? "green" : "gray"} variant="soft" radius="full" className="px-3 py-1">
                    {role.status}
                  </Badge>
                </Flex>

                <div className="space-y-4 rounded-[24px] bg-slate-50/90 p-5">
                  <Text size="1" weight="bold" className="block uppercase tracking-[0.16em] text-slate-400">
                    Danh sach quyen
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm) => (
                      <div key={perm} className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                        {perm}
                      </div>
                    ))}
                  </div>
                </div>

                <Flex align="center" justify="between" className="mt-auto pt-1">
                  <Flex align="center" gap="2" className="rounded-xl bg-slate-50 px-3 py-1.5 text-slate-600">
                    <PersonIcon width="14" height="14" className="text-slate-400" />
                    <Text size="2" weight="bold" className="text-slate-700">
                      {role.usersCount} <span className="font-normal text-slate-500">tai khoan</span>
                    </Text>
                  </Flex>
                  <Button variant="ghost" size="2" color="gray" className="cursor-pointer font-semibold hover:text-cyan-600">
                    Thiet lap
                  </Button>
                </Flex>
              </Flex>
            </div>
          );
        })}
      </div>
    </div>
  );
}
