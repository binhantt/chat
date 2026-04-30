"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  Flex,
  Select,
  Switch,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { AdminUserRecord } from "@/lib/admin-users";

export function UserAccessDialog({ user }: { user: AdminUserRecord }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"admin" | "user">(user.role);
  const [isActive, setIsActive] = useState(user.status === "active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/access`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          role,
          isActive,
        }),
      });

      if (!response.ok) {
        const payload = (await safeParseJson(response)) as { message?: string } | null;
        throw new Error(payload?.message || `Cap nhat quyen that bai: ${response.status}`);
      }

      setOpen(false);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Khong the cap nhat quyen. Vui long thu lai.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button color="cyan">Cap nhat quyen</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="28rem">
        <Dialog.Title>Cap nhat quyen truy cap</Dialog.Title>
        <Dialog.Description size="2">
          Dieu chinh role va trang thai cho tai khoan nay trong khu quan tri.
        </Dialog.Description>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Text as="label" size="2" weight="medium" className="text-slate-700">
              Role
            </Text>
            <Select.Root value={role} onValueChange={(value) => setRole(value as "admin" | "user")}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="admin">Admin</Select.Item>
                <Select.Item value="user">User</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          <Flex align="center" justify="between" gap="4" className="rounded-2xl bg-slate-50 p-4">
            <div className="space-y-1">
              <Text size="2" weight="medium" className="text-slate-900">
                Trang thai tai khoan
              </Text>
              <Text size="2" className="text-slate-600">
                Tat di neu can khoa quyen truy cap cua user.
              </Text>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </Flex>

          {error ? (
            <Text as="p" size="2" className="text-red-600">
              {error}
            </Text>
          ) : null}

          <Flex justify="end" gap="3">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">
                Huy
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Dang cap nhat..." : "Luu thay doi"}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

async function safeParseJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}
