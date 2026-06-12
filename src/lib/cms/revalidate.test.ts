import { describe, expect, test } from "vitest";
import { pagePathsToRevalidate } from "./revalidate";

describe("pagePathsToRevalidate", () => {
  test("trang thường: list admin + /trang/{slug}", () => {
    expect(pagePathsToRevalidate("gioi-thieu-thuong-hieu")).toEqual([
      "/admin/pages",
      "/trang/gioi-thieu-thuong-hieu",
    ]);
  });

  test("trang chủ hệ thống: thêm /", () => {
    expect(pagePathsToRevalidate("home", { isSystem: true })).toContain("/");
  });

  test("đổi slug: revalidate cả path cũ", () => {
    expect(
      pagePathsToRevalidate("slug-moi", { previousSlug: "slug-cu" })
    ).toContain("/trang/slug-cu");
  });

  test("slug không đổi: không lặp path", () => {
    const paths = pagePathsToRevalidate("a", { previousSlug: "a" });
    expect(paths.filter((p) => p === "/trang/a")).toHaveLength(1);
  });
});
