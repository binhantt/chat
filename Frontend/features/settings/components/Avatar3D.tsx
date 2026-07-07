"use client";

import { Avatar, Box, Flex, Text } from "@radix-ui/themes";
import { PersonIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { SettingsSection } from "./SettingsSection";

const avatars = [
  { id: "a1", color: "var(--primary)", label: "A" },
  { id: "a2", color: "#22d3ee", label: "B" },
  { id: "a3", color: "#f59e0b", label: "C" },
  { id: "a4", color: "#14B8A6", label: "D" },
  { id: "a5", color: "#8B5CF6", label: "E" },
  { id: "a6", color: "#EF4444", label: "F" },
];

export function Avatar3D() {
  const [selected, setSelected] = useState(avatars[0]);

  return (
    <SettingsSection
      description="Chon mau dai dien de xem truoc giao dien tai khoan."
      icon={<PersonIcon />}
      title="Avatar preview"
    >
      <Flex align="center" direction="column" gap="3">
        <Avatar
          fallback={selected.label}
          radius="full"
          size="8"
          style={{
            background: selected.color,
            color: "#FFFFFF",
          }}
        />
        <Text size="2" style={{ color: "var(--text-secondary)" }}>
          Mau dang chon: {selected.label}
        </Text>
      </Flex>

      <Flex gap="2" justify="center" wrap="wrap">
        {avatars.map((avatar) => (
          <Box
            aria-label={`Chon avatar ${avatar.label}`}
            key={avatar.id}
            onClick={() => setSelected(avatar)}
            role="button"
            style={{
              alignItems: "center",
              background: avatar.color,
              border:
                selected.id === avatar.id
                  ? "3px solid var(--text-primary)"
                  : "3px solid var(--chat-border)",
              borderRadius: 8,
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              fontWeight: 700,
              height: 46,
              justifyContent: "center",
              width: 46,
            }}
          >
            {avatar.label}
          </Box>
        ))}
      </Flex>
    </SettingsSection>
  );
}
