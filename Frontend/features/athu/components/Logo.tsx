export function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main chat bubble */}
      <rect
        x="4"
        y="4"
        width="48"
        height="40"
        rx="12"
        fill="url(#grad1)"
      />
      {/* Bubble tail */}
      <path
        d="M8 44 L16 52 L24 44"
        fill="url(#grad1)"
      />
      {/* Person 1 (left) */}
      <circle cx="20" cy="18" r="6" fill="white" fillOpacity="0.95" />
      <path
        d="M10 36 C10 30 15 28 20 28 C25 28 30 30 30 36"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.95"
      />
      {/* Person 2 (right) */}
      <circle cx="40" cy="16" r="5" fill="white" fillOpacity="0.8" />
      <path
        d="M31 32 C31 27 35 25 40 25 C45 25 49 27 49 32"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.8"
      />
      {/* Small dots (typing indicator) */}
      <circle cx="26" cy="26" r="2.5" fill="white" fillOpacity="0.7" />
      <circle cx="32" cy="26" r="2.5" fill="white" fillOpacity="0.85" />
      <circle cx="38" cy="26" r="2.5" fill="white" fillOpacity="0.7" />
      <defs>
        <linearGradient id="grad1" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
