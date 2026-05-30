import { Flex, Text, TextField } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";

type ReadonlyFieldProps = {
  label: string;
  placeholder?: string;
  value?: string | null;
};

export function ReadonlyField({ label, placeholder = "Chưa cập nhật", value }: ReadonlyFieldProps) {
  return (
    <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 210 }}>
      <Text size="1" weight="medium" style={{ color: authTheme.muted }}>
        {label}
      </Text>
      <TextField.Root
        placeholder={placeholder}
        readOnly
        value={value ?? ""}
        style={{
          background: "#FFFFFF",
          border: `1px solid ${authTheme.line}`,
          borderRadius: 8,
          color: authTheme.text,
          cursor: "not-allowed",
        }}
      />
    </Flex>
  );
}
