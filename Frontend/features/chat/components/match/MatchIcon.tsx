import { Flex } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PersonIcon, CheckIcon } from "@radix-ui/react-icons";

type MatchIconProps = {
  tone?: "idle" | "searching" | "found" | "empty";
};

export function MatchIcon({ tone = "idle" }: MatchIconProps) {
  const config = {
    idle: {
      background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
      icon: <MagnifyingGlassIcon height={32} width={32} />,
    },
    searching: {
      background: "linear-gradient(135deg, var(--chat-accent), var(--secondary-light))",
      icon: <MagnifyingGlassIcon height={32} width={32} />,
    },
    found: {
      background: "linear-gradient(135deg, var(--chat-accent), #34D399)",
      icon: <CheckIcon height={32} width={32} />,
    },
    empty: {
      background: "linear-gradient(135deg, var(--chat-surface-muted), var(--chat-border))",
      icon: <PersonIcon height={32} width={32} />,
    },
  };

  const { background, icon } = config[tone];

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        background,
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(75, 46, 131, 0.2)",
        color: "#FFFFFF",
        height: 72,
        width: 72,
      }}
    >
      {icon}
    </Flex>
  );
}
