"use client";

import { Flex, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { authTheme } from "../styles/authTheme";

export function AuthTerms() {
  return (
    <Flex
      align="start"
      gap="2"
      style={{
        justifyContent: "center",
        paddingInline: 8,
      }}
    >
      <InfoCircledIcon color={authTheme.muted} height={15} width={15} />
      <Text
        as="p"
        size="1"
        style={{ color: authTheme.muted, lineHeight: 1.4, margin: 0, textAlign: "center" }}
      >
        Tiep tuc nghia la ban dong y voi dieu khoan va chinh sach bao mat.
      </Text>
    </Flex>
  );
}
