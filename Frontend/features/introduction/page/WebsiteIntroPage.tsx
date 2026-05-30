import { Badge, Box, Flex, Grid, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  CheckIcon,
  GlobeIcon,
  LockClosedIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import {
  FeatureTile,
  UserHero,
  UserPageShell,
  UserPanel,
} from "@/features/user-layout/components";

const highlights = [
  {
    description: "Tìm người trò chuyện phù hợp và bắt đầu câu chuyện nhanh.",
    icon: <ChatBubbleIcon height={22} width={22} />,
    title: "Kết nối nhanh",
    tone: "blue" as const,
  },
  {
    description: "Hồ sơ cá nhân giúp mỗi cuộc trò chuyện đáng tin cậy hơn.",
    icon: <PersonIcon height={22} width={22} />,
    title: "Hồ sơ rõ ràng",
    tone: "cyan" as const,
  },
  {
    description: "Báo cáo hành vi không phù hợp để giữ cộng đồng văn minh.",
    icon: <LockClosedIcon height={22} width={22} />,
    title: "An toàn hơn",
    tone: "gold" as const,
  },
];

const steps = [
  "Đăng nhập bằng Google",
  "Cập nhật hồ sơ cá nhân",
  "Tìm người phù hợp và bắt đầu trò chuyện",
  "Báo cáo nội dung không phù hợp khi cần",
];

export function WebsiteIntroPage() {
  return (
    <UserPageShell>
      <UserHero
        badge="Website Người Lạ"
        description="Người Lạ giúp người dùng kết nối, trò chuyện, quản lý hồ sơ và báo cáo nội dung trong một không gian gọn gàng, riêng tư và an toàn."
        icon={<GlobeIcon />}
        title="Nền tảng trò chuyện trực tuyến thân thiện và an toàn."
      >
        <UserPanel maxWidth={340}>
          <Flex direction="column" gap="4">
            <Flex align="center" justify="between">
              <Flex align="center" gap="2">
                <RocketIcon color={authTheme.cyan} />
                <Text size="2" weight="bold" style={{ color: authTheme.text }}>
                  Tổng quan
                </Text>
              </Flex>
              <Badge style={{ background: "rgba(34, 197, 94, 0.16)", color: authTheme.text }}>
                Đang hoạt động
              </Badge>
            </Flex>
            <Grid columns="3" gap="3">
              {[
                ["5+", "Tính năng"],
                ["Quản trị", "Quản trị"],
                ["Beta", "Trạng thái"],
              ].map(([value, label]) => (
                <Box
                  key={label}
                  style={{
                    background: "rgba(255, 255, 255, 0.74)",
                    border: `1px solid ${authTheme.line}`,
                    borderRadius: 8,
                    minHeight: 74,
                    padding: 10,
                    textAlign: "center",
                  }}
                >
                  <Text as="div" size="4" weight="bold" style={{ color: authTheme.cyan }}>
                    {value}
                  </Text>
                  <Text as="div" size="1" style={{ color: authTheme.muted }}>
                    {label}
                  </Text>
                </Box>
              ))}
            </Grid>
          </Flex>
        </UserPanel>
      </UserHero>

      <Grid columns={{ initial: "1", md: "3" }} gap="3">
        {highlights.map((item) => (
          <FeatureTile key={item.title} {...item} />
        ))}
      </Grid>

      <UserPanel>
        <Flex direction={{ initial: "column", md: "row" }} gap="5">
          <Box style={{ flex: 1 }}>
            <Badge style={{ background: "rgba(59, 130, 246, 0.12)", color: authTheme.text }}>
              <LockClosedIcon /> Quy trình sử dụng
            </Badge>
            <Text as="div" mt="3" size="5" weight="bold" style={{ color: authTheme.text }}>
              Từ đăng nhập đến trò chuyện
            </Text>
            <Text as="p" size="2" style={{ color: authTheme.muted, lineHeight: 1.7 }}>
              Hành trình ngắn gọn, rõ ràng và tập trung vào việc kết nối đúng người.
            </Text>
          </Box>
          <Flex direction="column" gap="3" style={{ flex: 1.2 }}>
            {steps.map((step, index) => (
              <Flex align="center" gap="3" key={step}>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    background: index === steps.length - 1 ? authTheme.cyan : authTheme.control,
                    borderRadius: 8,
                    color: "#FFFFFF",
                    height: 30,
                    width: 30,
                  }}
                >
                  {index === steps.length - 1 ? <CheckIcon /> : index + 1}
                </Flex>
                <Text size="2" weight="medium" style={{ color: authTheme.text }}>
                  {step}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </UserPanel>
    </UserPageShell>
  );
}
