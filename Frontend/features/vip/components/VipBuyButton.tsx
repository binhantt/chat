import { Button } from "@radix-ui/themes";
import { LightningBoltIcon } from "@radix-ui/react-icons";

export function VipBuyButton() {
  return (
    <Button disabled size="3" style={{ borderRadius: 8 }}>
      <LightningBoltIcon />
      Sắp mở mua gói
    </Button>
  );
}
