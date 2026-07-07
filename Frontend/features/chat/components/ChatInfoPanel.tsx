import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { MixerHorizontalIcon, PersonIcon } from "@radix-ui/react-icons";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import { ChatPanelFrame } from "./ChatPanelFrame";
import type { CenterMode, MatchedUser } from "../types";

type ChatInfoPanelProps = {
  conversationId: string | null;
  mode: CenterMode;
  user: MatchedUser | null;
};

export function ChatInfoPanel({ conversationId, mode, user }: ChatInfoPanelProps) {
  return (
    <ChatPanelFrame
      bodyPadding={16}
      className="chat-info-panel"
      title={
        <Flex align="center" gap="2">
          <MixerHorizontalIcon />
          <Text size="4" weight="bold">
            Thông tin
          </Text>
        </Flex>
      }
    >
      {mode !== "chat" || !conversationId ? (
        <EmptyInfoState />
      ) : (
        <Flex direction="column" gap="4">
          <Flex direction="column" align="center" gap="3">
            <AvatarWithVipBadge
              size="6"
              radius="full"
              src={user?.avatarUrl || undefined}
              fallback={(user?.fullName || user?.email || "??").slice(0, 2)}
              badge={user?.badge}
              style={{ background: "var(--chat-accent)", color: "white" }}
            />
            <Flex direction="column" align="center" gap="1">
              <Flex align="center" gap="2">
                <Text size="4" weight="bold" align="center">
                  {user?.fullName || user?.email || "Người dùng"}
                </Text>
                {user?.badge && (
                  typeof user.badge === 'string' && user.badge.startsWith('http') ? (
                    <img src={user.badge} alt="Huy hiệu" style={{ width: 24, height: 24, borderRadius: 4 }} />
                  ) : (
                    <Text size="3">{user.badge}</Text>
                  )
                )}
              </Flex>
              <Badge color="indigo" variant="soft">
                Đang trong trò chuyện
              </Badge>
            </Flex>
          </Flex>

          <InfoRow label="Mã hội thoại" value={conversationId.slice(0, 8)} />
          <InfoRow label="Vị trí" value={user?.city || "Chưa cập nhật"} />
          <InfoRow label="Email" value={user?.email || "Chưa cập nhật"} />
        </Flex>
      )}
    </ChatPanelFrame>
  );
}

function EmptyInfoState() {
  return (
    <Box
      className="chat-empty-state"
      style={{
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(239, 246, 255, 0.52))",
        borderRadius: 8,
      }}
    >
      <Box
        className="chat-empty-icon"
        style={{
          background: "rgba(168, 85, 247, 0.1)",
          color: "var(--primary)",
        }}
      >
        <PersonIcon width="24" height="24" />
      </Box>
      <Text size="3" weight="bold" style={{ color: "var(--text-primary)" }}>
        Chưa chọn hội thoại
      </Text>
      <Text size="2" className="chat-muted">
        Khi vào trò chuyện, thông tin người đối diện và trạng thái sẽ hiện ở đây.
      </Text>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      style={{
        background: "var(--chat-surface-muted)",
        border: "1px solid var(--chat-border)",
        borderRadius: "var(--chat-radius)",
        padding: 12,
      }}
    >
      <Text size="1" className="chat-muted" as="div">
        {label}
      </Text>
      <Text size="2" weight="medium" as="div">
        {value}
      </Text>
    </Box>
  );
}
