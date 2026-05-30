import { Badge, Button, Flex, Text } from "@radix-ui/themes";
import { CheckIcon, StarIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { SettingsSection } from "./SettingsSection";

const benefits = [
  "Giữ hình ảnh đã chia sẻ",
  "Xem họ tên người trò chuyện",
  "Đổi giao diện phòng trò chuyện",
];

export function VipSettingsCard() {
  return (
    <SettingsSection
      description="Khu vực chuẩn bị cho tính năng nâng cấp tài khoản."
      icon={<StarIcon />}
      title="Gói VIP"
    >
      <Flex align="center" justify="between" gap="3">
        <Text size="2" style={{ color: authTheme.muted }}>
          Tính năng đang được hoàn thiện.
        </Text>
        <Badge color="blue" variant="soft">
          Sắp mở
        </Badge>
      </Flex>

      <Flex direction="column" gap="2">
        {benefits.map((benefit) => (
          <Flex align="center" gap="2" key={benefit}>
            <CheckIcon color={authTheme.control} />
            <Text size="2" style={{ color: authTheme.text }}>
              {benefit}
            </Text>
          </Flex>
        ))}
      </Flex>

      <Flex gap="2" wrap="wrap">
        <Button size="2" variant="soft" disabled>
          VIP 1 tuần
        </Button>
        <Button size="2" variant="soft" disabled>
          VIP 15 ngày
        </Button>
        <Button size="2" variant="soft" disabled>
          VIP 1 tháng
        </Button>
      </Flex>
    </SettingsSection>
  );
}
