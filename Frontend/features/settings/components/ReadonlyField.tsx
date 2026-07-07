import { Flex, Text, TextField } from "@radix-ui/themes";

type ReadonlyFieldProps = {
  label: string;
  placeholder?: string;
  value?: string | null;
};

export function ReadonlyField({ label, placeholder = "Chưa cập nhật", value }: ReadonlyFieldProps) {
  return (
    <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 210 }}>
      <Text size="1" weight="medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </Text>
      <TextField.Root
        placeholder={placeholder}
        readOnly
        value={value ?? ""}
        style={{
          background: "#FFFFFF",
          border: "1px solid var(--chat-border)",
          borderRadius: 8,
          color: "var(--text-primary)",
          cursor: "not-allowed",
        }}
      />
    </Flex>
  );
}
