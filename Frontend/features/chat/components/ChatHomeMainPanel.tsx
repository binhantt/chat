import { ChatArea } from "./ChatArea";
import { MatchPeople } from "./MatchPeople";
import { ChatPanelFrame } from "./ChatPanelFrame";
import type { CenterMode, MatchedUser } from "../types";

type ChatHomeMainPanelProps = {
  conversationId: string | null;
  matchedUser: MatchedUser | null;
  mode: CenterMode;
  onBack: () => void;
  onCancelMatch: () => void;
  onHome: () => void;
  onMatched: (convId: string, matched: MatchedUser) => void;
  selectedUser: string | null;
};

export function ChatHomeMainPanel({
  conversationId,
  matchedUser,
  mode,
  onBack,
  onCancelMatch,
  onHome,
  onMatched,
  selectedUser,
}: ChatHomeMainPanelProps) {
  const centerTitle =
    mode === "chat" ? "Tin nhắn" : "Tìm kiếm người";

  return (
    <ChatPanelFrame
      bodyPadding={mode === "chat" ? 0 : 16}
      className={`chat-main-panel ${mode === "chat" ? "chat-main-panel-active" : ""}`}
      hideHeader={mode === "chat"}
      title={centerTitle}
      subtitle={
        mode === "chat"
          ? "Header và ô nhập được giữ cố định"
          : "Tìm người mới để bắt đầu cuộc trò chuyện"
      }
      action={
        mode === "chat" ? (
          <button
            type="button"
            className="chat-secondary-button"
            onClick={onHome}
            style={{ height: 36, padding: "0 12px" }}
          >
            Đóng
          </button>
        ) : null
      }
    >
      {mode === "chat" && selectedUser && conversationId ? (
        <ChatArea
          selectedUser={selectedUser}
          matchedUser={matchedUser}
          conversationId={conversationId}
          onBack={onBack}
        />
      ) : (
        <MatchPeople onMatched={onMatched} onCancel={onCancelMatch} />
      )}
    </ChatPanelFrame>
  );
}
