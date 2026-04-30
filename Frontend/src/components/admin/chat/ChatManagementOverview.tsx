"use client";

import { Badge, Flex, Heading, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, LightningBoltIcon } from "@radix-ui/react-icons";

export function ChatManagementOverview() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white/88 backdrop-blur-xl">
      <div className="grid gap-6 p-8 lg:grid-cols-[minmax(0,1.25fr)_22rem] lg:p-10">
        <div className="space-y-5">
          <Badge color="cyan" size="2" variant="soft" radius="full" className="px-3">
            Chat management
          </Badge>

          <div className="space-y-3">
            <Heading size="8" className="max-w-3xl font-sans tracking-tight text-slate-950">
              Quan ly phien tro chuyen theo thoi gian thuc.
            </Heading>
            <Text size="3" className="block max-w-2xl leading-8 text-slate-600">
              Giam sat toan bo phien chat dang mo, kenh xu ly va muc do uu tien de dieu phoi AI, support va escalation ro rang hon.
            </Text>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <Text size="1" className="block uppercase tracking-[0.16em] text-slate-400">
                Active
              </Text>
              <Text as="p" size="5" weight="bold" className="mt-2 text-slate-950">
                02
              </Text>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <Text size="1" className="block uppercase tracking-[0.16em] text-slate-400">
                Waiting
              </Text>
              <Text as="p" size="5" weight="bold" className="mt-2 text-slate-950">
                01
              </Text>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <Text size="1" className="block uppercase tracking-[0.16em] text-slate-400">
                Escalated
              </Text>
              <Text as="p" size="5" weight="bold" className="mt-2 text-slate-950">
                01
              </Text>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[24px] bg-slate-50 p-6">
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-cyan-700">
              <ChatBubbleIcon width="24" height="24" />
            </div>
            <div className="space-y-2">
              <Text size="2" weight="bold" className="uppercase tracking-[0.18em] text-slate-400">
                Routing state
              </Text>
              <Text as="p" size="4" weight="bold" className="text-slate-950">
                Hybrid support lane
              </Text>
              <Text size="2" className="leading-7 text-slate-600">
                Ket hop AI lane, human support va escalation de dam bao khong bo sot phien can xu ly thu cong.
              </Text>
            </div>
          </div>

          <Flex align="center" justify="between" className="mt-8 rounded-2xl bg-white px-4 py-4">
            <div>
              <Text size="1" className="uppercase tracking-[0.16em] text-slate-400">
                Throughput
              </Text>
              <Text as="p" size="3" weight="bold" className="mt-1 text-slate-950">
                91% auto-resolve
              </Text>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
              <LightningBoltIcon width="18" height="18" />
            </div>
          </Flex>
        </div>
      </div>
    </div>
  );
}
