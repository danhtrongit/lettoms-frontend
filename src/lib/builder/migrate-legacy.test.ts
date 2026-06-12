import { describe, expect, test } from "vitest";
import { legacyBlocksToPuckData, type PageBlock } from "./migrate-legacy";

describe("legacyBlocksToPuckData", () => {
  test("mảng rỗng", () => {
    expect(legacyBlocksToPuckData([])).toEqual({ root: { props: {} }, content: [] });
  });

  test("widget thường: id chuyển vào props, props giữ nguyên", () => {
    const blocks: PageBlock[] = [
      { id: "b1", type: "heading", props: { text: "Xin chào", level: "2", align: "left" } },
    ];
    expect(legacyBlocksToPuckData(blocks).content[0]).toEqual({
      type: "heading",
      props: { id: "b1", text: "Xin chào", level: "2", align: "left" },
    });
  });

  test("columns: count chuẩn hóa số, children vào column1..4, đệm cột thiếu", () => {
    const blocks: PageBlock[] = [
      {
        id: "c1",
        type: "columns",
        props: {
          count: "3",
          gap: 16,
          columns: [
            [{ id: "h1", type: "heading", props: { text: "A" } }],
            [],
          ],
        },
      },
    ];
    const out = legacyBlocksToPuckData(blocks).content[0];
    expect(out.type).toBe("columns");
    expect(out.props.count).toBe(3);
    expect(out.props.column1).toEqual([{ type: "heading", props: { id: "h1", text: "A" } }]);
    expect(out.props.column2).toEqual([]);
    expect(out.props.column3).toEqual([]);
    expect(out.props.column4).toEqual([]);
    expect(out.props).not.toHaveProperty("columns");
  });

  test("gallery/logoMarquee: string[] -> {src}[]", () => {
    const blocks: PageBlock[] = [
      { id: "g1", type: "gallery", props: { images: ["/a.jpg", "/b.jpg"], columns: "3" } },
      { id: "l1", type: "logoMarquee", props: { heading: "Đối tác", images: ["/l.png"] } },
    ];
    const [g, l] = legacyBlocksToPuckData(blocks).content;
    expect(g.props.images).toEqual([{ src: "/a.jpg" }, { src: "/b.jpg" }]);
    expect(l.props.images).toEqual([{ src: "/l.png" }]);
  });

  test("iconList: string[] -> {text}[]", () => {
    const blocks: PageBlock[] = [
      { id: "i1", type: "iconList", props: { heading: "H", items: ["Freeship", "Đổi trả"] } },
    ];
    expect(legacyBlocksToPuckData(blocks).content[0].props.items).toEqual([
      { text: "Freeship" },
      { text: "Đổi trả" },
    ]);
  });

  test("widget lạ: passthrough không vỡ", () => {
    const blocks: PageBlock[] = [{ id: "x", type: "unknownWidget", props: { foo: 1 } }];
    expect(legacyBlocksToPuckData(blocks).content[0]).toEqual({
      type: "unknownWidget",
      props: { id: "x", foo: 1 },
    });
  });

  test("biến đổi lồng trong columns (gallery trong cột)", () => {
    const blocks: PageBlock[] = [
      {
        id: "c1",
        type: "columns",
        props: { count: 2, columns: [[{ id: "g1", type: "gallery", props: { images: ["/x.jpg"] } }], []] },
      },
    ];
    const col1 = legacyBlocksToPuckData(blocks).content[0].props.column1 as { props: Record<string, unknown> }[];
    expect(col1[0].props.images).toEqual([{ src: "/x.jpg" }]);
  });
});
