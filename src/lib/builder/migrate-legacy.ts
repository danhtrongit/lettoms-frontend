import type { Data } from "@puckeditor/core";

/** Legacy block shape (pre-Puck). The DB column was dropped; this type lives on
 *  for the one-time migration script and historical data conversion. */
export type PageBlock = {
  id: string;
  type: string;
  props: Record<string, unknown>;
};

/** Convert legacy PageBlock[] to Puck Data. Pure function — unit-tested in Phase 3. */
export function legacyBlocksToPuckData(blocks: PageBlock[]): Data {
  return {
    root: { props: {} },
    content: blocks.map(mapBlock),
  } as Data;
}

function toSrcArray(v: unknown): { src: string }[] {
  return Array.isArray(v) ? v.filter((s) => typeof s === "string").map((src) => ({ src })) : [];
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
  if (b.type === "gallery" || b.type === "logoMarquee") {
    return {
      type: b.type,
      props: { id: b.id, ...b.props, images: toSrcArray((b.props as Record<string, unknown>).images) },
    };
  }
  if (b.type === "iconList") {
    const items = (b.props as Record<string, unknown>).items;
    return {
      type: b.type,
      props: {
        id: b.id,
        ...b.props,
        items: Array.isArray(items)
          ? items.filter((t) => typeof t === "string").map((text) => ({ text }))
          : [],
      },
    };
  }
  return { type: b.type, props: { id: b.id, ...b.props } };
}
