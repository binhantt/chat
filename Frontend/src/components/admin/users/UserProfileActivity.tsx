import { Heading, Text } from "@radix-ui/themes";
import { TimerIcon, ActivityLogIcon } from "@radix-ui/react-icons";
import type { AdminUserRecord } from "@/lib/admin-users";

export function UserProfileActivity({ user }: { user: AdminUserRecord }) {
  return (
    <div className="rounded-3xl bg-white h-full flex flex-col">
      <div className="space-y-6 p-6 lg:p-8 flex-1">
        <Heading size="5" className="text-slate-950 font-sans tracking-tight">
          Hoạt động gần đây
        </Heading>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-5 flex max-sm:flex-col gap-4 items-start transition-colors hover:bg-slate-100/60">
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white text-slate-600">
              <TimerIcon width="18" height="18" />
            </div>
            <div className="mt-1 sm:mt-0">
              <Text size="2" weight="bold" className="text-slate-950 block">
                Đăng nhập gần nhất
              </Text>
              <Text as="p" size="2" className="mt-1.5 leading-relaxed text-slate-500">
                Session cuối được ghi nhận tự động vào lúc <span className="font-semibold text-slate-700">{user.lastSeen}</span>. Route admin đã xác thực phiên đăng nhập an toàn, cookie hợp lệ.
              </Text>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 flex max-sm:flex-col gap-4 items-start transition-colors hover:bg-slate-100/60">
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white text-slate-600">
              <ActivityLogIcon width="18" height="18" />
            </div>
            <div className="mt-1 sm:mt-0">
              <Text size="2" weight="bold" className="text-slate-950 block">
                Hàng đợi công việc
              </Text>
              <Text as="p" size="2" className="mt-1.5 leading-relaxed text-slate-500">
                Tài khoản này hiện tại đang đảm nhận <span className="font-semibold text-slate-700">{user.openCases} hạng mục</span> cần theo dõi và xử lý trực tiếp trong luồng vận hành nền tảng.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
