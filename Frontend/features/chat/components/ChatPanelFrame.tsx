import type { ReactNode } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { chatHeaderStyle, chatPanelStyle } from "../styles/chatHomeTheme";

type ChatPanelFrameProps = {
  action?: ReactNode;
  bodyPadding?: number;
  children: ReactNode;
  className: string;
  hideHeader?: boolean;
  subtitle?: string;
  title: ReactNode;
};

export function ChatPanelFrame({
  action,
  bodyPadding = 16,
  children,
  className,
  hideHeader = false,
  subtitle,
  title,
}: ChatPanelFrameProps) {
  return (
    <Box className={`chat-panel ${className}`} style={chatPanelStyle}>
      {!hideHeader && (
        <Box className="chat-panel-header" style={chatHeaderStyle}>
          <Flex direction="column" gap="1">
            {typeof title === "string" ? (
              <Text size="4" weight="bold">
                {title}
              </Text>
            ) : (
              title
            )}
            {subtitle && (
              <Text size="2" className="chat-muted">
                {subtitle}
              </Text>
            )}
          </Flex>
          {action}
        </Box>
      )}
      <Box
        className="chat-panel-body"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: bodyPadding,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
