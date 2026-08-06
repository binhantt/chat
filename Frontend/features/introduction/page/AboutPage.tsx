"use client";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import { AboutForm } from "../components/AboutForm";
import { useRef, useState } from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { getCsrfHeaders } from "@/lib/csrf";

export function AboutPage() {
  const { user, updateUser } = useAuth();
  const initials = getInitials(user?.fullName || user?.email);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      window.alert("File anh khong duoc qua 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      window.alert("Chi chap nhan file anh: JPEG, PNG, WebP, GIF");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/v1/upload/avatar", {
        method: "POST",
        credentials: "include",
        headers: {
          ...getCsrfHeaders(),
          // No Content-Type — let browser set multipart boundary
        } as Record<string, string>,
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => null);
        throw new Error(err?.message || "Tai anh that bai");
      }

      const data = await uploadRes.json();
      await updateUser({ avatarUrl: data.avatarUrl });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Co loi xay ra");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Box style={{ background: "var(--bg-primary)", minHeight: "100%", padding: "28px clamp(16px, 2.2vw, 32px)" }}>
      <Flex direction="column" gap="5" style={{ margin: "0 auto", maxWidth: 640, width: "100%" }}>
        {/* Card */}
        <Box style={{ background: "var(--chat-surface)", borderRadius: 16, padding: 28 }}>
          <Flex direction="column" gap="5">
            {/* Avatar + name row */}
            <Flex align="center" gap="4">
              <Box style={{ position: "relative" }}>
                <Box
                  onClick={handleAvatarClick}
                  style={{
                    cursor: uploading ? "wait" : "pointer",
                    position: "relative",
                    borderRadius: "50%",
                    lineHeight: 0,
                  }}
                  title={uploading ? "Dang tai anh..." : "Thay doi anh dai dien"}
                >
                  <AvatarWithVipBadge
                    fallback={initials}
                    radius="full"
                    size="5"
                    src={user?.avatarUrl || undefined}
                    badge={user?.badge}
                    style={{
                      background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                      color: "#FFFFFF",
                      boxShadow: "0 4px 12px rgba(75, 46, 131, 0.12)",
                      transition: "opacity 0.2s",
                      opacity: uploading ? 0.6 : 1,
                    }}
                  />
                  {/* Upload overlay */}
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.4)",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      color: "#FFFFFF",
                    }}
                    className="avatar-upload-overlay"
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
                  >
                    {uploading ? (
                      <Box
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#FFFFFF",
                          animation: "spin 0.6s linear infinite",
                        }}
                      />
                    ) : (
                      <Pencil1Icon width={22} height={22} />
                    )}
                  </Flex>
                </Box>
              </Box>
              <Box>
                <Heading as="h1" size="5" style={{ color: "var(--chat-text)", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}>
                  {user?.fullName || "Hoàn thiện hồ sơ"}
                </Heading>
                <Text as="p" size="2" style={{ color: "var(--chat-muted)", marginTop: 1 }}>
                  {user?.email || "Đăng nhập để đồng bộ thông tin"}
                </Text>
              </Box>
            </Flex>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Description */}
            <Text size="2" style={{ color: "var(--chat-muted)", lineHeight: 1.6, margin: 0 }}>
              Cập nhật thông tin cơ bản để người khác hiểu bạn hơn trước khi bắt đầu trò chuyện.
            </Text>

            {/* Divider */}
            <Box style={{ height: 1, background: "var(--chat-border)", width: "100%" }} />

            {/* Form */}
            <AboutForm />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

function getInitials(value?: string | null) {
  if (!value) return "U";
  return value.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
