"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import { useState } from "react";

const avatars = [
  { id: "a1", bg: "var(--indigo-9)", face: "😊" },
  { id: "a2", bg: "var(--violet-9)", face: "😎" },
  { id: "a3", bg: "var(--crimson-9)", face: "🤩" },
  { id: "a4", bg: "var(--teal-9)", face: "😇" },
  { id: "a5", bg: "var(--amber-9)", face: "🥳" },
  { id: "a6", bg: "var(--green-9)", face: "😌" },
  { id: "a7", bg: "var(--red-9)", face: "😎" },
  { id: "a8", bg: "var(--cyan-9)", face: "🤗" },
];

export function Avatar3D() {
  const [selected, setSelected] = useState(avatars[0].id);

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium" color="gray">
          Chọn Avatar
        </Text>
        <Text size="1" color="gray">
          Nhấn để chọn hình đại diện 3D của bạn
        </Text>
      </Flex>

      <Flex wrap="wrap" gap="2">
        {avatars.map((av) => (
          <Box
            key={av.id}
            onClick={() => setSelected(av.id)}
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-3)",
              background: av.bg,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: selected === av.id ? "3px solid var(--indigo-9)" : "3px solid transparent",
              transform: selected === av.id ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s",
              boxShadow: "none",
            }}
          >
            <span style={{ fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
              {av.face}
            </span>
          </Box>
        ))}
      </Flex>

      <Flex
        justify="center"
        style={{
          perspective: 600,
        }}
      >
        <Box
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: avatars.find((a) => a.id === selected)?.bg ?? "var(--indigo-9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "none",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <style>{`
            @keyframes float {
              0%, 100% { transform: rotateY(-15deg) translateY(0); }
              50% { transform: rotateY(15deg) translateY(-8px); }
            }
          `}</style>
          <span style={{ fontSize: 48, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
            {avatars.find((a) => a.id === selected)?.face}
          </span>
        </Box>
      </Flex>
    </Flex>
  );
}
