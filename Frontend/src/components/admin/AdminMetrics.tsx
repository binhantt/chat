"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Text } from "@radix-ui/themes";
import { useDashboardData } from "@/hooks/useDashboardData";

const trendTone = {
  up: "bg-emerald-50 text-emerald-700",
  down: "bg-amber-50 text-amber-700",
  neutral: "bg-slate-100 text-slate-700",
} as const;

export function AdminMetrics() {
  const { metrics, loading } = useDashboardData();

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-[24px] bg-white/70" />
        ))}
      </>
    );
  }

  return (
    <>
      {metrics.map((item) => (
        <div key={item.label} className="overflow-hidden rounded-[24px] bg-white/88 backdrop-blur-xl">
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <Text size="2" className="font-medium text-slate-500">
                {item.label}
              </Text>
              <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendTone[item.trend]}`}>
                {item.trend === "up" ? <ArrowUpIcon width="12" height="12" /> : null}
                {item.trend === "down" ? <ArrowDownIcon width="12" height="12" /> : null}
                {item.trend === "neutral" ? "Stable" : "Update"}
              </div>
            </div>

            <Text as="p" className="text-4xl font-semibold tracking-tight text-slate-950">
              {item.value}
            </Text>

            <Text size="2" className="font-medium text-cyan-700">
              {item.detail}
            </Text>
          </div>
        </div>
      ))}
    </>
  );
}
