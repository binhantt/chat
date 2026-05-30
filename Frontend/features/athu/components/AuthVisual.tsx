"use client";

import { Badge, Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  LightningBoltIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { authTheme } from "../styles/authTheme";

const features = [
  {
    description: "Vào phòng trò chuyện nhanh.",
    icon: LightningBoltIcon,
    title: "Đăng nhập Google",
  },
  {
    description: "Kết nối đúng người.",
    icon: MagnifyingGlassIcon,
    title: "Ghép đôi thông minh",
  },
  {
    description: "Bảo vệ cộng đồng.",
    icon: LockClosedIcon,
    title: "Báo cáo an toàn",
  },
];

export function AuthVisual() {
  return (
    <Box
      display={{ initial: "none", md: "block" }}
      width="640px"
      style={{
        flexShrink: 1,
        maxHeight: "calc(100dvh - 56px)",
        position: "relative",
      }}
    >
      <Box
        style={{
          background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.10), rgba(34, 211, 238, 0.06))",
          border: `1px solid ${authTheme.line}`,
          borderRadius: 8,
          height: 150,
          left: 26,
          position: "absolute",
          top: 78,
          transform: "rotate(-5deg)",
          width: 310,
          zIndex: 0,
        }}
      />
      <Box
        style={{
          background:
            "linear-gradient(180deg, rgba(59, 130, 246, 0.16), rgba(255, 255, 255, 0))",
          borderRadius: 8,
          bottom: 10,
          height: 180,
          position: "absolute",
          right: 42,
          transform: "rotate(12deg)",
          width: 72,
          zIndex: 0,
        }}
      />

      <Flex
        direction="column"
        gap="4"
        justify="center"
        style={{
          maxWidth: 600,
          minHeight: "calc(100dvh - 116px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Badge
          size="3"
          style={{
            alignSelf: "flex-start",
            background: "rgba(59, 130, 246, 0.12)",
            border: `1px solid ${authTheme.line}`,
            color: authTheme.text,
          }}
        >
          <Flex align="center" gap="2">
            <ChatBubbleIcon />
            <Text size="2" weight="bold">
              Website kết nối mỗi ngày
            </Text>
          </Flex>
        </Badge>
        <Heading
          as="h1"
          size="7"
          style={{
            color: authTheme.text,
            letterSpacing: 0,
            lineHeight: 1.08,
            maxWidth: 560,
          }}
        >
          Trò chuyện gọn gàng, riêng tư và an toàn hơn.
        </Heading>
        <Text
          as="p"
          size="3"
          style={{
            color: authTheme.muted,
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 560,
          }}
        >
          Người Lạ giúp bạn đăng nhập nhanh, tạo hồ sơ, tìm người phù hợp và
          bắt đầu câu chuyện trong không gian gọn gàng, tập trung vào điều quan trọng.
        </Text>

        <Flex
          align="center"
          gap="3"
          style={{
            background: "rgba(255, 255, 255, 0.62)",
            border: `1px solid ${authTheme.line}`,
            borderRadius: 8,
            boxShadow: "0 18px 40px rgba(59, 130, 246, 0.10)",
            maxWidth: 560,
            padding: 12,
          }}
        >
          <Flex
            align="center"
            justify="center"
            style={{
              background: authTheme.control,
              borderRadius: 8,
              color: "#FFFFFF",
              height: 42,
              width: 42,
            }}
          >
            <RocketIcon height={20} width={20} />
          </Flex>
          <Box>
            <Text as="div" size="3" weight="bold" style={{ color: authTheme.text }}>
              Bắt đầu chỉ trong một lần bấm
            </Text>
            <Text as="div" size="2" style={{ color: authTheme.muted }}>
              Đăng nhập, tìm người phù hợp và vào phòng trò chuyện nhanh gọn.
            </Text>
          </Box>
        </Flex>

        <Grid columns="3" gap="3" style={{ maxWidth: 560, width: "100%" }}>
          {features.map(({ description, icon: Icon, title }, index) => (
            <Box
              key={title}
              style={{
                background: authTheme.panelSoft,
                border: `1px solid ${authTheme.line}`,
                borderRadius: 8,
                boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
                minHeight: 100,
                padding: 12,
              }}
            >
              <Flex align="start" direction="column" gap="3">
                <Box
                  style={{
                    alignItems: "center",
                    background:
                      index === 1
                        ? authTheme.cyan
                        : index === 2
                          ? authTheme.gold
                          : authTheme.control,
                    borderRadius: 8,
                    color:
                      index === 2 ? authTheme.background : "#FFFFFF",
                    display: "flex",
                    height: 38,
                    justifyContent: "center",
                    width: 38,
                  }}
                >
                  <Icon height={18} width={18} />
                </Box>
                <Box>
                  <Text
                    as="div"
                    size="2"
                    weight="bold"
                    style={{ color: authTheme.text }}
                  >
                    {title}
                  </Text>
                  <Text as="div" size="1" style={{ color: authTheme.muted, lineHeight: 1.45 }}>
                    {description}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
}
