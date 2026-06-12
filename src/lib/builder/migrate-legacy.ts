import type { Data } from "@puckeditor/core";
import type { PageBlock } from "@/db/schema/cms";

/** Convert legacy PageBlock[] to Puck Data. Pure function — unit-tested in Phase 3. */
export function legacyBlocksToPuckData(blocks: PageBlock[]): Data {
  return {
    root: { props: {} },
    content: blocks.map(mapBlock),
  } as Data;
}

function mapBlock(b: PageBlock): { type: string; props: Record<string, unknown> } {
  if (b.type === "columns") {
    const props = b.props as { count?: unknown; gap?: unknown; columns?: PageBlock[][] };
    const cols = Array.isArray(props.columns) ? props.columns : [];
    const count = Math.min(Math.max(Number(props.count) || cols.length || 2, 2), 4);
    return {
      type: "columns",
      props: {
        id: b.id,
        count,
        gap: Number(props.gap) || 24,
        column1: (cols[0] ?? []).map(mapBlock),
        column2: (cols[1] ?? []).map(mapBlock),
        column3: (cols[2] ?? []).map(mapBlock),
        column4: (cols[3] ?? []).map(mapBlock),
      },
    };
  }
  return { type: b.type, props: { id: b.id, ...b.props } };
}
