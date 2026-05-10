"use client";

import { Flex, Text, Card, TextField, Button, Heading, Separator } from "@radix-ui/themes";
import { Logo } from "../components/Logo";
import { LeftDecor } from "../components/LeftDecor";
import { RightDecor } from "../components/RightDecor";
import { useState } from "react";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = "/admin";
      } else {
        setError("Email hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      style={{
        overflow: "hidden",
        background: "linear-gradient(135deg, var(--gray-2) 0%, var(--slate-2) 50%, var(--zinc-2) 100%)"
      }}
    >
      <LeftDecor />
      <RightDecor />

      <Card size="3" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="4" align="center">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--indigo-3) 0%, var(--violet-3) 100%)",
                boxShadow: "0 4px 12px var(--indigo-6)"
              }}
            >
              <Logo size={48} />
            </Flex>
            <Heading size="7" color="gray" highContrast>
              Admin Panel
            </Heading>
            <Flex align="center" gap="2">
              <Text size="2" color="violet" weight="medium">Quản trị hệ thống</Text>
            </Flex>
          </Flex>

          <Separator size="4" />

          <form onSubmit={handleLogin}>
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">Email quản trị</Text>
                <TextField.Root
                  type="email"
                  placeholder="admin@chatapp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ background: "var(--gray-1)" }}
                />
              </Flex>

              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Text size="2" weight="medium" color="gray">Mật khẩu</Text>
                  <Text
                    size="1"
                    color="indigo"
                    style={{ cursor: "pointer" }}
                    onClick={() => alert("Liên hệ quản trị viên cao cấp để đặt lại mật khẩu")}
                  >
                    Quên mật khẩu?
                  </Text>
                </Flex>
                <TextField.Root
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ background: "var(--gray-1)" }}
                />
              </Flex>

              {error && (
                <Text size="2" color="red" align="center">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                size="3"
                style={{ width: "100%", height: 44 }}
                disabled={loading}
              >
                {loading ? "Đang xác thực..." : "Đăng nhập quản trị"}
              </Button>
            </Flex>
          </form>

          <Separator size="4" />

          <Flex direction="column" gap="2" align="center">
            <Text size="2" color="gray">
              Chỉ dành cho nhân viên được ủy quyền
            </Text>
            <Flex align="center" gap="1">
              <Text size="1" color="red">
                ⚠️
              </Text>
              <Text size="1" color="gray">
                Truy cập trái phép sẽ bị ghi log
              </Text>
            </Flex>
          </Flex>

          <Flex justify="center" align="center" gap="2">
            <Text size="2" color="gray">
              Quay lại trang{" "}
            </Text>
            <a href="/login" style={{ color: "var(--indigo-9)", textDecoration: "none" }}>
              người dùng
            </a>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
