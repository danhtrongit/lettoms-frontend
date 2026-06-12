export function SpacerWidget({ size = 48 }: { size?: number }) {
  return <div style={{ height: size }} aria-hidden />;
}
