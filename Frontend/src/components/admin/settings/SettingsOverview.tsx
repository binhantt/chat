"use client";

import { Badge, Heading, Text } from "@radix-ui/themes";

export function SettingsOverview() {
  return (
    <div className="rounded-3xl bg-white">
      <div className="space-y-4 p-8 lg:p-10">
        <Badge color="cyan" size="2" variant="soft" radius="full" className="px-3">
          System Configuration
        </Badge>
        <div className="space-y-2">
          <Heading size="8" className="max-w-3xl text-slate-950 font-sans tracking-tight">
            Cài đặt Hệ Thống.
          </Heading>
          <Text size="3" className="max-w-2xl leading-7 text-slate-600 block">
            Cấu hình các tham số môi trường, tích hợp API Keys, và tinh chỉnh các 
            cơ chế bảo mật cốt lõi dành riêng cho nền tảng chat.
          </Text>
        </div>
      </div>
    </div>
  );
}
