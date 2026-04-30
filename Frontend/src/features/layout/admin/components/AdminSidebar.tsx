"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  DashboardIcon,
  ExitIcon,
  GearIcon,
  LockClosedIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/ui";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { name: "Tong quan", href: "/admin", icon: DashboardIcon },
  { name: "Quan ly chat", href: "/admin/chat", icon: ChatBubbleIcon },
  { name: "Nguoi dung", href: "/admin/users", icon: PersonIcon },
  { name: "Phan quyen", href: "/admin/roles", icon: LockClosedIcon },
  { name: "Cai dat", href: "/admin/settings", icon: GearIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Box className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-hidden border-0 bg-white/72 outline-none ring-0 backdrop-blur-xl lg:flex lg:flex-col">
      <Flex align="center" className="h-[4.5rem] shrink-0 px-6">
        <BrandMark />
      </Flex>

      <Box className="flex-1 overflow-y-auto px-4 py-6">
        <Text
          size="1"
          weight="bold"
          className="mb-4 block px-3 uppercase tracking-[0.18em] text-slate-400"
        >
          Menu quan tri
        </Text>

        <Flex direction="column" gap="1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href} className="block w-full outline-none">
                <div
                  className={`group flex h-[3.25rem] w-full cursor-pointer items-center justify-between rounded-xl px-3 transition-all ${
                    isActive
                      ? "bg-white text-cyan-900 shadow-[0_14px_30px_-20px_rgba(14,165,233,0.65)]"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                  }`}
                >
                  <Flex align="center" gap="3" className="w-full">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-cyan-50 text-cyan-600"
                          : "bg-slate-100/80 text-slate-500 group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm"
                      }`}
                    >
                      <Icon width="16" height="16" />
                    </div>
                    <Text size="2" weight="medium">
                      {item.name}
                    </Text>
                  </Flex>
                  {isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" /> : null}
                </div>
              </Link>
            );
          })}
        </Flex>
      </Box>

      <div className="mt-auto p-4 shrink-0">
        <form action={logoutAction} className="block w-full">
          <button
            type="submit"
            className="group flex h-12 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-red-600 transition-all outline-none hover:bg-white/80"
          >
            <Flex align="center" gap="3" className="w-full">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors group-hover:bg-white group-hover:shadow-sm">
                <ExitIcon width="16" height="16" />
              </div>
              <Text size="2" weight="medium">
                Dang xuat phien
              </Text>
            </Flex>
          </button>
        </form>
      </div>
    </Box>
  );
}
