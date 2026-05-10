"use client";

import { Flex, Text, Box, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { ChatIcon3D, ChatArea } from "../components";
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

export function ChatPage() {
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Load conversation from URL params
  useEffect(() => {
    const convParam = searchParams.get("conv");
    const userParam = searchParams.get("user");
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
    }
  }, [searchParams]);

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    setShowSearch(false);
    setShowMatch(false);
    setMatchedUser(null);
    setConversationId(null);
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    setShowMatch(false);
  };

  const handleMatchClick = () => {
    setShowMatch(true);
    setShowSearch(false);
  };

  const handleBack = () => {
    setShowSearch(false);
    setShowMatch(false);
    setSelectedUser(null);
    setMatchedUser(null);
    setConversationId(null);
  };

  const handleMatched = (convId: string, matched: MatchedUser) => {
    setConversationId(convId);
    setMatchedUser(matched);
    setSelectedUser(matched.id);
    setShowSearch(false);
    setShowMatch(false);
  };

  const handleCancelMatch = () => {
    setMatchedUser(null);
    setConversationId(null);
    setShowSearch(false);
    setShowMatch(false);
  };

  return (
    <Box
      style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
        background: isDark ? "var(--gray-12)" : "var(--gray-1)",
      }}
    >
      {/* Welcome Screen */}
      {!selectedUser && !showSearch && !showMatch && !matchedUser && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          gap="4"
          style={{
            flex: 1,
            background: isDark ? "var(--gray-12)" : "var(--gray-1)",
          }}
        >
          <Box style={{ perspective: 600 }}>
            <Box style={{ animation: "chatPulse 2s ease-in-out infinite" }}>
              <ChatIcon3D size={80} />
            </Box>
          </Box>
          <Flex direction="column" align="center" gap="1">
            <Text size="5" weight="bold" color="indigo">
              Chào mừng đến ChatApp
            </Text>
            <Text size="3" color="gray" align="center">
              Tìm người trò chuyện để bắt đầu
            </Text>
          </Flex>
          <Flex gap="3">
            <Button
              size="3"
              color="indigo"
              onClick={handleSearchClick}
              style={{
                cursor: "pointer",
                padding: "12px 32px",
              }}
            >
              Tìm kiếm người trò chuyện
            </Button>
            <Button
              size="3"
              variant="outline"
              color="indigo"
              onClick={handleMatchClick}
              style={{
                cursor: "pointer",
                padding: "12px 32px",
              }}
            >
              Ghép đôi ngẫu nhiên
            </Button>
          </Flex>
          <style>{`
            @keyframes chatPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
          `}</style>
        </Flex>
      )}

      {/* Search Screen - Search People */}
      {!selectedUser && showSearch && (
        <Flex
          direction="column"
          style={{
            flex: 1,
            padding: "24px",
            background: isDark ? "var(--gray-12)" : "var(--gray-1)",
          }}
        >
          <Flex align="center" gap="3" mb="4">
            <Button
              variant="ghost"
              size="2"
              onClick={handleBack}
              style={{ cursor: "pointer" }}
            >
              ← Quay lại
            </Button>
            <Text size="4" weight="bold" color="indigo">
              Tìm kiếm người trò chuyện
            </Text>
          </Flex>
          <Box style={{ maxWidth: 600, width: "100%" }}>
            <SearchPeople />
          </Box>
        </Flex>
      )}

      {/* Match Screen - Match People */}
      {!selectedUser && showMatch && (
        <Flex
          direction="column"
          style={{
            flex: 1,
            padding: "24px",
            background: isDark ? "var(--gray-12)" : "var(--gray-1)",
          }}
        >
          <Flex align="center" gap="3" mb="4">
            <Button
              variant="ghost"
              size="2"
              onClick={handleBack}
              style={{ cursor: "pointer" }}
            >
              ← Quay lại
            </Button>
            <Text size="4" weight="bold" color="indigo">
              Tìm kiếm người trò chuyện
            </Text>
          </Flex>
          <Box style={{ maxWidth: 600, width: "100%" }}>
            <MatchPeople
              onMatched={handleMatched}
              onCancel={handleCancelMatch}
            />
          </Box>
        </Flex>
      )}

      {/* Matched Result */}
      {matchedUser && conversationId && !selectedUser && (
        <Flex
          direction="column"
          style={{
            flex: 1,
            padding: "24px",
            background: isDark ? "var(--gray-12)" : "var(--gray-1)",
          }}
        >
          <Flex align="center" gap="3" mb="4">
            <Button
              variant="ghost"
              size="2"
              onClick={handleCancelMatch}
              style={{ cursor: "pointer" }}
            >
              ← Quay lại
            </Button>
            <Text size="4" weight="bold" color="green">
              Đã ghép đôi thành công!
            </Text>
          </Flex>
        </Flex>
      )}
      {selectedUser && (
        <Box style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <ChatArea
            selectedUser={selectedUser}
            matchedUser={matchedUser}
            conversationId={conversationId}
            onBack={handleBack}
          />
        </Box>  
      )}
    </Box>
  );
}