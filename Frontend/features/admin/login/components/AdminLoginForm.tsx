"use client";

import { Button, Callout, Flex, Text, TextField } from "@radix-ui/themes";
import { EnvelopeClosedIcon, ExclamationTriangleIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { useAdminLoginStore } from "../store/useAdminLoginStore";

export function AdminLoginForm() {
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
          <Text size="2" weight="medium" style={{ color: authTheme.text }}>
            Email quản trị
          </Text>
          <TextField.Root
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
            style={inputStyle}
            type="email"
            value={email}
          >
            <TextField.Slot>
              <EnvelopeClosedIcon />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" weight="medium" style={{ color: authTheme.text }}>
            Mật khẩu
          </Text>
          <TextField.Root
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            required
            style={inputStyle}
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
          style={{
            background: authTheme.control,
            borderRadius: 8,
            color: "#FFFFFF",
            minHeight: 44,
            width: "100%",
          }}
        >
          {isSubmitting ? "Đang xác thực..." : "Đăng nhập quản trị"}
        </Button>
      </Flex>
    </form>
  );
}

const inputStyle = {
  background: "#FFFFFF",
  border: `1px solid ${authTheme.line}`,
  borderRadius: 8,
  color: authTheme.text,
} as const;
