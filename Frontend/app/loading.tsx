import { Box, Flex, Spinner } from "@radix-ui/themes";

export default function Loading() {
  return (
    <Flex
      role="status"
      aria-label="Đang tải"
      align="center"
      justify="center"
      style={{
        height: "100dvh",
        background: "var(--bg-primary)",
      }}
    >
      <Flex direction="column" align="center" gap="3">
        <Spinner size="3" />
        <Box
          aria-hidden="true"
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          Đang tải...
        </Box>
      </Flex>
    </Flex>
  );
}
