"use client";

import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon, LightningBoltIcon, LockClosedIcon, HeartFilledIcon } from "@radix-ui/react-icons";

const features = [
  {
    description: "Vào phòng trò chuyện nhanh.",
    icon: LightningBoltIcon,
    title: "Đăng nhập Google",
  },
  {
    description: "Kết nối đúng người.",
    icon: HeartFilledIcon,
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
      style={{ width: 480, flexShrink: 0 }}
    >
      <Flex
        direction="column"
        gap="5"
        justify="center"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Badge */}
        <Badge
          size="3"
          style={{
            alignSelf: "flex-start",
            background: "var(--auth-soft-control)",
            border: "1px solid var(--auth-line)",
            borderRadius: 999,
            color: "var(--auth-control)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 16px",
          }}
        >
          <ChatBubbleIcon width={14} height={14} />
          <Text size="2" weight="bold" style={{ fontFamily: "var(--font-body)", letterSpacing: "0.01em" }}>
            Website kết nối mỗi ngày
          </Text>
        </Badge>

        {/* Title */}
        <h1
          style={{
            color: "var(--auth-text)",
            fontFamily: "var(--font-heading)",
            fontSize: 38,
            fontWeight: 700,
            lineHeight: 1.15,
            margin: 0,
            maxWidth: 460,
          }}
        >
          Trò chuyện gọn gàng,<br />riêng tư và an toàn hơn.
        </h1>

        {/* Description */}
        <Text
          as="p"
          size="3"
          style={{
            color: "var(--auth-muted)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.7,
            margin: 0,
            maxWidth: 440,
          }}
        >
          Người Lạ giúp bạn đăng nhập nhanh, tạo hồ sơ, tìm người phù hợp và
          bắt đầu câu chuyện trong không gian gọn gàng, tập trung vào điều quan trọng.
        </Text>

        {/* Feature cards */}
        <Flex gap="3" style={{ maxWidth: 480, width: "100%" }}>
          {features.map(({ description, icon: Icon, title }) => (
            <Card
              key={title}
              size="1"
              variant="surface"
              style={{
                flex: 1,
                border: "1px solid var(--auth-line)",
              }}
            >
              <Flex align="start" direction="column" gap="2">
                <Box
                  style={{
                    alignItems: "center",
                    background: "var(--auth-soft-control)",
                    borderRadius: 10,
                    color: "var(--auth-control)",
                    display: "flex",
                    height: 36,
                    justifyContent: "center",
                    width: 36,
                  }}
                >
                  <Icon height={16} width={16} />
                </Box>
                <Box>
                  <Text
                    as="div"
                    size="2"
                    weight="bold"
                    style={{ color: "var(--auth-text)", fontFamily: "var(--font-body)" }}
                  >
                    {title}
                  </Text>
                  <Text
                    as="div"
                    size="1"
                    style={{
                      color: "var(--auth-muted)",
                      fontFamily: "var(--font-body)",
                      lineHeight: 1.4,
                      marginTop: 2,
                    }}
                  >
                    {description}
                  </Text>
                </Box>
              </Flex>
            </Card>
          ))}
        </Flex>

        {/* Decorative highlight line */}
        <Box
          style={{
            background: "linear-gradient(90deg, transparent, var(--auth-line), transparent)",
            height: 1,
            width: "60%",
          }}
        />
      </Flex>
    </Box>
  );
}
