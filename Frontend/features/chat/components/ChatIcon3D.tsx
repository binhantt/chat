"use client";

import { Flex } from "@radix-ui/themes";

export function ChatIcon3D({ size = 48 }: { size?: number }) {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: size,
        height: size,
        perspective: 400,
      }}
    >
      <div style={{ animation: "chatFloat 3s ease-in-out infinite" }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: "drop-shadow(0 8px 16px rgba(99,102,241,0.35))",
          }}
        >
          <rect
            x="6"
            y="6"
            width="52"
            height="42"
            rx="14"
            fill="url(#chatGrad3d)"
          />
          <path d="M10 48 L20 58 L30 48" fill="url(#chatGrad3d)" />
          <circle cx="22" cy="22" r="7" fill="white" fillOpacity="0.95" />
          <path
            d="M12 40 C12 33 17 30 22 30 C27 30 32 33 32 40"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.95"
          />
          <circle cx="42" cy="20" r="6" fill="white" fillOpacity="0.8" />
          <path
            d="M33 36 C33 30 37 27 42 27 C47 27 51 30 51 36"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.8"
          />
          <defs>
            <linearGradient id="chatGrad3d" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <style>{`
        @keyframes chatFloat {
          0%, 100% { transform: rotateY(-12deg) translateY(0px); }
          50% { transform: rotateY(12deg) translateY(-6px); }
        }
      `}</style>
    </Flex>
  );
}
