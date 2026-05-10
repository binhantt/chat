import { Flex, Text, Card } from "@radix-ui/themes";
import { GoogleButton } from "../components/GoogleButton";
import { Logo } from "../components/Logo";
import { LeftDecor, RightDecor } from "../components/PageDecorations";

export function LoginPage() {
  return (
    <Flex
      justify="center"
      align="center"
      height="100vh"
      style={{ overflow: "hidden", background: "linear-gradient(135deg, var(--indigo-1) 0%, var(--violet-1) 100%)" }}
    >
      <LeftDecor />
      <RightDecor />

      <Card size="3" style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="3" align="center">
            <Logo size={64} />
            <Text size="7" weight="bold" color="indigo">
              ChatApp
            </Text>
          </Flex>

          <Flex direction="column" gap="3" align="center">
            <Text size="3" color="gray" align="center">
              Chào mừng bạn quay trở lại
            </Text>
          </Flex>

          <GoogleButton />

          <Text size="2" color="gray" align="center">
            Tiếp tục có nghĩa là bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
