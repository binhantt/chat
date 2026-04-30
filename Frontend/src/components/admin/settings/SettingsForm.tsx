"use client";

import { Button, Flex, Heading, Switch, Text, TextField } from "@radix-ui/themes";
import { 
  BlendingModeIcon, 
  ExclamationTriangleIcon, 
  LockClosedIcon, 
  RocketIcon 
} from "@radix-ui/react-icons";

export function SettingsForm() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      
      {/* Cấu Hình Chung */}
      <div className="rounded-3xl bg-white p-8 lg:p-10 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] duration-300">
        <Flex align="center" gap="4" className="mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BlendingModeIcon width="26" height="26" />
          </div>
          <div>
            <Heading size="5" className="text-slate-950 font-sans tracking-tight">Cấu hình chung</Heading>
            <Text size="2" className="text-slate-500">Định danh hiển thị tới toàn bộ khách hàng</Text>
          </div>
        </Flex>

        <div className="space-y-6 flex-1">
          <div>
            <Text as="label" size="2" weight="bold" className="mb-2 block text-slate-700">Tên Cổng Portal</Text>
            <TextField.Root size="3" defaultValue="Chat vs Người Lạ 2" variant="surface" className="rounded-xl outline-none" />
          </div>
          <div>
            <Text as="label" size="2" weight="bold" className="mb-2 block text-slate-700">Hộp thư hỗ trợ</Text>
            <TextField.Root size="3" defaultValue="hotro@nguoila.local" variant="surface" className="rounded-xl outline-none" />
          </div>
          <div>
            <Text as="label" size="2" weight="bold" className="mb-2 block text-slate-700">Ngôn ngữ gốc</Text>
            <TextField.Root size="3" defaultValue="Tiếng Việt mặc định" variant="surface" disabled className="rounded-xl opacity-60" />
          </div>
        </div>

        <div className="pt-8">
          <Button size="4" variant="soft" color="indigo" className="w-full font-bold cursor-pointer">Lưu cấu hình nhận diện</Button>
        </div>
      </div>

      {/* Trọng Yếu & Bảo Mật */}
      <div className="rounded-3xl bg-white p-8 lg:p-10 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] duration-300">
        <Flex align="center" gap="4" className="mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LockClosedIcon width="26" height="26" />
          </div>
          <div>
            <Heading size="5" className="text-slate-950 font-sans tracking-tight">Trọng yếu & Bảo mật</Heading>
            <Text size="2" className="text-slate-500">Tùy biến luồng vận hành cốt lõi</Text>
          </div>
        </Flex>

        <div className="space-y-7 flex-1">
          <Flex align="center" justify="between" gap="4" className="bg-slate-50 p-4 rounded-2xl">
            <div>
              <Text as="div" size="3" weight="bold" className="text-slate-900">Tính năng Khách Ẩn Danh</Text>
              <Text as="div" size="2" className="text-slate-500 mt-1 max-w-[250px] leading-snug">
                Bỏ qua xác thực, người dùng không cần đăng nhập vẫn được ghép cặp.
              </Text>
            </div>
            <Switch size="3" defaultChecked color="cyan" />
          </Flex>

          <Flex align="center" justify="between" gap="4" className="bg-slate-50 p-4 rounded-2xl">
            <div>
              <Text as="div" size="3" weight="bold" className="text-slate-900">Lưu lượng Log Data</Text>
              <Text as="div" size="2" className="text-slate-500 mt-1 max-w-[250px] leading-snug">
                Cho phép ghi mảng hội thoại vào Database riêng làm data training.
              </Text>
            </div>
            <Switch size="3" defaultChecked color="cyan" />
          </Flex>

          <Flex align="center" justify="between" gap="4" className="bg-slate-50 p-4 rounded-2xl border-l-[4px] border-amber-300">
            <div>
              <Text as="div" size="3" weight="bold" className="text-amber-900">Bật Chế Độ Bảo Trì</Text>
              <Text as="div" size="2" className="text-amber-700/70 mt-1 max-w-[250px] leading-snug">
                Đóng băng toàn bộ Request giao tiếp mới và treo bảng thông báo.
              </Text>
            </div>
            <Switch size="3" color="amber" />
          </Flex>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl bg-rose-50 p-8 lg:p-10 xl:col-span-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 blur-xl group-hover:opacity-30 transition-opacity">
          <ExclamationTriangleIcon width="150" height="150" className="text-rose-600" />
        </div>
        
        <Flex align="center" gap="4" className="mb-6 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
            <RocketIcon width="24" height="24" />
          </div>
          <div>
            <Heading size="5" className="text-rose-700 font-sans tracking-tight">Khu Vực Nguy Hiểm</Heading>
          </div>
        </Flex>

        <Flex align="center" justify="between" wrap="wrap" gap="6" className="relative z-10">
          <div>
            <Text as="div" size="4" weight="bold" className="text-rose-950">Giải phóng 100% Cache Bộ Nhớ</Text>
            <Text as="div" size="2" className="text-rose-700/80 mt-1 max-w-lg">
              Hành động này sẽ thực thi Flush toàn bộ cụm Redis cluster, buộc load lại Data từ Database. Có thể gây giật lag ở vài giây đầu.
            </Text>
          </div>
          <Button size="4" color="ruby" className="px-8 cursor-pointer font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors">
            Flush System Cache
          </Button>
        </Flex>
      </div>

    </div>
  );
}
