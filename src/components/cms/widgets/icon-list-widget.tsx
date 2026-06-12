export function IconListWidget({
  heading,
  items = [],
}: {
  heading?: string;
  items?: { text: string }[];
}) {
  return (
    <section className="container-page py-6">
      {heading && <h3 className="mb-3 text-xl font-semibold">{heading}</h3>}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-muted-foreground">
            <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-xs text-primary">
              ✓
            </span>
            {it.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
