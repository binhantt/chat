"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  CheckIcon,
  EyeOpenIcon,
  LockClosedIcon,
  PersonIcon,
  RocketIcon,
  ExclamationTriangleIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";

const highlights = [
  {
    title: "Kết nối nhanh",
    description:
      "Tìm người trò chuyện phù hợp và bắt đầu cuộc hội thoại chỉ trong vài thao tác.",
    icon: ChatBubbleIcon,
    color: "var(--indigo-9)",
    background: "var(--indigo-3)",
  },
  {
    title: "Hồ sơ rõ ràng",
    description:
      "Người dùng có thể cập nhật thông tin cá nhân để tạo trải nghiệm trò chuyện tin cậy hơn.",
    icon: PersonIcon,
    color: "var(--green-9)",
    background: "var(--green-3)",
  },
  {
    title: "An toàn hơn",
    description:
      "Tích hợp báo cáo người dùng và quản trị nội dung để giữ cộng đồng văn minh.",
    icon: ExclamationTriangleIcon,
    color: "var(--amber-10)",
    background: "var(--amber-3)",
  },
];

const steps = [
  "Đăng nhập bằng tài khoản Google",
  "Cập nhật hồ sơ cá nhân",
  "Tìm người phù hợp và bắt đầu chat",
  "Báo cáo nội dung không phù hợp khi cần",
];

const stats = [
  { label: "Tính năng chính", value: "5+" },
  { label: "Khu vực quản trị", value: "Admin" },
  { label: "Trạng thái", value: "Beta" },
];

export function WebsiteIntroPage() {
  return (
    <Box
      style={{
        minHeight: "100%",
        background:
          "linear-gradient(180deg, var(--gray-1) 0%, var(--indigo-2) 100%)",
      }}
    >
      <Flex
        direction="column"
        gap="6"
        style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 18px 56px" }}
      >
        <Flex
          align={{ initial: "start", md: "center" }}
          justify="between"
          gap="5"
          direction={{ initial: "column", md: "row" }}
        >
          <Flex direction="column" gap="3" style={{ maxWidth: 650 }}>
            <Badge
              color="indigo"
              variant="soft"
              style={{ width: "fit-content", fontWeight: 600 }}
            >
              <RocketIcon /> ChatApp
            </Badge>
            <Heading size="8" style={{ letterSpacing: 0 }}>
              Nền tảng trò chuyện trực tuyến thân thiện và an toàn
            </Heading>
            <Text size="3" color="gray" style={{ lineHeight: 1.7 }}>
              ChatApp giúp người dùng kết nối, trò chuyện, quản lý hồ sơ cá
              nhân và gửi báo cáo khi gặp nội dung không phù hợp. Website được
              thiết kế cho trải nghiệm gọn gàng, dễ dùng và có công cụ quản trị
              đi kèm.
            </Text>
            <Flex gap="3" wrap="wrap">
              <Button size="3" disabled>
                <ChatBubbleIcon />
                Bắt đầu trò chuyện
              </Button>
              <Button size="3" variant="soft" color="gray" disabled>
                <EyeOpenIcon />
                Xem tính năng
              </Button>
            </Flex>
          </Flex>

          <Box
            style={{
              width: "100%",
              maxWidth: 340,
              border: "1px solid var(--indigo-6)",
              borderRadius: 8,
              background: "var(--gray-1)",
              padding: 20,
              boxShadow: "0 18px 42px rgba(79, 70, 229, 0.16)",
            }}
          >
            <Flex direction="column" gap="4">
              <Flex align="center" justify="between">
                <Flex align="center" gap="2">
                  <StarFilledIcon color="var(--indigo-9)" />
                  <Text size="2" weight="bold">
                    Tổng quan website
                  </Text>
                </Flex>
                <Badge color="green" variant="soft">
                  Đang hoạt động
                </Badge>
              </Flex>

              <Grid columns="3" gap="3">
                {stats.map((item) => (
                  <Flex
                    key={item.label}
                    direction="column"
                    gap="1"
                    align="center"
                    style={{
                      border: "1px solid var(--gray-5)",
                      borderRadius: 8,
                      padding: "12px 8px",
                      minHeight: 74,
                    }}
                  >
                    <Text size="4" weight="bold" color="indigo">
                      {item.value}
                    </Text>
                    <Text size="1" color="gray" align="center">
                      {item.label}
                    </Text>
                  </Flex>
                ))}
              </Grid>

              <Separator size="4" />

              <Flex direction="column" gap="2">
                <Text size="2" weight="bold">
                  Dành cho người dùng muốn:
                </Text>
                <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
                  trò chuyện nhanh, cá nhân hóa hồ sơ, dùng VIP khi cần thêm
                  quyền lợi và báo cáo các hành vi không phù hợp.
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Flex>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <Flex
                key={item.title}
                direction="column"
                gap="3"
                style={{
                  minHeight: 166,
                  border: "1px solid var(--gray-5)",
                  borderRadius: 8,
                  background: "var(--gray-1)",
                  padding: 18,
                }}
              >
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    color: item.color,
                    background: item.background,
                  }}
                >
                  <Icon width={22} height={22} />
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="3" weight="bold">
                    {item.title}
                  </Text>
                  <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
                    {item.description}
                  </Text>
                </Flex>
              </Flex>
            );
          })}
        </Box>

        <Flex
          direction={{ initial: "column", md: "row" }}
          gap="4"
          style={{
            border: "1px solid var(--gray-5)",
            borderRadius: 8,
            background: "var(--gray-1)",
            padding: 20,
          }}
        >
          <Flex direction="column" gap="2" style={{ flex: 1 }}>
            <Badge color="gray" variant="soft" style={{ width: "fit-content" }}>
              <LockClosedIcon /> Quy trình sử dụng
            </Badge>
            <Heading size="5">Từ đăng nhập đến trò chuyện</Heading>
            <Text size="2" color="gray" style={{ lineHeight: 1.7 }}>
              Website tập trung vào hành trình ngắn, rõ ràng: đăng nhập, hoàn
              thiện hồ sơ, kết nối và dùng các công cụ an toàn khi cần.
            </Text>
          </Flex>

          <Flex direction="column" gap="3" style={{ flex: 1.2 }}>
            {steps.map((step, index) => (
              <Flex key={step} align="center" gap="3">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "var(--indigo-3)",
                    color: "var(--indigo-11)",
                    flexShrink: 0,
                  }}
                >
                  {index === steps.length - 1 ? (
                    <CheckIcon />
                  ) : (
                    <Text size="2" weight="bold">
                      {index + 1}
                    </Text>
                  )}
                </Flex>
                <Text size="2" weight="medium">
                  {step}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
