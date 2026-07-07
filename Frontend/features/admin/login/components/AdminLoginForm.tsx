"use client";

import { Button, Callout, Flex, Text, TextField } from "@radix-ui/themes";
import { EnvelopeClosedIcon, ExclamationTriangleIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { useAdminLoginStore } from "../store/useAdminLoginStore";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminLoginForm() {
  const s = useAdminStyles();
  const email = useAdminLoginStore((state) => state.email);
  const error = useAdminLoginStore((state) => state.error);
  const isSubmitting = useAdminLoginStore((state) => state.isSubmitting);
  const password = useAdminLoginStore((state) => state.password);
  const setEmail = useAdminLoginStore((state) => state.setEmail);
  const setPassword = useAdminLoginStore((state) => state.setPassword);
  const { login } = useAdminLogin();

  return (
    <form onSubmit={login}>
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium" className={s.loginForm.fieldLabel}>
            Email quản trị
          </Text>
          <TextField.Root
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
            className={s.loginForm.inputField}
            type="email"
            value={email}
          >
            <TextField.Slot>
              <EnvelopeClosedIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" weight="medium" className={s.loginForm.fieldLabel}>
            Mật khẩu
          </Text>
          <TextField.Root
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            required
            className={s.loginForm.inputField}
            type="password"
            value={password}
          >
            <TextField.Slot>
              <LockClosedIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {error && (
          <Callout.Root color="red" size="1">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        <Button
          disabled={isSubmitting}
          size="3"
          type="submit"
          className={s.loginForm.submitButton}
        >
          {isSubmitting ? "Đang xác thực..." : "Đăng nhập quản trị"}
        </Button>
      </Flex>
    </form>
  );
}
