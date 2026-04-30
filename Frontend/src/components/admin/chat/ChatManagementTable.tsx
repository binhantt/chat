"use client";

import { Avatar, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { mockChats } from "./mockChats";

const statusTone: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  waiting: "bg-amber-50 text-amber-700",
  resolved: "bg-slate-100 text-slate-600",
  escalated: "bg-rose-50 text-rose-700",
};

export function ChatManagementTable() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white/88 backdrop-blur-xl">
      <div className="space-y-6 p-8 lg:p-10">
        <Flex align="center" justify="between" gap="4" wrap="wrap">
          <div className="space-y-1">
            <Text size="2" weight="medium" className="uppercase tracking-[0.18em] text-slate-400">
              Live monitor
            </Text>
            <Heading size="5" className="font-sans tracking-tight text-slate-950">
              Luong tin nhan truc tiep
            </Heading>
            <Text size="2" className="text-slate-500">
              05 phien dang duoc theo doi trong bang dieu phoi.
            </Text>
          </div>

          <div className="min-w-[16rem]">
            <TextField.Root
              placeholder="Duyet ma ID, phan vung..."
              size="3"
              variant="soft"
              className="rounded-xl outline-none"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon width="16" height="16" />
              </TextField.Slot>
            </TextField.Root>
          </div>
        </Flex>

        <div className="overflow-x-auto rounded-[24px] bg-slate-50">
          <div className="min-w-[54rem]">
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(10rem,1fr)_minmax(8rem,0.7fr)_minmax(6rem,0.5fr)_minmax(7rem,0.6fr)] gap-4 bg-slate-100/60 px-8 py-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>Dinh danh</span>
              <span>Kenh xu ly</span>
              <span>Trang thai</span>
              <span>Tai trong</span>
              <span className="text-right">Cap nhat</span>
            </div>

            <div className="bg-transparent">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  className="grid grid-cols-[minmax(0,1.3fr)_minmax(10rem,1fr)_minmax(8rem,0.7fr)_minmax(6rem,0.5fr)_minmax(7rem,0.6fr)] items-center gap-4 px-8 py-5 transition-colors hover:bg-slate-100/40"
                >
                  <Flex align="center" gap="4" className="min-w-0">
                    <Avatar size="2" fallback={chat.user.charAt(0)} variant="soft" color="cyan" radius="full" />
                    <div>
                      <Text as="p" size="2" weight="bold" className="truncate tracking-tight text-slate-900">
                        {chat.user}
                      </Text>
                      <Text as="p" size="1" className="truncate font-medium text-slate-400">
                        {chat.id}
                      </Text>
                    </div>
                  </Flex>

                  <Text size="2" weight="bold" className="text-slate-700">
                    {chat.agent}
                  </Text>

                  <div>
                    <span className={`inline-flex rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${statusTone[chat.status]}`}>
                      {chat.status}
                    </span>
                  </div>

                  <Text size="2" weight="medium" className="font-mono text-slate-500">
                    {chat.messages} req
                  </Text>

                  <Text size="2" className="whitespace-nowrap text-right font-medium text-slate-400">
                    {chat.lastActive}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
