import type { ReactNode } from "react";
import { Badge, Flex, Heading, Text } from "@radix-ui/themes";

type UserHeroProps = {
  badge: string;
  children?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
};

export function UserHero({
  badge,
  children,
  description,
  icon,
  title,
}: UserHeroProps) {
  return (
    <Flex
      align={{ initial: "start", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="5"
      justify="between"
      style={{
        borderBottom: "1px solid var(--chat-border)",
        paddingBottom: 18,
      }}
    >
      <Flex direction="column" gap="3" style={{ maxWidth: 660 }}>
        <Badge
          size="3"
          style={{
            alignSelf: "flex-start",
            background: "var(--chat-accent-soft)",
            border: "1px solid var(--chat-border)",
            color: "var(--chat-accent)",
          }}
        >
          <Flex align="center" gap="2">
            {icon}
            <Text size="2" weight="bold">
              {badge}
            </Text>
          </Flex>
        </Badge>
        <Heading
          as="h1"
          size="7"
          style={{
            color: "var(--chat-text)",
            fontFamily: "var(--font-heading)",
            letterSpacing: 0,
            lineHeight: 1.15,
          }}
        >
          {title}
        </Heading>
        <Text
          as="p"
          size="3"
          style={{
            color: "var(--chat-muted)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {description}
        </Text>
      </Flex>
      {children}
    </Flex>
  );
}
