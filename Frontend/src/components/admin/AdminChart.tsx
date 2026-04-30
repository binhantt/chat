"use client";

import { Flex, Heading, Text } from "@radix-ui/themes";
import { useDashboardData } from "@/hooks/useDashboardData";

export function AdminChart() {
  const { chartData, loading } = useDashboardData();

  if (loading) return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;

  return (
    <section className="overflow-hidden rounded-[28px] bg-white/88 backdrop-blur-xl">
      <div className="space-y-6 p-6 lg:p-7">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <Text size="2" weight="medium" className="uppercase tracking-[0.18em] text-slate-400">
              Analytics
            </Text>
            <Heading size="5" className="text-slate-950">
              Luu luong hoi thoai 7 ngay qua
            </Heading>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Weekly
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50 px-5 py-6">
          <Flex align="end" justify="between" gap="3" className="h-64 w-full">
            {chartData.map((data, index) => (
              <Flex key={index} direction="column" align="center" justify="end" gap="3" className="h-full flex-1">
                <Text size="1" className="text-slate-400">
                  {data.chats}
                </Text>
                <div
                  className="w-full max-w-[2.75rem] rounded-t-[14px] bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-300 transition-opacity hover:opacity-85"
                  style={{ height: data.height }}
                  title={`${data.chats} hoi thoai`}
                />
                <Text size="1" className="font-semibold text-slate-500">
                  {data.day}
                </Text>
              </Flex>
            ))}
          </Flex>
        </div>
      </div>
    </section>
  );
}
