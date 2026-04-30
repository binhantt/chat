"use client";

import { Badge, Flex, Heading, Text } from "@radix-ui/themes";
import { useDashboardData } from "@/hooks/useDashboardData";

export function AdminActivity() {
  const { activity, loading } = useDashboardData();

  if (loading) return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;

  return (
    <section className="h-full overflow-hidden rounded-[28px] bg-white/88 backdrop-blur-xl">
      <div className="space-y-5 p-6">
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <div className="space-y-1">
            <Text size="2" weight="medium" className="uppercase tracking-[0.18em] text-slate-400">
              Recent activity
            </Text>
            <Heading size="5" className="text-slate-950">
              Dien bien can luu y
            </Heading>
          </div>
          <Badge color="gray" variant="soft">
            Live feed
          </Badge>
        </Flex>

        <div className="space-y-3">
          {activity.map((item, index) => (
            <div key={item.title} className="rounded-[22px] bg-slate-50 px-4 py-4">
              <Flex align="start" gap="4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Flex align="center" justify="between" gap="3" wrap="wrap">
                    <Text size="3" weight="medium" className="text-slate-950">
                      {item.title}
                    </Text>
                    <Text size="1" className="whitespace-nowrap text-slate-400">
                      {item.time}
                    </Text>
                  </Flex>
                  <Text size="2" className="leading-6 text-slate-600">
                    {item.detail}
                  </Text>
                </div>
              </Flex>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
