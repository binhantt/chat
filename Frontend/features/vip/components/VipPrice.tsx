import { Box, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type VipPriceProps = {
  duration: string;
  price: string;
};

export function VipPrice({ duration, price }: VipPriceProps) {
  return (
    <Box>
      <Text size="8" weight="bold" style={{ color: authTheme.cyan }}>
        {price}
      </Text>
      <Text size="2" style={{ color: authTheme.muted }}>
        {" "}
        / {duration}
      </Text>
    </Box>
  );
}
