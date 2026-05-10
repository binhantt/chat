import { Flex } from "@radix-ui/themes";

export function LeftDecor() {
  return (
    <Flex
      display={{ initial: "none", md: "flex" }}
      position="absolute"
      left="0"
      top="0"
      style={{ width: 200, height: "100%", opacity: 0.12, pointerEvents: "none" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 800" preserveAspectRatio="none">
        <circle cx="0" cy="200" r="200" fill="var(--indigo-9)" />
        <circle cx="100" cy="600" r="150" fill="var(--violet-9)" />
        <circle cx="50" cy="750" r="100" fill="var(--indigo-8)" />
      </svg>
    </Flex>
  );
}
