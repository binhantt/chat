"use client";

import { Heading, Text } from "@radix-ui/themes";
import { useDashboardData } from "@/hooks/useDashboardData";

export function SystemHealth() {
  const { health, loading } = useDashboardData();

  if (loading) return <div className="h-72 animate-pulse rounded-[28px] bg-white/70" />;

  return (
    <section className="h-full overflow-hidden rounded-[28px] bg-white/88 backdrop-blur-xl">
      <div className="space-y-5 p-6">
        <div className="space-y-1">
          <Text size="2" weight="medium" className="uppercase tracking-[0.18em] text-slate-400">
            System health
          </Text>
          <Heading size="5" className="text-slate-950">
            Tinh trang thanh phan
          </Heading>
        </div>

        <div className="space-y-3">
          {health.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4">
              <div className="space-y-1">
                <Text size="2" weight="medium" className="text-slate-900">
                  {item.label}
                </Text>
                <Text size="1" className="text-slate-400">
                  Runtime check
                </Text>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-[22px] bg-slate-50 p-5">
          <Text size="2" weight="medium" className="mb-2 block text-slate-900">
            Nen tang
          </Text>
          <Text as="span" size="2" className="leading-6 text-slate-600">
            Dashboard dang su dung mock hook cho analytics va health checks de mo phong du lieu van hanh.
          </Text>
        </div>
      </div>
    </section>
  );
}
