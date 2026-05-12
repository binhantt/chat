"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  CheckIcon,
  EyeOpenIcon,
  ImageIcon,
  LightningBoltIcon,
  LockClosedIcon,
  MagicWandIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";

const packages = [
  {
    name: "VIP 1 tuần",
    duration: "7 ngày",
    price: "19K",
    note: "Trải nghiệm nhanh",
    highlight: false,
  },
  {
    name: "VIP 15 ngày",
    duration: "15 ngày",
    price: "35K",
    note: "Phù hợp nhất",
    highlight: true,
  },
  {
    name: "VIP 1 tháng",
    duration: "30 ngày",
    price: "59K",
    note: "Tiết kiệm hơn",
    highlight: false,
  },
];

const benefits = [
  {
    title: "Giữ hình ảnh sau khi chat",
    description: "Lưu lại ảnh đã chia sẻ trong cuộc trò chuyện để xem lại khi cần.",
    icon: ImageIcon,
    color: "var(--indigo-9)",
    background: "var(--indigo-3)",
  },
  {
    title: "Xem họ tên người chat",
    description: "Hiển thị thông tin nhận diện rõ hơn khi bắt đầu kết nối mới.",
    icon: EyeOpenIcon,
    color: "var(--green-9)",
    background: "var(--green-3)",
  },
  {
    title: "Đổi giao diện trò chuyện",
    description: "Mở khóa các kiểu giao diện riêng để cá nhân hóa trải nghiệm.",
    icon: MagicWandIcon,
    color: "var(--amber-10)",
    background: "var(--amber-3)",
  },
];

const includedFeatures = [
  "Không quảng cáo trong khu vực VIP",
  "Ưu tiên cập nhật tính năng mới",
  "Quản lý quyền riêng tư linh hoạt hơn",
];

export function VipPage() {
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
              color="amber"
              variant="soft"
              style={{ width: "fit-content", fontWeight: 600 }}
            >
              <LockClosedIcon /> Sắp ra mắt
            </Badge>
            <Heading size="8" style={{ letterSpacing: 0 }}>
              Gói VIP
            </Heading>
            <Text size="3" color="gray" style={{ lineHeight: 1.7 }}>
              Nâng cấp trải nghiệm trò chuyện với khả năng lưu hình ảnh, xem
              thông tin người chat và tùy biến giao diện. Các gói đang được
              chuẩn bị để mở bán trong thời gian tới.
            </Text>
          </Flex>

          <Box
            style={{
              width: "100%",
              maxWidth: 320,
              border: "1px solid var(--amber-6)",
              borderRadius: 8,
              background: "var(--amber-2)",
              padding: 18,
              boxShadow: "0 16px 36px rgba(245, 158, 11, 0.14)",
            }}
          >
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <StarFilledIcon color="var(--amber-10)" width={20} height={20} />
                <Text size="2" weight="bold">
                  Quyền lợi đang hoàn thiện
                </Text>
              </Flex>
              <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
                Trang này đã sẵn sàng để hiển thị gói VIP, còn nút thanh toán sẽ
                được bật khi backend mua gói hoàn tất.
              </Text>
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
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <Flex
                key={benefit.title}
                direction="column"
                gap="3"
                style={{
                  minHeight: 168,
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
                    color: benefit.color,
                    background: benefit.background,
                  }}
                >
                  <Icon width={22} height={22} />
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="3" weight="bold">
                    {benefit.title}
                  </Text>
                  <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
                    {benefit.description}
                  </Text>
                </Flex>
              </Flex>
            );
          })}
        </Box>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {packages.map((pkg) => (
            <Box
              key={pkg.name}
              style={{
                position: "relative",
                border: pkg.highlight
                  ? "2px solid var(--indigo-8)"
                  : "1px solid var(--gray-5)",
                borderRadius: 8,
                background: "var(--gray-1)",
                padding: 20,
                boxShadow: pkg.highlight
                  ? "0 18px 42px rgba(79, 70, 229, 0.18)"
                  : "0 10px 28px rgba(15, 23, 42, 0.06)",
              }}
            >
              {pkg.highlight && (
                <Badge
                  color="indigo"
                  variant="solid"
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    fontWeight: 600,
                  }}
                >
                  Khuyên dùng
                </Badge>
              )}

              <Flex direction="column" gap="4">
                <Flex direction="column" gap="2">
                  <Text size="2" color="gray" weight="medium">
                    {pkg.note}
                  </Text>
                  <Heading size="5">{pkg.name}</Heading>
                  <Flex align="end" gap="2">
                    <Text size="8" weight="bold" color="indigo">
                      {pkg.price}
                    </Text>
                    <Text size="2" color="gray" style={{ paddingBottom: 8 }}>
                      / {pkg.duration}
                    </Text>
                  </Flex>
                </Flex>

                <Separator size="4" />

                <Flex direction="column" gap="2">
                  {includedFeatures.map((feature) => (
                    <Flex key={feature} align="center" gap="2">
                      <CheckIcon color="var(--green-9)" />
                      <Text size="2">{feature}</Text>
                    </Flex>
                  ))}
                </Flex>

                <Button
                  size="3"
                  disabled
                  variant={pkg.highlight ? "solid" : "soft"}
                  color={pkg.highlight ? "indigo" : "gray"}
                  style={{ marginTop: 4 }}
                >
                  <LightningBoltIcon />
                  Sắp mở mua gói
                </Button>
              </Flex>
            </Box>
          ))}
        </Box>

        <Flex
          align={{ initial: "start", sm: "center" }}
          justify="between"
          direction={{ initial: "column", sm: "row" }}
          gap="3"
          style={{
            border: "1px solid var(--gray-5)",
            borderRadius: 8,
            background: "var(--gray-1)",
            padding: 18,
          }}
        >
          <Flex direction="column" gap="1">
            <Text size="3" weight="bold">
              Muốn dùng VIP sớm?
            </Text>
            <Text size="2" color="gray">
              Tính năng mua gói đang khóa để đảm bảo thanh toán và quyền lợi
              hoạt động ổn định trước khi mở chính thức.
            </Text>
          </Flex>
          <Badge color="green" variant="soft" size="2">
            Đang chuẩn bị
          </Badge>
        </Flex>
      </Flex>
    </Box>
  );
}
