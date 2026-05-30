import { Flex } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PersonIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";

type MatchIconProps = {
  tone?: "blue" | "green" | "muted";
};

export function MatchIcon({ tone = "blue" }: MatchIconProps) {
  const background =
    tone === "green"
      ? "linear-gradient(135deg, #16a34a, #10b981)"
      : tone === "muted"
        ? "linear-gradient(135deg, #94a3b8, #64748b)"
        : `linear-gradient(135deg, ${authTheme.control}, ${authTheme.cyan})`;

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        background,
        borderRadius: 8,
        color: "#FFFFFF",
        height: 72,
        width: 72,
      }}
    >
      {tone === "green" ? (
        <PersonIcon height={32} width={32} />
      ) : (
        <MagnifyingGlassIcon height={32} width={32} />
      )}
    </Flex>
  );
}
