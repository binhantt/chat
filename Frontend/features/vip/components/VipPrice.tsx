import { Box, Text } from "@radix-ui/themes";

type VipPriceProps = {
  duration: string;
  price: string;
};

export function VipPrice({ duration, price }: VipPriceProps) {
  return (
    <Box>
      <Text size="8" weight="bold" style={{ color: "#22d3ee" }}>
        {price}
      </Text>
      <Text size="2" style={{ color: "var(--text-secondary)" }}>
        {" "}
        / {duration}
      </Text>
    </Box>
  );
}
