import { Heading, Text } from "@radix-ui/themes";
import { IdCardIcon, UpdateIcon } from "@radix-ui/react-icons";
import type { AdminUserRecord } from "@/lib/admin-users";

export function UserProfileActions({ user }: { user: AdminUserRecord }) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-white">
      <div className="flex-1 space-y-6 p-6 lg:p-8">
        <Heading size="5" className="font-sans tracking-tight text-slate-950">
          Hanh dong de xuat
        </Heading>

        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-5 transition-colors hover:bg-slate-100/60 max-sm:flex-col">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <IdCardIcon width="18" height="18" />
            </div>
            <div className="mt-1 sm:mt-0">
              <Text size="2" weight="bold" className="block text-slate-950">
                Phan quyen noi bo
              </Text>
              <Text as="p" size="2" className="mt-1.5 leading-relaxed text-slate-500">
                Mo modal `Cap nhat quyen` de doi role{" "}
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
                  {user.role}
                </span>{" "}
                va dieu chinh trang thai truy cap cho user nay.
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-5 transition-colors hover:bg-slate-100/60 max-sm:flex-col">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <UpdateIcon width="18" height="18" />
            </div>
            <div className="mt-1 sm:mt-0">
              <Text size="2" weight="bold" className="block text-slate-950">
                Session hygiene
              </Text>
              <Text as="p" size="2" className="mt-1.5 leading-relaxed text-slate-500">
                Neu tai khoan dang bi nghi ngo, co the khoa truy cap ma khong can
                xoa du lieu user trong database.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
