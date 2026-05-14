"use client";

import { Avatar, Badge, Box, Flex, Text } from "@radix-ui/themes";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChatBubbleIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { ChatArea } from "../components";
import { MatchPeople } from "../components/MatchPeople";
import { SearchPeople } from "../components/SearchPeople";

interface MatchedUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  city: string | null;
}

type CenterMode = "welcome" | "search" | "match" | "chat";

const CHAT_SESSION_KEY = "chat.activeConversation";

interface ChatSessionState {
  selectedUser: string | null;
  conversationId: string | null;
  matchedUser: MatchedUser | null;
}

export function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [mode, setMode] = useState<CenterMode>("welcome");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const clearedConversationRef = useRef<string | null>(null);

  const clearChatRoute = useCallback(() => {
    if (searchParams.has("conv") || searchParams.has("user")) {
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const resetChatState = useCallback(() => {
    clearedConversationRef.current = conversationId;
    setSelectedUser(null);
    setMatchedUser(null);
    setConversationId(null);
    clearChatRoute();
  }, [clearChatRoute, conversationId]);

  const leaveCurrentMatch = useCallback(async () => {
    await fetch("/api/v1/match/leave", {
      method: "DELETE",
      credentials: "include",
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const convParam = searchParams.get("conv");
    const userParam = searchParams.get("user");
    if (convParam && convParam === clearedConversationRef.current) {
      clearChatRoute();
      return;
    }

    if (convParam && userParam) {
      setConversationId(convParam);
      setSelectedUser(userParam);
      setMatchedUser({
        id: userParam,
        email: "",
        fullName: null,
        avatarUrl: null,
        gender: null,
        city: null,
      });
      setMode("chat");
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(CHAT_SESSION_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as Partial<ChatSessionState>;
      if (saved.conversationId && saved.selectedUser) {
        setConversationId(saved.conversationId);
        setSelectedUser(saved.selectedUser);
        setMatchedUser(saved.matchedUser ?? null);
        setMode("chat");
      }
    } catch {
      window.sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, [clearChatRoute, searchParams]);

  useEffect(() => {
    if (conversationId && selectedUser) {
      const state: ChatSessionState = {
        selectedUser,
        conversationId,
        matchedUser,
      };
      window.sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(state));
      return;
    }

    if (mode !== "match" && mode !== "search") {
      window.sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, [conversationId, matchedUser, mode, selectedUser]);

  const handleSearchClick = () => {
    clearChatRoute();
    setMode("search");
  };

  const handleMatchClick = async () => {
    await leaveCurrentMatch();
    resetChatState();
    setMode("match");
  };

  const handleHomeClick = () => {
    resetChatState();
    setMode("welcome");
  };

  const handleChatBack = () => {
    resetChatState();
    setMode("welcome");
  };

  const handleMatched = (convId: string, matched: MatchedUser) => {
    clearChatRoute();
    setConversationId(convId);
    setMatchedUser(matched);
    setSelectedUser(matched.id);
    setMode("chat");
  };

  const handleSelectConversation = (convId: string, partner: MatchedUser) => {
    clearChatRoute();
    setConversationId(convId);
    setMatchedUser(partner);
    setSelectedUser(partner.id);
    setMode("chat");
  };

  const handleCancelMatch = () => {
    void leaveCurrentMatch();
    resetChatState();
    setMode("welcome");
  };

  const centerTitle =
    mode === "chat"
      ? "Tin nhan"
      : mode === "search"
        ? "Tim hoi thoai"
        : mode === "match"
          ? "Ghep doi"
          : "Bat dau";

  return (
    <Box className="chat-shell">
      <Box className="chat-panel chat-sidebar-panel">
        <Box className="chat-panel-header">
          <Flex direction="column" gap="1">
            <Text size="4" weight="bold">
              Chat
            </Text>
            <Text size="2" className="chat-muted">
              Hoi thoai dang hoat dong
            </Text>
          </Flex>
          <button
            type="button"
            className="chat-icon-button"
            onClick={handleHomeClick}
            title="Trang chat chinh"
            aria-label="Trang chat chinh"
          >
            <ChatBubbleIcon />
          </button>
        </Box>

        <Box className="chat-panel-body" style={{ padding: 12 }}>
          <Flex direction="column" gap="3">
            <Box className="chat-action-row">
              <button
                type="button"
                className="chat-action-button"
                data-active={mode === "search"}
                onClick={handleSearchClick}
              >
                <MagnifyingGlassIcon width="20" height="20" />
                <span>
                  <Text size="2" weight="bold" as="div">
                    Tim lai
                  </Text>
                  <Text size="1" className="chat-muted" as="div">
                    Lich su chat
                  </Text>
                </span>
              </button>
              <button
                type="button"
                className="chat-action-button"
                data-active={mode === "match"}
                onClick={handleMatchClick}
              >
                <PersonIcon width="20" height="20" />
                <span>
                  <Text size="2" weight="bold" as="div">
                    Tim moi
                  </Text>
                  <Text size="1" className="chat-muted" as="div">
                    Ghep nguoi
                  </Text>
                </span>
              </button>
            </Box>

            <SearchPeople
              selectedConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
            />
          </Flex>
        </Box>
      </Box>

      <Box className="chat-panel chat-main-panel">
        <Box className="chat-panel-header">
          <Flex direction="column" gap="1">
            <Text size="4" weight="bold">
              {centerTitle}
            </Text>
            <Text size="2" className="chat-muted">
              {mode === "chat"
                ? "Header va o nhap duoc giu co dinh"
                : "Mot khung duy nhat, chi doi noi dung ben trong"}
            </Text>
          </Flex>
          {mode !== "welcome" && (
            <button
              type="button"
              className="chat-secondary-button"
              onClick={handleHomeClick}
              style={{ height: 36, padding: "0 12px" }}
            >
              Dong
            </button>
          )}
        </Box>

        <Box
          className="chat-panel-body"
          style={{
            padding: mode === "chat" ? 0 : 16,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {mode === "chat" && selectedUser && conversationId ? (
            <ChatArea
              selectedUser={selectedUser}
              matchedUser={matchedUser}
              conversationId={conversationId}
              onBack={handleChatBack}
            />
          ) : mode === "search" ? (
            <SearchPeople
              selectedConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              showSearchHeader
            />
          ) : mode === "match" ? (
            <MatchPeople
              onMatched={handleMatched}
              onCancel={handleCancelMatch}
            />
          ) : (
            <WelcomePanel
              onSearch={handleSearchClick}
              onMatch={handleMatchClick}
            />
          )}
        </Box>
      </Box>

      <Box className="chat-panel chat-info-panel">
        <Box className="chat-panel-header">
          <Flex align="center" gap="2">
            <MixerHorizontalIcon />
            <Text size="4" weight="bold">
              Thong tin
            </Text>
          </Flex>
        </Box>
        <InfoPanel mode={mode} user={matchedUser} conversationId={conversationId} />
      </Box>
    </Box>
  );
}

function WelcomePanel({
  onSearch,
  onMatch,
}: {
  onSearch: () => void;
  onMatch: () => void;
}) {
  return (
    <Box className="chat-empty-state" style={{ flex: 1 }}>
      <Box className="chat-empty-icon">
        <ChatBubbleIcon width="26" height="26" />
      </Box>
      <Flex direction="column" gap="2" align="center">
        <Text size="6" weight="bold">
          Chon mot cuoc tro chuyen
        </Text>
        <Text size="2" className="chat-muted" style={{ maxWidth: 420 }}>
          Tim lai hoi thoai cu, hoac bat dau ghep doi moi. Layout khong doi nua,
          chi noi dung o giua thay doi.
        </Text>
      </Flex>
      <Flex gap="3" wrap="wrap" justify="center">
        <button
          type="button"
          className="chat-primary-button"
          onClick={onMatch}
          style={{ height: 40, padding: "0 16px" }}
        >
          Tim nguoi moi
        </button>
        <button
          type="button"
          className="chat-secondary-button"
          onClick={onSearch}
          style={{ height: 40, padding: "0 16px" }}
        >
          Xem hoi thoai
        </button>
      </Flex>
    </Box>
  );
}

function InfoPanel({
  mode,
  user,
  conversationId,
}: {
  mode: CenterMode;
  user: MatchedUser | null;
  conversationId: string | null;
}) {
  if (mode !== "chat" || !conversationId) {
    return (
      <Box className="chat-panel-body">
        <Box className="chat-empty-state">
          <Box className="chat-empty-icon">
            <PersonIcon width="24" height="24" />
          </Box>
          <Text size="3" weight="bold">
            Chua chon hoi thoai
          </Text>
          <Text size="2" className="chat-muted">
            Khi vao chat, thong tin nguoi doi dien va trang thai se hien o day.
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="chat-panel-body">
      <Flex direction="column" gap="4">
        <Flex direction="column" align="center" gap="3">
          <Avatar
            size="6"
            radius="full"
            src={user?.avatarUrl || undefined}
            fallback={(user?.fullName || user?.email || "??").slice(0, 2)}
            style={{ background: "var(--chat-accent)", color: "white" }}
          />
          <Flex direction="column" align="center" gap="1">
            <Text size="4" weight="bold" align="center">
              {user?.fullName || user?.email || "Nguoi an danh"}
            </Text>
            <Badge color="indigo" variant="soft">
              Dang trong chat
            </Badge>
          </Flex>
        </Flex>

        <InfoRow label="Ma hoi thoai" value={conversationId.slice(0, 8)} />
        <InfoRow label="Vi tri" value={user?.city || "Chi hien khi ca hai thich"} />
        <InfoRow label="Email" value={user?.email || "An danh"} />
      </Flex>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      style={{
        border: "1px solid var(--chat-border)",
        borderRadius: "var(--chat-radius)",
        padding: 12,
        background: "var(--chat-surface-muted)",
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
