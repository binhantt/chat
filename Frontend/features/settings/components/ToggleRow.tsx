"use client";

import { Flex, Switch, Text } from "@radix-ui/themes";

type ToggleRowProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  description: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  title: string;
};

export function ToggleRow({
  checked,
  defaultChecked,
  description,
  disabled,
  onCheckedChange,
  title,
}: ToggleRowProps) {
  return (
    <Flex
      align="center"
      justify="between"
      gap="4"
      style={{
        borderBottom: "1px solid var(--chat-border)",
        paddingBottom: 12,
      }}
    >
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </Text>
        <Text size="1" style={{ color: "var(--text-secondary)" }}>
          {description}
        </Text>
      </Flex>
      <Switch
        checked={checked}
        color="blue"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </Flex>
  );
}
