import { describe, expect, test } from "vitest";
import { menuItemsSchema } from "./cms";

describe("menuItemsSchema", () => {
  test("chấp nhận cây 2 cấp", () => {
    const items = [
      { label: "Hỗ trợ", href: "/ho-tro", children: [{ label: "FAQ", href: "/cau-hoi-thuong-gap" }] },
    ];
    expect(menuItemsSchema.safeParse(items).success).toBe(true);
  });

  test("từ chối cấp 3 (quá sâu)", () => {
    const items = [
      {
        label: "A", href: "/a",
        children: [{ label: "B", href: "/b", children: [{ label: "C", href: "/c" }] }],
      },
    ];
    expect(menuItemsSchema.safeParse(items).success).toBe(false);
  });

  test("từ chối label rỗng", () => {
    expect(menuItemsSchema.safeParse([{ label: "", href: "/x" }]).success).toBe(false);
  });
});
