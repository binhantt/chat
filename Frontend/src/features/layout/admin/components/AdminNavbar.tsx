"use client";

import {
  Avatar,
  Box,
  Button,
  DropdownMenu,
  Flex,
  Text,
} from "@radix-ui/themes";
import {
  BellIcon,
  CalendarIcon,
  GearIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";

export function AdminNavbar() {
  return (
    <Box className="fixed left-0 right-0 top-0 z-40 border-0 outline-none lg:left-72">
      <Flex
        align="center"
        justify="between"
        className="h-[4.5rem] border-0 bg-white/72 px-4 outline-none ring-0 backdrop-blur-xl lg:px-6"
      >
        <Flex align="center" gap="4">
          <Button variant="ghost" className="lg:hidden" color="gray">
            <HamburgerMenuIcon width="20" height="20" />
          </Button>
        </Flex>

        <Flex align="center" gap="3">
          <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-slate-600 md:flex">
            <CalendarIcon width="16" height="16" />
            <Text size="2">Session hom nay</Text>
          </div>

          <Button variant="ghost" color="gray" className="rounded-full">
            <BellIcon width="18" height="18" />
          </Button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="flex items-center gap-3 rounded-full bg-white px-2.5 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none">
                <Avatar fallback="A" size="2" radius="full" />
                <div className="hidden text-left sm:block">
                  <Text size="2" weight="medium" className="block text-slate-900">
                    Admin
                  </Text>
                  <Text size="1" className="block text-slate-500">
                    Internal access
                  </Text>
                </div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item>Ho so</DropdownMenu.Item>
              <DropdownMenu.Item>
                <Flex align="center" gap="2">
                  <GearIcon /> Cai dat
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </Flex>
    </Box>
  );
}
