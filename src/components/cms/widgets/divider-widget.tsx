export function DividerWidget({ spacing = 24 }: { spacing?: number }) {
  return (
    <div className="container-page" style={{ paddingTop: spacing, paddingBottom: spacing }}>
      <hr className="border-border" />
    </div>
  );
}
