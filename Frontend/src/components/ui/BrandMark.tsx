import { Flex, Text } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";

export function BrandMark() {
  return (
    <Flex align="center" gap="3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
        <ChatBubbleIcon width="20" height="20" />
      </div>
      <Text size="5" weight="bold" className="text-slate-900 tracking-tight">
        Chat vs Nguoi La 2
      </Text>
    </Flex>
  );
}
