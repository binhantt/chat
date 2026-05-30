import { Box, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

export function AdminProgressRow({
  label,
  tone = "blue",
  total,
  value,
}: {
  label: string;
  tone?: "blue" | "cyan" | "red";
  total: number;
  value: number;
}) {
  const width = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = tone === "red" ? "#EF4444" : tone === "cyan" ? authTheme.cyan : authTheme.control;

  return (
    <Box>
      <Flex align="center" justify="between" mb="1">
        <Text size="2" weight="medium" style={{ color: authTheme.text }}>
          {label}
        </Text>
        <Text size="2" style={{ color: authTheme.muted }}>
          {value}
        </Text>
      </Flex>
      <Box style={{ background: "rgba(59, 130, 246, 0.1)", borderRadius: 999, height: 8, overflow: "hidden" }}>
        <Box style={{ background: color, borderRadius: 999, height: "100%", width: `${width}%` }} />
      </Box>
    </Box>
  );
}
