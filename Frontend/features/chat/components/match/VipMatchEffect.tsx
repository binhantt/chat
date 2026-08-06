type VipMatchEffectProps = {
  show: boolean;
};

export function VipMatchEffect({ show }: VipMatchEffectProps) {
  if (!show) return null;
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }} />;
}
