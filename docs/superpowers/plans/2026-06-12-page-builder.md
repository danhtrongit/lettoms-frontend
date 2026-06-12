# Page Builder (Elementor-like) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay builder tự chế bằng trình thiết kế kéo-thả trực quan dựa trên Puck (live preview iframe, section/columns/widget lồng nhau, 26 widget), fix lỗi thiếu `@tailwindcss/typography` + 4 bug liên quan, migrate dữ liệu trang hiện có, và thêm admin quản lý Menu.

**Architecture:** Puck (`@puckeditor/core` ~0.21.3) làm editor shell tại route fullscreen `/admin/pages/[id]/builder` (route group `(builder)` riêng, không sidebar admin — `SiteChrome` đã tự bỏ chrome cho `/admin/*`). Dữ liệu trang lưu Puck `Data` JSON vào cột mới `pages.content` (jsonb); cột `blocks` cũ giữ làm backup đến cleanup cuối. Hai config: `config.client.tsx` (editor — fields + render client, commerce widget fetch `/api/widgets/*`) và `config.server.tsx` (render-only cho `<Render>` RSC trên trang công khai — commerce widget query DB trực tiếp). Component render UI dùng chung ở `src/components/cms/widgets/`.

**Tech Stack:** Next.js 16.2.9 (App Router, params là Promise, `middleware`→`proxy`), React 19, Tailwind v4 (config bằng CSS), Puck ~0.21.3, Tiptap 3 (giữ pipeline richtext hiện có), Drizzle + PostgreSQL, zod 4, vitest (thêm mới).

**Spec:** `docs/superpowers/specs/2026-06-12-page-builder-design.md`

## Quy ước bắt buộc

- **ĐỌC TRƯỚC KHI VIẾT CODE:** `node_modules/next/dist/docs/` — dự án dùng bản Next có breaking changes (xem `AGENTS.md`). Đặc biệt: `params` là `Promise` phải `await`; file convention `proxy` thay `middleware`.
- Puck import từ **`@puckeditor/core`** (scope mới), KHÔNG phải `@measured/puck` (docs cũ trên web vẫn ghi scope cũ — đổi import cho đúng).
- Tailwind v4: KHÔNG dùng template string class (`grid-cols-${n}`) — dùng map class literal hoặc inline style.
- Mọi server action phải gọi `requireStaff()` ở dòng đầu.
- UI text tiếng Việt, code identifiers tiếng Anh (theo codebase hiện tại).
- Commit sau mỗi task. Chạy `npx tsc --noEmit` trước mỗi commit.

## Bản đồ file

```
TẠO MỚI
  vitest.config.ts
  src/lib/cms/revalidate.ts                  # pure helper các path cần revalidate + tests
  src/lib/builder/types.ts                   # WidgetType union, PuckData re-export
  src/lib/builder/migrate-legacy.ts          # PageBlock[] -> Puck Data (pure) + tests
  src/lib/builder/config.client.tsx          # Puck Config cho editor (client)
  src/lib/builder/config.server.tsx          # Config render-only cho <Render> (RSC)
  src/lib/builder/fields/image-field.tsx     # custom field bọc MediaPicker
  src/lib/builder/fields/richtext-field.tsx  # custom field bọc RichTextEditor (Tiptap)
  src/components/builder/page-editor.tsx     # <Puck> + header actions + viewports
  src/components/cms/widgets/*.tsx           # ~22 file widget render dùng chung
  src/app/(builder)/admin/pages/[id]/builder/{layout,page}.tsx   # builder fullscreen
  src/app/(content)/xem-truoc/[id]/page.tsx  # preview trang nháp (staff-only)
  src/app/api/widgets/{products,categories,articles}/route.ts    # data cho editor preview
  src/server/actions/builder.ts              # savePageContentAction, savePageSettingsAction
  src/lib/repos/menus.repo.ts                # getMenu/saveMenu + fallback
  src/server/actions/menus.ts                # saveMenuAction
  src/components/admin/menu-editor.tsx       # UI cây menu, dnd-kit reorder
  src/app/(admin)/admin/menus/page.tsx
  scripts/migrate-pages-to-puck.ts           # backfill blocks -> content
SỬA
  package.json, src/app/globals.css          # typography plugin, deps, scripts test
  src/db/schema/cms.ts                       # + cột content jsonb
  src/server/actions/pages.ts                # fix revalidate, guard isSystem
  src/lib/repos/pages.repo.ts                # guard isSystem, listPublishedPagesForSitemap
  src/app/sitemap.ts                         # + trang CMS
  src/middleware.ts -> src/proxy.ts          # rename theo deprecation, + matcher /xem-truoc
  src/app/(content)/trang/[slug]/page.tsx    # render content (Puck) || blocks (legacy)
  src/app/page.tsx                           # render content (Puck) || blocks (legacy)
  src/app/(admin)/admin/pages/page.tsx       # nút "Thiết kế"
  src/app/(admin)/admin/pages/new/page.tsx   # form gọn tạo draft -> redirect builder
  src/app/(admin)/admin/pages/[id]/page.tsx  # trang cài đặt (settings) thay builder cũ
  src/components/admin/admin-sidebar.tsx     # + mục Menu
  src/db/seed/index.ts                       # seed Puck Data + seed menus
  src/components/layout/site-footer.tsx, desktop-nav.tsx, site-header.tsx  # menu từ DB
XÓA (Phase 7 cleanup)
  src/components/admin/page-builder.tsx
  src/components/cms/widget-renderer.tsx
  src/lib/cms/widgets.ts (sau khi builder mới phủ hết)
  cột pages.blocks (migration riêng, chạy sau khi verify)
```

---

# PHASE 0 — Nền móng & fix bug (ship được độc lập)

### Task 0.1: Cài vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Cài đặt**

```bash
npm install -D vitest
```

- [ ] **Step 2: Tạo `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Thêm scripts vào `package.json`** (trong `"scripts"`, sau `"db:seed"`)

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Smoke test** — tạo tạm `src/lib/smoke.test.ts` với `import { expect, test } from "vitest"; test("smoke", () => expect(1).toBe(1));`, chạy `npm test` → PASS, rồi xóa file.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for unit testing"
```

### Task 0.2: Fix lỗi thiếu Tailwind Typography (yêu cầu gốc của user)

**Files:**
- Modify: `src/app/globals.css:1-3`
- Modify: `package.json`

Bối cảnh: editor (`rich-text-editor.tsx:48` dùng `prose prose-sm`) và `RichTextContent` (`prose prose-neutral`) đều dựa vào plugin `@tailwindcss/typography` nhưng plugin chưa cài → mọi tag H1/H2/p/ul/blockquote trong editor + bài viết + trang CMS hiển thị không style.

- [ ] **Step 1: Cài plugin**

```bash
npm install -D @tailwindcss/typography
```

- [ ] **Step 2: Đăng ký plugin trong `src/app/globals.css`** — Tailwind v4 dùng directive `@plugin` trong CSS (không có tailwind.config). Sửa 3 dòng đầu thành:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: Verify bằng dev server** — chạy `npm run dev`, mở 1 bài viết có heading/list (hoặc `/admin/articles` editor). Kiểm tra h2/ul trong `.prose` có margin/font-size khác biệt rõ với text thường. Cách kiểm nhanh không cần mắt: `curl -s http://localhost:3000/ | head -1` để chắc app chạy, rồi kiểm tra CSS đã sinh class prose:

```bash
grep -rl "prose" .next/static/css/ | head -1 && grep -o "\.prose :where(h2)[^{]*" $(grep -rl "prose" .next/static/css/ | head -1) | head -3
```

Expected: in ra selector `.prose :where(h2)...` (plugin đã sinh CSS).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/app/globals.css
git commit -m "fix: add missing @tailwindcss/typography plugin for prose content"
```

### Task 0.3: Fix revalidatePath sai + helper thuần (TDD)

**Files:**
- Create: `src/lib/cms/revalidate.ts`
- Test: `src/lib/cms/revalidate.test.ts`
- Modify: `src/server/actions/pages.ts`

Bối cảnh: `savePageAction` đang gọi `revalidatePath(\`/${parsed.data.slug}\`)` — path không tồn tại (route thật là `/trang/[slug]`); trang chủ (slug `home`, render tại `/`) cũng không được revalidate → **sửa trang xong public không cập nhật**.

- [ ] **Step 1: Viết test fail** — `src/lib/cms/revalidate.test.ts`

```ts
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
```

- [ ] **Step 2: Chạy test, verify fail**

Run: `npx vitest run src/lib/cms/revalidate.test.ts`
Expected: FAIL — "Cannot find module './revalidate'"

- [ ] **Step 3: Implement** — `src/lib/cms/revalidate.ts`

```ts
/**
 * Pure helper: which paths must be revalidated after a page mutation.
 * Public CMS pages live at /trang/[slug]; the system "home" page renders at /.
 */
export function pagePathsToRevalidate(
  slug: string,
  opts: { isSystem?: boolean; previousSlug?: string } = {}
): string[] {
  const paths = ["/admin/pages", `/trang/${slug}`];
  if (opts.previousSlug && opts.previousSlug !== slug) {
    paths.push(`/trang/${opts.previousSlug}`);
  }
  if (opts.isSystem && slug === "home") {
    paths.push("/");
  }
  return paths;
}
```

- [ ] **Step 4: Chạy test, verify pass**

Run: `npx vitest run src/lib/cms/revalidate.test.ts`
Expected: 4 passed

- [ ] **Step 5: Dùng helper trong `src/server/actions/pages.ts`** — thay toàn bộ thân `savePageAction` phần sau validate:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { pageInputSchema } from "@/lib/validators/cms";
import { pagePathsToRevalidate } from "@/lib/cms/revalidate";
import {
  createPage,
  updatePage,
  deletePage,
  getPageAdmin,
} from "@/lib/repos/pages.repo";
import type { ActionResult } from "./catalog";

export async function savePageAction(
  id: string | null,
  raw: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = pageInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    let pageId = id;
    let previousSlug: string | undefined;
    let isSystem = false;
    if (id) {
      const existing = await getPageAdmin(id);
      previousSlug = existing?.slug;
      isSystem = existing?.isSystem ?? false;
      await updatePage(id, parsed.data);
    } else {
      pageId = await createPage(parsed.data);
    }
    for (const path of pagePathsToRevalidate(parsed.data.slug, { isSystem, previousSlug })) {
      revalidatePath(path);
    }
    return { ok: true, id: pageId ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
```

(giữ nguyên `deletePageAction` — Task 0.4 sửa tiếp)

- [ ] **Step 6: Typecheck + test + commit**

```bash
npx tsc --noEmit && npm test
git add src/lib/cms/revalidate.ts src/lib/cms/revalidate.test.ts src/server/actions/pages.ts
git commit -m "fix: revalidate correct public paths (/trang/[slug], /) after page save"
```

### Task 0.4: Guard trang isSystem (chặn xóa / đổi slug trang chủ)

**Files:**
- Modify: `src/lib/repos/pages.repo.ts`
- Modify: `src/server/actions/pages.ts`

Bối cảnh: flag `isSystem` hiện không được kiểm tra ở đâu — admin có thể xóa hoặc đổi slug trang `home`, làm trang chủ âm thầm rơi về layout fallback hardcode.

- [ ] **Step 1: Guard trong repo** — sửa `updatePage` và `deletePage` trong `src/lib/repos/pages.repo.ts`:

```ts
export async function updatePage(id: string, input: PageInput): Promise<void> {
  const existing = await getPageAdmin(id);
  if (!existing) throw new Error("Trang không tồn tại");
  // System pages (e.g. homepage) keep their slug — other code addresses them by it.
  const slug = existing.isSystem ? existing.slug : input.slug;
  await db
    .update(pages)
    .set({
      slug,
      title: input.title,
      status: input.status,
      blocks: processBlocks(input.blocks as PageBlock[]),
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id));
}

export async function deletePage(id: string): Promise<void> {
  const existing = await getPageAdmin(id);
  if (existing?.isSystem) {
    throw new Error("Không thể xóa trang hệ thống");
  }
  await db.delete(pages).where(eq(pages.id, id));
}
```

- [ ] **Step 2: Ẩn nút xóa ở UI** — trong `src/components/admin/page-row-actions.tsx`: đọc file, thêm prop `isSystem: boolean` truyền từ `src/app/(admin)/admin/pages/page.tsx` (row có sẵn field), bọc item Delete trong `{!isSystem && (...)}`.

- [ ] **Step 3: Verify thủ công** — `npm run dev`, vào `/admin/pages`: hàng "Trang chủ" không còn nút xóa; gọi thử đổi slug trang home qua form sửa → lưu xong slug vẫn là `home`.

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/lib/repos/pages.repo.ts src/components/admin/page-row-actions.tsx "src/app/(admin)/admin/pages/page.tsx" src/server/actions/pages.ts
git commit -m "fix: protect system pages from deletion and slug changes"
```

### Task 0.5: Sitemap bổ sung trang CMS

**Files:**
- Modify: `src/lib/repos/pages.repo.ts`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Repo function** — thêm vào `src/lib/repos/pages.repo.ts`:

```ts
export async function listPublishedPagesForSitemap(): Promise<
  { slug: string; updatedAt: Date; isSystem: boolean }[]
> {
  return db
    .select({ slug: pages.slug, updatedAt: pages.updatedAt, isSystem: pages.isSystem })
    .from(pages)
    .where(eq(pages.status, "published"));
}
```

- [ ] **Step 2: Sửa `src/app/sitemap.ts`** — thêm import + fetch song song + routes. Trong `Promise.all` thêm `listPublishedPagesForSitemap()` (import từ `@/lib/repos/pages.repo`), rồi trước `return` thêm:

```ts
  const cmsPageRoutes = cmsPages
    .filter((p) => !p.isSystem) // home đã có ở staticRoutes ("")
    .map((p) => ({
      url: `${base}/trang/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
```

và thêm `...cmsPageRoutes` vào mảng return.

- [ ] **Step 3: Verify** — `npm run dev` rồi `curl -s http://localhost:3000/sitemap.xml | grep "/trang/"` → có URL trang CMS đã publish (nếu DB seed có trang ngoài home thì thấy; tối thiểu không lỗi 500).

- [ ] **Step 4: Commit**

```bash
git add src/lib/repos/pages.repo.ts src/app/sitemap.ts
git commit -m "fix: include published CMS pages in sitemap"
```

### Task 0.6: Rename middleware → proxy (deprecation Next 16.2.9)

**Files:**
- Rename: `src/middleware.ts` → `src/proxy.ts`

- [ ] **Step 1: Đọc doc trước** — `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` để xác nhận convention (file `proxy.ts`, export default + `config.matcher` giữ nguyên cách hoạt động).

- [ ] **Step 2: Rename + thêm matcher cho preview route (dùng ở Phase 1)**

```bash
git mv src/middleware.ts src/proxy.ts
```

Sửa `src/proxy.ts`: trong matcher thêm `"/xem-truoc/:path*"`, và trong logic gate thêm sau block `/admin`:

```ts
  // Draft preview: staff/admin only
  if (path.startsWith("/xem-truoc")) {
    if (!isLoggedIn) {
      const url = new URL("/dang-nhap", nextUrl);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isStaff) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }
```

```ts
export const config = {
  matcher: ["/admin/:path*", "/tai-khoan/:path*", "/dang-nhap", "/dang-ky", "/xem-truoc/:path*"],
};
```

- [ ] **Step 3: Verify** — `npm run build` không còn warning deprecation về middleware; chạy dev, truy cập `/admin` khi chưa login → vẫn redirect `/dang-nhap`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: rename middleware to proxy per Next 16 deprecation, gate /xem-truoc"
```

---

# PHASE 1 — Puck foundation (editor mở được, lưu được, render được)

### Task 1.1: Cài Puck + cột `content` + types

**Files:**
- Modify: `package.json`, `src/db/schema/cms.ts`
- Create: `src/lib/builder/types.ts`, drizzle migration (tự sinh)

- [ ] **Step 1: Cài Puck (pin minor — 0.x có breaking changes)**

```bash
npm install @puckeditor/core@~0.21.3
```

- [ ] **Step 2: Thêm cột `content`** — trong `src/db/schema/cms.ts`, thêm import type và cột (sau `blocks`):

```ts
import type { Data } from "@puckeditor/core";
```

```ts
  // New Puck-based builder data. `blocks` is the legacy format, kept until
  // the final cleanup migration; pages with non-null `content` use Puck.
  content: jsonb("content").$type<Data>(),
```

- [ ] **Step 3: Sinh + chạy migration**

```bash
npm run db:generate   # tạo file drizzle/00XX_*.sql — kiểm tra chỉ có ALTER TABLE "pages" ADD COLUMN "content" jsonb
npm run db:migrate
```

- [ ] **Step 4: Tạo `src/lib/builder/types.ts`**

```ts
import type { Data } from "@puckeditor/core";

/** Every widget key available in the builder. Single source of truth. */
export const WIDGET_TYPES = [
  // layout
  "section", "columns", "spacer", "divider",
  // basic
  "heading", "richText", "button", "iconList", "faqAccordion", "testimonial",
  // media
  "hero", "heroCarousel", "bannerImage", "image", "gallery", "videoEmbed", "logoMarquee",
  // commerce
  "productGrid", "productCarousel", "featuredCategories", "categoryTiles",
  // marketing
  "countdown", "newsletter", "promoBanner", "articleStrip", "htmlEmbed",
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export type PuckData = Data;
```

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit
git add package.json package-lock.json src/db/schema/cms.ts src/lib/builder/types.ts drizzle/
git commit -m "feat(builder): install puck, add pages.content column and widget type union"
```

### Task 1.2: API routes cấp data cho editor preview

**Files:**
- Create: `src/app/api/widgets/products/route.ts`, `src/app/api/widgets/categories/route.ts`, `src/app/api/widgets/articles/route.ts`

Bối cảnh: trong iframe editor (client), các widget commerce không gọi được repo DB trực tiếp — cần API mỏng. Data này vốn công khai (hiển thị trên trang public) nên không cần auth.

- [ ] **Step 1: `src/app/api/widgets/products/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getFeaturedProducts } from "@/lib/api/products";
import type { ProductFlag } from "@/types";

const FLAGS: ProductFlag[] = ["new", "bestseller", "sale", "limited"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const flagParam = url.searchParams.get("flag") ?? "bestseller";
  const flag = (FLAGS.includes(flagParam as ProductFlag) ? flagParam : "bestseller") as ProductFlag;
  const limit = Math.min(Number(url.searchParams.get("limit")) || 4, 24);
  const products = await getFeaturedProducts(flag, limit);
  return NextResponse.json({ data: products });
}
```

- [ ] **Step 2: `src/app/api/widgets/categories/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import type { Gender } from "@/types";

const GENDERS: Gender[] = ["nu", "nam", "tre-em", "em-be"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const genderParam = url.searchParams.get("gender") ?? "nu";
  const gender = (GENDERS.includes(genderParam as Gender) ? genderParam : "nu") as Gender;
  const cats = await getCategoriesByGenderDb(gender);
  return NextResponse.json({ data: cats });
}
```

- [ ] **Step 3: `src/app/api/widgets/articles/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getArticles } from "@/lib/api/articles";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 3, 12);
  const articles = await getArticles();
  return NextResponse.json({ data: articles.slice(0, limit) });
}
```

(Nếu chữ ký `getArticles`/`getFeaturedProducts` khác — đọc `src/lib/api/products.ts`, `src/lib/api/articles.ts` và chỉnh tham số cho khớp.)

- [ ] **Step 4: Verify** — `npm run dev` rồi:

```bash
curl -s "http://localhost:3000/api/widgets/products?flag=new&limit=2" | head -c 200
```

Expected: JSON `{"data":[...]}` có sản phẩm.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/widgets
git commit -m "feat(builder): widget data API routes for editor preview"
```

### Task 1.3: Custom fields — image (MediaPicker) và richtext (Tiptap)

**Files:**
- Create: `src/lib/builder/fields/image-field.tsx`, `src/lib/builder/fields/richtext-field.tsx`

- [ ] **Step 1: `src/lib/builder/fields/image-field.tsx`** — Puck custom field nhận `{ value, onChange }`:

```tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, XIcon } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Puck custom-field UI for picking an image from the media library
 * (or pasting a URL directly). Value is the image URL string.
 */
export function ImageFieldUi({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          <Image src={value} alt="" fill sizes="300px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
            title="Xóa ảnh"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <MediaPicker
          trigger={
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <ImageIcon className="size-3.5" /> Chọn ảnh
            </Button>
          }
          onSelect={(urls) => urls[0] && onChange(urls[0])}
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="hoặc dán URL ảnh"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}

/** Reusable Puck field config: { type: "custom", render: ... } */
export const imageField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) => (
    <ImageFieldUi value={value} onChange={onChange} />
  ),
});
```

- [ ] **Step 2: `src/lib/builder/fields/richtext-field.tsx`** — bọc `RichTextEditor` Tiptap có sẵn (giữ nguyên format dữ liệu `JSONContent`):

```tsx
"use client";

import type { JSONContent } from "@tiptap/core";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export const richTextField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({
    value,
    onChange,
  }: {
    value: JSONContent | null | undefined;
    onChange: (v: JSONContent) => void;
  }) => (
    <RichTextEditor value={value ?? null} onChange={onChange} placeholder="Nhập nội dung…" />
  ),
});
```

- [ ] **Step 3: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/lib/builder/fields
git commit -m "feat(builder): image and richtext custom fields for Puck"
```

### Task 1.4: Config skeleton + 4 widget đầu (heading, spacer, divider, button)

**Files:**
- Create: `src/components/cms/widgets/heading-widget.tsx`, `spacer-widget.tsx`, `divider-widget.tsx`, `button-widget.tsx`
- Create: `src/lib/builder/config.client.tsx`, `src/lib/builder/config.server.tsx`

Mẫu kiến trúc cho MỌI widget về sau: component render thuần (props đã typed) ở `src/components/cms/widgets/`, hai config chỉ khai fields/render.

- [ ] **Step 1: 4 component render** — copy logic từ `src/components/cms/widget-renderer.tsx` (case tương ứng), chuyển sang props typed. `src/components/cms/widgets/heading-widget.tsx`:

```tsx
import { cn } from "@/lib/utils";

const SIZES: Record<string, string> = {
  "1": "text-4xl sm:text-5xl",
  "2": "text-3xl sm:text-4xl",
  "3": "text-2xl sm:text-3xl",
  "4": "text-xl sm:text-2xl",
};
const ALIGN: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function HeadingWidget({
  text,
  level = "2",
  align = "left",
}: {
  text: string;
  level?: string;
  align?: string;
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return (
    <section className="container-page py-4">
      <Tag className={cn("font-semibold tracking-tight", SIZES[level], ALIGN[align])}>
        {text}
      </Tag>
    </section>
  );
}
```

`src/components/cms/widgets/spacer-widget.tsx`:

```tsx
export function SpacerWidget({ size = 48 }: { size?: number }) {
  return <div style={{ height: size }} aria-hidden />;
}
```

`src/components/cms/widgets/divider-widget.tsx`:

```tsx
export function DividerWidget({ spacing = 24 }: { spacing?: number }) {
  return (
    <div className="container-page" style={{ paddingTop: spacing, paddingBottom: spacing }}>
      <hr className="border-border" />
    </div>
  );
}
```

`src/components/cms/widgets/button-widget.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonWidget({
  label,
  href,
  variant = "default",
  align = "left",
}: {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
  align?: string;
}) {
  return (
    <section
      className={cn("container-page flex py-4", {
        "justify-start": align === "left",
        "justify-center": align === "center",
        "justify-end": align === "right",
      })}
    >
      <Button asChild variant={variant} className="rounded-full">
        <Link href={href || "/"}>{label || "Xem thêm"}</Link>
      </Button>
    </section>
  );
}
```

- [ ] **Step 2: `src/lib/builder/config.client.tsx`** — Config editor với categories + 4 widget:

```tsx
"use client";

import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";

const ALIGN_OPTIONS = [
  { label: "Trái", value: "left" },
  { label: "Giữa", value: "center" },
  { label: "Phải", value: "right" },
];

export const clientConfig: Config = {
  categories: {
    layout: { title: "Bố cục", components: ["spacer", "divider"] },
    basic: { title: "Cơ bản", components: ["heading", "button"] },
    media: { title: "Media", components: [] },
    commerce: { title: "Thương mại", components: [] },
    marketing: { title: "Marketing", components: [] },
  },
  components: {
    heading: {
      label: "Tiêu đề",
      fields: {
        text: { type: "text", label: "Nội dung", contentEditable: true },
        level: {
          type: "select",
          label: "Cấp",
          options: [
            { label: "H1", value: "1" },
            { label: "H2", value: "2" },
            { label: "H3", value: "3" },
            { label: "H4", value: "4" },
          ],
        },
        align: { type: "select", label: "Căn lề", options: ALIGN_OPTIONS },
      },
      defaultProps: { text: "Tiêu đề", level: "2", align: "left" },
      render: ({ text, level, align }) => (
        <HeadingWidget text={text} level={level} align={align} />
      ),
    },
    spacer: {
      label: "Khoảng trống",
      fields: { size: { type: "number", label: "Chiều cao (px)", min: 0 } },
      defaultProps: { size: 48 },
      render: ({ size }) => <SpacerWidget size={size} />,
    },
    divider: {
      label: "Đường kẻ",
      fields: { spacing: { type: "number", label: "Khoảng cách trên/dưới (px)", min: 0 } },
      defaultProps: { spacing: 24 },
      render: ({ spacing }) => <DividerWidget spacing={spacing} />,
    },
    button: {
      label: "Nút bấm",
      fields: {
        label: { type: "text", label: "Nhãn" },
        href: { type: "text", label: "Liên kết" },
        variant: {
          type: "select",
          label: "Kiểu",
          options: [
            { label: "Chính", value: "default" },
            { label: "Viền", value: "outline" },
            { label: "Phụ", value: "secondary" },
          ],
        },
        align: { type: "select", label: "Căn lề", options: ALIGN_OPTIONS },
      },
      defaultProps: { label: "Mua ngay", href: "/nu", variant: "default", align: "left" },
      render: ({ label, href, variant, align }) => (
        <ButtonWidget label={label} href={href} variant={variant} align={align} />
      ),
    },
  },
  root: {
    render: ({ children }) => <div className="py-2">{children}</div>,
  },
};
```

Lưu ý: nếu `contentEditable` không tồn tại ở text field phiên bản này (kiểm tra `node_modules/@puckeditor/core/dist/index.d.ts`), bỏ option đó — inline editing là nice-to-have.

- [ ] **Step 3: `src/lib/builder/config.server.tsx`** — render-only cho `<Render>` (RSC, không "use client", không fields):

```tsx
import type { Config } from "@puckeditor/core";
import { HeadingWidget } from "@/components/cms/widgets/heading-widget";
import { SpacerWidget } from "@/components/cms/widgets/spacer-widget";
import { DividerWidget } from "@/components/cms/widgets/divider-widget";
import { ButtonWidget } from "@/components/cms/widgets/button-widget";

/**
 * Render-only config for the public site (<Render> in RSC).
 * MUST define the same component keys as config.client.tsx —
 * commerce widgets here query the DB directly instead of fetching APIs.
 */
export const serverConfig: Config = {
  components: {
    heading: { render: ({ text, level, align }) => <HeadingWidget text={text} level={level} align={align} /> },
    spacer: { render: ({ size }) => <SpacerWidget size={size} /> },
    divider: { render: ({ spacing }) => <DividerWidget spacing={spacing} /> },
    button: { render: ({ label, href, variant, align }) => <ButtonWidget label={label} href={href} variant={variant} align={align} /> },
  },
  root: {
    render: ({ children }) => <div className="py-2">{children}</div>,
  },
};
```

(Nếu type `Config` bắt buộc `fields` — kiểm tra d.ts; Puck cho phép component không có fields. Nếu RSC entry riêng tồn tại — `@puckeditor/core/rsc` — dùng `<Render>` từ đó ở Task 1.7.)

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/components/cms/widgets src/lib/builder
git commit -m "feat(builder): puck client/server configs with first 4 widgets"
```

### Task 1.5: Server actions lưu content

**Files:**
- Create: `src/server/actions/builder.ts`
- Modify: `src/lib/validators/cms.ts`, `src/lib/repos/pages.repo.ts`

- [ ] **Step 1: Zod schema cho Puck Data** — thêm vào cuối phần "Page builder" của `src/lib/validators/cms.ts` (zod 4 — dùng `z.looseObject` để passthrough props/slots lồng nhau):

```ts
const componentDataSchema = z.looseObject({
  type: z.string(),
  props: z.looseObject({ id: z.string() }),
});

export const puckDataSchema = z.looseObject({
  root: z.looseObject({}).default({}),
  content: z.array(componentDataSchema).default([]),
  zones: z.record(z.string(), z.array(componentDataSchema)).optional(),
});

export type PuckDataInput = z.infer<typeof puckDataSchema>;
```

- [ ] **Step 2: Repo update content** — thêm vào `src/lib/repos/pages.repo.ts`:

```ts
import type { Data } from "@puckeditor/core";
```

```ts
export async function updatePageContent(
  id: string,
  content: Data,
  status: "draft" | "published"
): Promise<void> {
  await db
    .update(pages)
    .set({ content, status, updatedAt: new Date() })
    .where(eq(pages.id, id));
}
```

- [ ] **Step 3: `src/server/actions/builder.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import type { Data } from "@puckeditor/core";
import { requireStaff } from "@/lib/auth/rbac";
import { puckDataSchema } from "@/lib/validators/cms";
import { pagePathsToRevalidate } from "@/lib/cms/revalidate";
import { getPageAdmin, updatePageContent } from "@/lib/repos/pages.repo";
import type { ActionResult } from "./catalog";

export async function savePageContentAction(
  id: string,
  rawData: unknown,
  status: "draft" | "published"
): Promise<ActionResult> {
  await requireStaff();
  const parsed = puckDataSchema.safeParse(rawData);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu trang không hợp lệ" };
  }
  try {
    const page = await getPageAdmin(id);
    if (!page) return { ok: false, error: "Trang không tồn tại" };
    await updatePageContent(id, parsed.data as Data, status);
    for (const path of pagePathsToRevalidate(page.slug, { isSystem: page.isSystem })) {
      revalidatePath(path);
    }
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
```

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/lib/validators/cms.ts src/lib/repos/pages.repo.ts src/server/actions/builder.ts
git commit -m "feat(builder): savePageContentAction with puck data validation"
```

### Task 1.6: Migrate-on-open + route builder fullscreen + PageEditor

**Files:**
- Create: `src/lib/builder/migrate-legacy.ts` (phiên bản tối thiểu — Phase 3 mở rộng + test đầy đủ)
- Create: `src/components/builder/page-editor.tsx`
- Create: `src/app/(builder)/admin/pages/[id]/builder/layout.tsx`, `.../builder/page.tsx`

- [ ] **Step 1: `src/lib/builder/migrate-legacy.ts`** — bản tối thiểu để mở trang cũ trong builder (Phase 3 sẽ TDD đầy đủ các biến đổi):

```ts
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
```

- [ ] **Step 2: `src/components/builder/page-editor.tsx`**

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Puck, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import type { Data } from "@puckeditor/core";
import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { clientConfig } from "@/lib/builder/config.client";
import { savePageContentAction } from "@/server/actions/builder";
import { Button } from "@/components/ui/button";

const usePuck = createUsePuck();

interface PageEditorProps {
  page: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published";
    data: Data;
  };
}

function HeaderActions({ page }: PageEditorProps) {
  const appState = usePuck((s) => s.appState);
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const save = async (status: "draft" | "published") => {
    setSaving(true);
    const res = await savePageContentAction(page.id, appState.data, status);
    setSaving(false);
    if (res.ok) {
      toast.success(status === "published" ? "Đã xuất bản" : "Đã lưu nháp");
      router.refresh();
    } else {
      toast.error(res.error ?? "Lưu thất bại");
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/xem-truoc/${page.id}`} target="_blank">
          Xem trước
        </Link>
      </Button>
      <Button variant="outline" size="sm" disabled={saving} onClick={() => save("draft")}>
        Lưu nháp
      </Button>
      <Button size="sm" disabled={saving} onClick={() => save("published")}>
        Xuất bản
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/pages/${page.id}`}>Thoát</Link>
      </Button>
    </>
  );
}

export function PageEditor({ page }: PageEditorProps) {
  return (
    <div className="h-dvh">
      <Puck
        config={clientConfig}
        data={page.data}
        viewports={[
          { width: 375, label: "Mobile", icon: <SmartphoneIcon className="size-4" /> },
          { width: 768, label: "Tablet", icon: <TabletIcon className="size-4" /> },
          { width: 1280, label: "Desktop", icon: <MonitorIcon className="size-4" /> },
        ]}
        overrides={{
          headerActions: () => <HeaderActions page={page} />,
        }}
      />
    </div>
  );
}
```

Lưu ý khi implement: đối chiếu `node_modules/@puckeditor/core/dist/index.d.ts` — tên API `createUsePuck`, shape `overrides.headerActions`, prop `viewports` phải khớp đúng phiên bản; nếu lệch, ưu tiên d.ts.

- [ ] **Step 3: Route group `(builder)`** — `src/app/(builder)/admin/pages/[id]/builder/layout.tsx`:

```tsx
import { requireStaff } from "@/lib/auth/rbac";

export const metadata = {
  title: "Trình thiết kế trang",
  robots: { index: false, follow: false },
};

export default async function BuilderLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return <>{children}</>;
}
```

`src/app/(builder)/admin/pages/[id]/builder/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getPageAdmin } from "@/lib/repos/pages.repo";
import { legacyBlocksToPuckData } from "@/lib/builder/migrate-legacy";
import { PageEditor } from "@/components/builder/page-editor";
import type { Data } from "@puckeditor/core";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageAdmin(id);
  if (!page) notFound();

  // Pages not yet migrated open with their legacy blocks converted on the fly.
  const data: Data = page.content ?? legacyBlocksToPuckData(page.blocks);

  return (
    <PageEditor
      page={{ id: page.id, title: page.title, slug: page.slug, status: page.status, data }}
    />
  );
}
```

- [ ] **Step 4: Verify thủ công** — `npm run dev`, login staff, vào `/admin/pages`, lấy id 1 trang, mở `/admin/pages/{id}/builder`:
  - Editor Puck fullscreen hiện (không sidebar admin, không header shop)
  - Trang home cũ mở được: các block legacy hiện trong canvas (widget chưa port sẽ trống — OK ở phase này, heading/spacer/divider/button hiện đúng)
  - Kéo "Tiêu đề" từ palette vào canvas → render ngay trong iframe; sửa text ở panel phải → cập nhật live
  - Bấm "Lưu nháp" → toast thành công; reload → dữ liệu còn nguyên (cột `content` đã có data)
  - **Kiểm tra iframe style:** heading trong canvas phải đúng font Pangea + màu. Nếu font sai: thêm wrapper vào `root.render` của `config.client.tsx`: đọc doc `node_modules/@puckeditor/core` về `iframe`/`injectGlobalCss`, hoặc set `style={{ fontFamily: "var(--font-sans)" }}` fallback.

- [ ] **Step 5: Commit**

```bash
git add src/lib/builder src/components/builder "src/app/(builder)"
git commit -m "feat(builder): fullscreen Puck editor route with save draft/publish"
```

### Task 1.7: Render công khai bằng `<Render>` + preview nháp

**Files:**
- Modify: `src/app/(content)/trang/[slug]/page.tsx`, `src/app/page.tsx`
- Create: `src/app/(content)/xem-truoc/[id]/page.tsx`

- [ ] **Step 1: Component render chuyển tiếp** — trong `src/app/(content)/trang/[slug]/page.tsx`, thay phần return:

```tsx
import { Render } from "@puckeditor/core/rsc";
import { serverConfig } from "@/lib/builder/config.server";
```

(nếu entry `/rsc` không tồn tại trong package — kiểm tra `node_modules/@puckeditor/core/package.json` exports — dùng `import { Render } from "@puckeditor/core"`)

```tsx
export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  if (page.content) {
    return <Render config={serverConfig} data={page.content} />;
  }
  // Legacy pages not yet migrated
  return (
    <div className="py-2">
      <WidgetRenderer blocks={page.blocks} />
    </div>
  );
}
```

- [ ] **Step 2: Trang chủ** — `src/app/page.tsx`, thay block đầu tương tự:

```tsx
  const homePage = await getPublishedPageBySlug("home");
  if (homePage?.content) {
    return <Render config={serverConfig} data={homePage.content} />;
  }
  if (homePage && homePage.blocks.length > 0) {
    return (
      <div className="py-2">
        <WidgetRenderer blocks={homePage.blocks} />
      </div>
    );
  }
```

(thêm 2 import như Step 1)

- [ ] **Step 3: Preview nháp** — `src/app/(content)/xem-truoc/[id]/page.tsx` (URL không bắt đầu `/admin` → có site chrome thật; proxy.ts đã gate staff ở Task 0.6, vẫn `requireStaff()` phòng thủ):

```tsx
import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { requireStaff } from "@/lib/auth/rbac";
import { getPageAdmin } from "@/lib/repos/pages.repo";
import { legacyBlocksToPuckData } from "@/lib/builder/migrate-legacy";
import { serverConfig } from "@/lib/builder/config.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Xem trước",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const page = await getPageAdmin(id);
  if (!page) notFound();

  const data = page.content ?? legacyBlocksToPuckData(page.blocks);

  return (
    <>
      <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
        Bản xem trước — {page.status === "draft" ? "trang nháp" : "có thể chứa thay đổi chưa xuất bản"}
      </div>
      <Render config={serverConfig} data={data} />
    </>
  );
}
```

- [ ] **Step 4: Verify** — trong builder sửa heading + "Lưu nháp", mở "Xem trước" → thấy thay đổi với site chrome đầy đủ; trang public `/trang/{slug}` CHƯA đổi (vì lưu nháp giữ status... lưu ý: nếu trang đang published mà bấm Lưu nháp thì status về draft và public 404 — đây là hành vi đúng của nút). Bấm "Xuất bản" → `/trang/{slug}` cập nhật.

- [ ] **Step 5: Build gate + commit**

```bash
npx tsc --noEmit && npm run build
git add "src/app/(content)" src/app/page.tsx
git commit -m "feat(builder): render puck content on public pages, add draft preview route"
```

---

# PHASE 2 — Port đủ bộ widget vào Puck

Mẫu chung mọi task phase này: (1) component render dùng chung ở `src/components/cms/widgets/`, (2) thêm entry vào `clientConfig.components` (fields + defaultProps + render), (3) thêm entry render-only vào `serverConfig.components`, (4) thêm key vào category tương ứng trong `clientConfig.categories`, (5) `npx tsc --noEmit`, verify trong builder, commit. Code nguồn để port nằm trong `src/components/cms/widget-renderer.tsx` (giữ nguyên file này — chỉ copy, không sửa; nó còn phục vụ trang legacy đến Phase 7).

### Task 2.1: Layout containers — `section` (mới) + `columns` (slot-based) + color field

**Files:**
- Create: `src/lib/builder/fields/color-field.tsx`, `src/components/cms/widgets/section-widget.tsx`, `src/components/cms/widgets/columns-widget.tsx`
- Modify: `src/lib/builder/config.client.tsx`, `src/lib/builder/config.server.tsx`

- [ ] **Step 1: `src/lib/builder/fields/color-field.tsx`**

```tsx
"use client";

export const colorField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="size-8 cursor-pointer rounded border"
      />
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder="#ffffff hoặc để trống"
        className="h-8 flex-1 rounded-md border px-2 text-xs"
      />
    </div>
  ),
});
```

- [ ] **Step 2: `src/components/cms/widgets/section-widget.tsx`**

```tsx
import { cn } from "@/lib/utils";

const PADDING: Record<string, string> = {
  none: "py-0",
  small: "py-6",
  medium: "py-12",
  large: "py-20",
};

export function SectionWidget({
  background = "",
  paddingY = "medium",
  contained = true,
  children,
}: {
  background?: string;
  paddingY?: string;
  contained?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(PADDING[paddingY] ?? PADDING.medium)}
      style={background ? { backgroundColor: background } : undefined}
    >
      <div className={contained ? "container-page" : undefined}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: `src/components/cms/widgets/columns-widget.tsx`** — slot props là React component (Puck slot API):

```tsx
import { cn } from "@/lib/utils";

type SlotComponent = React.ComponentType<{ className?: string }>;

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function ColumnsWidget({
  count = 2,
  gap = 24,
  slots,
}: {
  count?: number;
  gap?: number;
  slots: SlotComponent[];
}) {
  const n = Math.min(Math.max(Number(count) || 2, 2), 4);
  const shown = slots.slice(0, n);
  return (
    <section className="container-page py-6">
      <div className={cn("grid grid-cols-1", GRID_COLS[n])} style={{ gap }}>
        {shown.map((Col, i) => (
          <Col key={i} className="space-y-4" />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Config entries.** Trong `config.client.tsx` thêm:

```tsx
import { SectionWidget } from "@/components/cms/widgets/section-widget";
import { ColumnsWidget } from "@/components/cms/widgets/columns-widget";
import { colorField } from "@/lib/builder/fields/color-field";
```

```tsx
    section: {
      label: "Section",
      fields: {
        background: colorField("Màu nền"),
        paddingY: {
          type: "select",
          label: "Đệm trên/dưới",
          options: [
            { label: "Không", value: "none" },
            { label: "Nhỏ", value: "small" },
            { label: "Vừa", value: "medium" },
            { label: "Lớn", value: "large" },
          ],
        },
        contained: { type: "radio", label: "Bề rộng", options: [
          { label: "Theo khung trang", value: true },
          { label: "Tràn viền", value: false },
        ] },
        content: { type: "slot" },
      },
      defaultProps: { background: "", paddingY: "medium", contained: true, content: [] },
      render: ({ background, paddingY, contained, content: Content }) => (
        <SectionWidget background={background} paddingY={paddingY} contained={contained}>
          <Content />
        </SectionWidget>
      ),
    },
    columns: {
      label: "Cột (Layout)",
      fields: {
        count: {
          type: "select",
          label: "Số cột",
          options: [
            { label: "2 cột", value: 2 },
            { label: "3 cột", value: 3 },
            { label: "4 cột", value: 4 },
          ],
        },
        gap: { type: "number", label: "Khoảng cách (px)", min: 0 },
        column1: { type: "slot" },
        column2: { type: "slot" },
        column3: { type: "slot" },
        column4: { type: "slot" },
      },
      defaultProps: { count: 2, gap: 24, column1: [], column2: [], column3: [], column4: [] },
      render: ({ count, gap, column1, column2, column3, column4 }) => (
        <ColumnsWidget count={count} gap={gap} slots={[column1, column2, column3, column4]} />
      ),
    },
```

Trong `config.server.tsx` thêm 2 entry render-only giống hệt phần `render` (import 2 widget components). Thêm `"section", "columns"` vào đầu `categories.layout.components`.

- [ ] **Step 5: Verify trong builder** — kéo Section vào canvas → kéo Columns vào trong Section → kéo Heading vào từng cột; đổi count 2→3 → cột 3 xuất hiện và nhận drop. Lưu nháp + mở Xem trước → render đúng.

- [ ] **Step 6: Commit**

```bash
npx tsc --noEmit
git add src/lib/builder src/components/cms/widgets
git commit -m "feat(builder): section and slot-based columns layout widgets"
```

### Task 2.2: Basic widgets — richText, iconList, faqAccordion, testimonial

**Files:**
- Create: `src/components/cms/widgets/rich-text-server-widget.tsx`, `rich-text-client-widget.tsx`, `icon-list-widget.tsx`, `testimonial-widget.tsx`
- Modify: 2 config + categories (`faqAccordion` dùng `FaqWidget` có sẵn `src/components/cms/widgets/faq-widget.tsx`)

- [ ] **Step 1: richText server** — `src/components/cms/widgets/rich-text-server-widget.tsx` (chuyển đổi Tiptap JSON → HTML lúc render, thay cho cache-on-save của pipeline cũ; trang đã static-cache nên chi phí 1 lần/revalidate):

```tsx
import type { JSONContent } from "@tiptap/core";
import { renderTiptapHtml } from "@/lib/rich-text/render";
import { RichTextContent } from "@/components/common/rich-text-content";

export function RichTextServerWidget({
  contentJson,
  contentHtml,
}: {
  contentJson?: JSONContent | null;
  contentHtml?: string;
}) {
  const html = contentHtml || renderTiptapHtml(contentJson ?? null);
  return (
    <section className="container-page py-6">
      <RichTextContent html={html} className="mx-auto max-w-3xl" />
    </section>
  );
}
```

(đối chiếu chữ ký thật trong `src/lib/rich-text/render.ts` trước khi viết)

- [ ] **Step 2: richText client (canvas editor)** — `src/components/cms/widgets/rich-text-client-widget.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { tiptapExtensions } from "@/lib/rich-text/extensions";

export function RichTextClientWidget({ contentJson }: { contentJson?: JSONContent | null }) {
  const html = useMemo(() => {
    if (!contentJson) return "";
    try {
      return generateHTML(contentJson, tiptapExtensions());
    } catch {
      return "";
    }
  }, [contentJson]);
  if (!html) {
    return (
      <section className="container-page py-6">
        <p className="text-sm text-muted-foreground">Văn bản trống — nhập nội dung ở panel bên phải.</p>
      </section>
    );
  }
  return (
    <section className="container-page py-6">
      <div
        className="prose prose-neutral mx-auto max-w-3xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
```

- [ ] **Step 3: iconList + testimonial** — `src/components/cms/widgets/icon-list-widget.tsx` (items đổi sang object array cho Puck array field):

```tsx
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
```

`src/components/cms/widgets/testimonial-widget.tsx`: copy nguyên case `testimonial` từ `widget-renderer.tsx:142-164` thành component props `{ quote, author, role, avatar }`.

- [ ] **Step 4: Config entries** — `config.client.tsx`:

```tsx
    richText: {
      label: "Văn bản (WYSIWYG)",
      fields: { contentJson: richTextField("Nội dung") },
      defaultProps: { contentJson: null },
      render: ({ contentJson }) => <RichTextClientWidget contentJson={contentJson} />,
    },
    iconList: {
      label: "Danh sách tính năng",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        items: {
          type: "array",
          label: "Mục",
          arrayFields: { text: { type: "text", label: "Nội dung" } },
          defaultItemProps: { text: "Mục mới" },
          getItemSummary: (item) => item.text || "Mục",
        },
      },
      defaultProps: {
        heading: "Cam kết của chúng tôi",
        items: [
          { text: "Miễn phí vận chuyển" },
          { text: "Đổi trả 30 ngày" },
          { text: "Bảo hành chính hãng" },
        ],
      },
      render: ({ heading, items }) => <IconListWidget heading={heading} items={items} />,
    },
    faqAccordion: {
      label: "FAQ / Accordion",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        items: {
          type: "array",
          label: "Câu hỏi",
          arrayFields: {
            q: { type: "text", label: "Câu hỏi" },
            a: { type: "textarea", label: "Trả lời" },
          },
          defaultItemProps: { q: "Câu hỏi mới?", a: "" },
          getItemSummary: (item) => item.q || "Câu hỏi",
        },
      },
      defaultProps: {
        heading: "Câu hỏi thường gặp",
        items: [
          { q: "Thời gian giao hàng?", a: "2-5 ngày làm việc tùy khu vực." },
          { q: "Chính sách đổi trả?", a: "Đổi trả miễn phí trong 30 ngày." },
        ],
      },
      render: ({ heading, items }) => <FaqWidget heading={heading} items={items} />,
    },
    testimonial: {
      label: "Đánh giá khách hàng",
      fields: {
        quote: { type: "textarea", label: "Nội dung" },
        author: { type: "text", label: "Tên" },
        role: { type: "text", label: "Vai trò" },
        avatar: imageField("Ảnh đại diện"),
      },
      defaultProps: {
        quote: "Sản phẩm chất lượng, giao hàng nhanh!",
        author: "Khách hàng",
        role: "Đã mua hàng",
        avatar: "",
      },
      render: (props) => <TestimonialWidget {...props} />,
    },
```

`config.server.tsx`: 4 entry render-only — riêng `richText` dùng `RichTextServerWidget` (truyền cả `contentJson` lẫn `contentHtml` legacy nếu có). Thêm 4 key vào `categories.basic.components`.

- [ ] **Step 5: Verify + commit** — builder: kéo richText, gõ nội dung có H2/bullet list ở panel phải → canvas hiện đúng style prose (typography plugin Task 0.2); FAQ thêm/xóa/sắp xếp câu hỏi bằng array field. Xem trước → khớp.

```bash
npx tsc --noEmit
git add src/lib/builder src/components/cms/widgets
git commit -m "feat(builder): basic widgets (richText, iconList, faq, testimonial)"
```

### Task 2.3: Media widgets — hero, bannerImage, image, gallery, videoEmbed, logoMarquee

**Files:**
- Create: `src/components/cms/widgets/hero-widget.tsx`, `banner-image-widget.tsx`, `image-widget.tsx`, `gallery-widget.tsx`, `video-embed-widget.tsx`, `logo-marquee-widget.tsx`
- Modify: 2 config + categories

- [ ] **Step 1: Tạo 6 component** — copy nguyên logic từ các case tương ứng trong `widget-renderer.tsx:167-296`, đổi sang typed props. Khác biệt duy nhất so với legacy:
  - `gallery`: prop `images` đổi từ `string[]` sang `{ src: string }[]`
  - `logoMarquee`: prop `images` đổi từ `string[]` sang `{ src: string }[]`
  - `video-embed-widget.tsx` chứa luôn helper `toEmbedUrl` (copy từ `widget-renderer.tsx:380-386`)

Ví dụ `src/components/cms/widgets/gallery-widget.tsx` (các file khác làm tương tự từ case legacy):

```tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

const GRID: Record<string, string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-2 sm:grid-cols-3",
  "4": "grid-cols-2 sm:grid-cols-4",
};

export function GalleryWidget({
  images = [],
  columns = "3",
}: {
  images?: { src: string }[];
  columns?: string;
}) {
  const valid = images.filter((i) => i.src);
  return (
    <section className="container-page py-6">
      <div className={cn("grid gap-3", GRID[columns])}>
        {valid.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image src={img.src} alt="" fill sizes="300px" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Config entries** — fields lấy đúng từ `src/lib/cms/widgets.ts:217-354` (label/option tiếng Việt giữ nguyên), thay: field `image` → `imageField(...)`, field list ảnh → array field `{ src: imageField("Ảnh") }` với `getItemSummary: (item, i) => \`Ảnh ${(i ?? 0) + 1}\``. `config.server.tsx` thêm 6 render-only entry. Categories: thêm cả 6 vào `media`.

- [ ] **Step 3: Verify + commit** — builder: hero đổi ảnh qua MediaPicker → canvas đổi ngay; gallery thêm 3 ảnh, đổi số cột; videoEmbed dán URL YouTube → iframe hiện.

```bash
npx tsc --noEmit
git add src/lib/builder src/components/cms/widgets
git commit -m "feat(builder): media widgets (hero, banners, image, gallery, video, logos)"
```

### Task 2.4: Commerce widgets — productGrid, productCarousel, featuredCategories (client fetch + server query)

**Files:**
- Create: `src/components/cms/widgets/product-grid-widget.tsx`, `product-carousel-widget.tsx`, `featured-categories-widget.tsx` (mỗi file: presentational + Client + Server variant)
- Create: `src/hooks/use-widget-data.ts`
- Modify: 2 config + categories

- [ ] **Step 1: Hook fetch chung** — `src/hooks/use-widget-data.ts`:

```tsx
"use client";

import * as React from "react";

/** Fetch JSON data for builder-canvas widgets ({ data: T[] } shape). */
export function useWidgetData<T>(url: string): { data: T[] | null; loading: boolean } {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json: { data: T[] }) => {
        if (!cancelled) setData(json.data);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading };
}
```

- [ ] **Step 2: Mẫu 3-variant** — `src/components/cms/widgets/product-grid-widget.tsx`:

```tsx
import { FeaturedCollection } from "@/components/home/featured-collection";
import { getFeaturedProducts } from "@/lib/api/products";
import type { Product, ProductFlag } from "@/types";

export interface ProductGridWidgetProps {
  heading?: string;
  flag?: string;
  limit?: number;
  href?: string;
}

/** Presentational — shared by both variants. */
export function ProductGridView({
  heading,
  href,
  products,
}: {
  heading?: string;
  href?: string;
  products: Product[];
}) {
  return (
    <FeaturedCollection title={heading || "Sản phẩm"} href={href || undefined} products={products} />
  );
}

/** RSC variant for the public site (direct DB query). */
export async function ProductGridServer({ heading, flag, limit, href }: ProductGridWidgetProps) {
  const products = await getFeaturedProducts((flag || "bestseller") as ProductFlag, limit || 4);
  return <ProductGridView heading={heading} href={href} products={products} />;
}
```

và phần client trong cùng pattern nhưng file riêng `src/components/cms/widgets/product-grid-widget.client.tsx` (tách file vì server file import repo — không được vào client bundle):

```tsx
"use client";

import { useWidgetData } from "@/hooks/use-widget-data";
import type { Product } from "@/types";
import { ProductGridView, type ProductGridWidgetProps } from "./product-grid-widget";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridClient({ heading, flag, limit, href }: ProductGridWidgetProps) {
  const { data, loading } = useWidgetData<Product>(
    `/api/widgets/products?flag=${flag || "bestseller"}&limit=${limit || 4}`
  );
  if (loading || !data) {
    return (
      <section className="container-page py-8">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="product-grid">
          {Array.from({ length: limit || 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }
  return <ProductGridView heading={heading} href={href} products={data} />;
}
```

LƯU Ý: kiểm tra `ProductGridView`/`FeaturedCollection` import được từ client (không dùng server-only API). Nếu `getFeaturedProducts` nằm cùng file gây lỗi bundle: tách `ProductGridView` sang file thứ ba `product-grid-view.tsx`.

- [ ] **Step 3: Làm tương tự cho `productCarousel`** (copy case `widget-renderer.tsx:309-326` làm View) **và `featuredCategories`** (case `widget-renderer.tsx:327-354` làm View; client fetch `/api/widgets/categories?gender=...`; type category lấy theo return của `getCategoriesByGenderDb` — đọc `src/lib/repos/categories.repo.ts` để lấy type chính xác).

- [ ] **Step 4: Config entries** — `config.client.tsx` dùng `*Client` variants; `config.server.tsx` dùng `*Server` variants. Fields copy từ `src/lib/cms/widgets.ts:357-403` (flagOptions, gender options, limit number). Categories: thêm 3 key vào `commerce`.

- [ ] **Step 5: Verify + commit** — builder: kéo productGrid → skeleton rồi hiện 4 sản phẩm thật; đổi flag "sale" → reload data. Public render qua Xem trước → sản phẩm server-render (view-source có HTML sản phẩm).

```bash
npx tsc --noEmit
git add src/lib/builder src/components/cms/widgets src/hooks/use-widget-data.ts
git commit -m "feat(builder): commerce widgets with client-fetch editor preview and RSC public render"
```

### Task 2.5: Marketing widgets + chốt categories

**Files:**
- Modify: 2 config (dùng `CountdownWidget`, `NewsletterWidget` có sẵn trong `src/components/cms/widgets/`)

- [ ] **Step 1: Config entries** — fields/defaultProps copy từ `src/lib/cms/widgets.ts:406-435`:

```tsx
    countdown: {
      label: "Đếm ngược",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        subheading: { type: "text", label: "Phụ đề" },
        target: { type: "text", label: "Thời điểm kết thúc (ISO: 2026-12-31T23:59)" },
      },
      defaultProps: { heading: "Ưu đãi kết thúc sau", target: "", subheading: "" },
      render: ({ heading, subheading, target }) => (
        <CountdownWidget heading={heading} subheading={subheading} target={target} />
      ),
    },
    newsletter: {
      label: "Đăng ký nhận tin",
      fields: {
        heading: { type: "text", label: "Tiêu đề" },
        subheading: { type: "text", label: "Phụ đề" },
        placeholder: { type: "text", label: "Placeholder" },
        buttonLabel: { type: "text", label: "Nhãn nút" },
      },
      defaultProps: {
        heading: "Đăng ký nhận ưu đãi",
        subheading: "Nhận thông tin sản phẩm mới và khuyến mãi.",
        placeholder: "Email của bạn",
        buttonLabel: "Đăng ký",
      },
      render: (props) => <NewsletterWidget {...props} />,
    },
```

(server config: 2 entry render-only giống hệt — `CountdownWidget` là client component có sẵn, render trong RSC tree vẫn hợp lệ)

- [ ] **Step 2: Chốt categories đầy đủ** trong `config.client.tsx` (đảm bảo khớp mọi key đã khai — Puck báo console warning nếu thiếu):

```tsx
  categories: {
    layout: { title: "Bố cục", components: ["section", "columns", "spacer", "divider"] },
    basic: { title: "Cơ bản", components: ["heading", "richText", "button", "iconList", "faqAccordion", "testimonial"] },
    media: { title: "Media", components: ["hero", "bannerImage", "image", "gallery", "videoEmbed", "logoMarquee"] },
    commerce: { title: "Thương mại", components: ["productGrid", "productCarousel", "featuredCategories"] },
    marketing: { title: "Marketing", components: ["countdown", "newsletter"] },
  },
```

- [ ] **Step 3: Verify tổng** — mở builder trang home (legacy convert on-the-fly): TOÀN BỘ block hiện đúng trong canvas (hero, featuredCategories, productGrid×3). So sánh canvas với trang chủ thật — phải giống nhau.

- [ ] **Step 4: Commit**

```bash
npx tsc --noEmit
git add src/lib/builder
git commit -m "feat(builder): marketing widgets, finalize widget categories"
```

---

# PHASE 3 — Migration dữ liệu (TDD đầy đủ)

### Task 3.1: Hoàn thiện `migrate-legacy.ts` với test đầy đủ

**Files:**
- Modify: `src/lib/builder/migrate-legacy.ts`
- Test: `src/lib/builder/migrate-legacy.test.ts`

Các biến đổi format cần thêm so với bản tối thiểu Task 1.6 (do field đổi shape ở Phase 2): `gallery.images: string[] → {src}[]`, `logoMarquee.images: string[] → {src}[]`, `iconList.items: string[] → {text}[]`.

- [ ] **Step 1: Viết test fail** — `src/lib/builder/migrate-legacy.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { legacyBlocksToPuckData } from "./migrate-legacy";
import type { PageBlock } from "@/db/schema/cms";

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
```

- [ ] **Step 2: Chạy test, verify fail** (các test biến đổi array sẽ fail với bản tối thiểu)

Run: `npx vitest run src/lib/builder/migrate-legacy.test.ts`
Expected: FAIL các test gallery/iconList

- [ ] **Step 3: Implement đầy đủ** — thay `mapBlock` trong `src/lib/builder/migrate-legacy.ts`:

```ts
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
```

- [ ] **Step 4: Chạy toàn bộ test, verify pass**

Run: `npm test`
Expected: tất cả pass (gồm cả revalidate tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/builder/migrate-legacy.ts src/lib/builder/migrate-legacy.test.ts
git commit -m "feat(builder): complete legacy->puck migration with full transform coverage"
```

### Task 3.2: Script backfill + cập nhật seed

**Files:**
- Create: `scripts/migrate-pages-to-puck.ts`
- Modify: `src/db/seed/index.ts:296-358` (hàm `seedPages`)
- Modify: `package.json` (script)

- [ ] **Step 1: `scripts/migrate-pages-to-puck.ts`** (idempotent — bỏ qua trang đã có `content`):

```ts
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { legacyBlocksToPuckData } from "@/lib/builder/migrate-legacy";

async function main() {
  const rows = await db.select().from(pages).where(isNull(pages.content));
  console.log(`Migrating ${rows.length} page(s) to Puck format...`);
  for (const row of rows) {
    const data = legacyBlocksToPuckData(row.blocks);
    await db.update(pages).set({ content: data }).where(eq(pages.id, row.id));
    console.log(`  ✓ ${row.slug} (${row.blocks.length} blocks)`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Thêm script `package.json`: `"db:migrate-puck": "tsx scripts/migrate-pages-to-puck.ts"`. (Nếu tsx không resolve alias `@/` cho file ngoài `src/` — kiểm tra `tsconfig.json` paths; nếu lỗi, đổi import sang relative `../src/...`.)

- [ ] **Step 2: Seed sinh thẳng Puck Data** — trong `src/db/seed/index.ts`, hàm `seedPages`: giữ nguyên mảng `blocks` (làm legacy reference), thêm import `legacyBlocksToPuckData` và sửa insert:

```ts
  await db.insert(s.pages).values({
    slug: "home",
    title: "Trang chủ",
    status: "published",
    blocks,
    content: legacyBlocksToPuckData(blocks),
    isSystem: true,
    seoTitle: `${siteConfig.name} — ${siteConfig.tagline}`,
    seoDescription: siteConfig.description,
  });
```

- [ ] **Step 3: Chạy migration trên DB hiện tại + verify**

```bash
npm run db:migrate-puck
```

Expected: log từng trang ✓. Sau đó mở `/` (trang chủ) → render qua Puck `<Render>` (đặt tạm `console.log("PUCK RENDER")` nếu cần xác nhận nhánh code, nhớ xóa); giao diện giống hệt trước migration. Mở builder trang home → mở từ `content`, không qua convert on-the-fly nữa.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-pages-to-puck.ts src/db/seed/index.ts package.json
git commit -m "feat(builder): backfill script and seed in puck format"
```

---

# PHASE 4 — Widget mới (mở rộng bộ element)

### Task 4.1: heroCarousel, promoBanner, articleStrip, categoryTiles, htmlEmbed

**Files:**
- Create: `src/components/cms/widgets/hero-carousel-widget.tsx`, `promo-banner-widget.tsx`, `article-strip-widget.tsx` (+ `.client.tsx`), `category-tiles-widget.tsx`, `html-embed-widget.tsx`
- Modify: 2 config + categories + `src/lib/builder/types.ts` (đã khai sẵn key ở Task 1.1)

- [ ] **Step 1: `hero-carousel-widget.tsx`** — parameter hóa `HeroCarousel` (`src/components/home/hero-carousel.tsx` đang hardcode slides):

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export interface HeroSlide {
  image: string;
  alt?: string;
  href?: string;
}

export function HeroCarouselWidget({
  slides = [],
  autoplaySeconds = 5,
}: {
  slides?: HeroSlide[];
  autoplaySeconds?: number;
}) {
  const autoplay = React.useMemo(
    () => Autoplay({ delay: Math.max(autoplaySeconds, 2) * 1000, stopOnInteraction: false }),
    [autoplaySeconds]
  );
  const valid = slides.filter((s) => s.image);
  if (!valid.length) return null;

  return (
    <Carousel opts={{ loop: true }} plugins={[autoplay]} className="w-full">
      <CarouselContent>
        {valid.map((s, i) => (
          <CarouselItem key={`${s.image}-${i}`}>
            <Link
              href={s.href || "/"}
              className="relative block aspect-[2000/762] w-full overflow-hidden bg-muted"
            >
              <Image
                src={s.image}
                alt={s.alt ?? ""}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
```

Config fields: `slides` array field `{ image: imageField("Ảnh"), alt: text, href: text }`, `autoplaySeconds` number. Đồng thời sửa `src/components/home/hero-carousel.tsx` để delegate: `export function HeroCarousel() { return <HeroCarouselWidget slides={slides} />; }` (giữ fallback homepage hoạt động, xóa phần render trùng).

- [ ] **Step 2: `promo-banner-widget.tsx`** — bọc `PromoBanner` có sẵn:

```tsx
import { PromoBanner } from "@/components/home/promo-banner";

export function PromoBannerWidget({
  title,
  subtitle,
  cta,
  href,
  from,
  to,
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  from?: string;
  to?: string;
}) {
  return (
    <PromoBanner
      title={title || "Ưu đãi đặc biệt"}
      subtitle={subtitle || ""}
      cta={cta || "Xem ngay"}
      href={href || "/"}
      from={from || undefined}
      to={to || undefined}
    />
  );
}
```

Config fields: title/subtitle/cta/href text, `from`/`to` dùng `colorField`.

- [ ] **Step 3: `article-strip-widget.tsx`** — pattern 3-variant như commerce (Task 2.4): View bọc `StoryStrip` (`src/components/home/story-strip.tsx`), Server query `getArticles()` cắt `limit`, Client fetch `/api/widgets/articles?limit=`. Fields: `heading` text (render `SectionHeading` phía trên nếu có), `limit` number.

- [ ] **Step 4: `category-tiles-widget.tsx`** — tiles tự khai báo (array field), KHÔNG hardcode như `CategoryTiles` cũ:

```tsx
import Link from "next/link";
import Image from "next/image";

export interface CategoryTile {
  image: string;
  label: string;
  href: string;
}

export function CategoryTilesWidget({ tiles = [] }: { tiles?: CategoryTile[] }) {
  const valid = tiles.filter((t) => t.image && t.label);
  if (!valid.length) return null;
  return (
    <section className="container-page py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {valid.map((t, i) => (
          <Link key={i} href={t.href || "/"} className="group flex flex-col items-center gap-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted">
              <Image
                src={t.image}
                alt={t.label}
                fill
                sizes="200px"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <span className="text-sm font-medium">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `html-embed-widget.tsx`** — sanitize bằng `isomorphic-dompurify` (đã có trong deps):

```tsx
import DOMPurify from "isomorphic-dompurify";

export function HtmlEmbedWidget({ html = "" }: { html?: string }) {
  if (!html.trim()) return null;
  const clean = DOMPurify.sanitize(html, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "src"] });
  return (
    <section className="container-page py-6">
      <div dangerouslySetInnerHTML={{ __html: clean }} />
    </section>
  );
}
```

Config fields: `html` textarea. Category: `marketing` thêm `promoBanner`, `articleStrip`, `htmlEmbed`; `media` thêm `heroCarousel`; `commerce` thêm `categoryTiles`.

- [ ] **Step 6: Verify + build + commit** — builder: dựng thử trang landing dùng đủ 5 widget mới; Xem trước OK.

```bash
npx tsc --noEmit && npm test && npm run build
git add src/lib/builder src/components/cms/widgets src/components/home/hero-carousel.tsx
git commit -m "feat(builder): new widgets (heroCarousel, promoBanner, articleStrip, categoryTiles, htmlEmbed)"
```

---

# PHASE 5 — Admin UX hoàn chỉnh

### Task 5.1: Luồng tạo trang mới + trang cài đặt + nút Thiết kế

**Files:**
- Create: `src/components/admin/page-settings-form.tsx`
- Modify: `src/app/(admin)/admin/pages/new/page.tsx`, `src/app/(admin)/admin/pages/[id]/page.tsx`, `src/app/(admin)/admin/pages/page.tsx`
- Modify: `src/server/actions/builder.ts` (thêm 2 action), `src/lib/validators/cms.ts` (schema settings)

- [ ] **Step 1: Schema + actions** — `src/lib/validators/cms.ts` thêm:

```ts
export const pageSettingsSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

export type PageSettingsInput = z.infer<typeof pageSettingsSchema>;
```

`src/server/actions/builder.ts` thêm (cùng pattern requireStaff/validate/revalidate như `savePageContentAction`; repo cần thêm `createPageShell` và `updatePageSettings` vào `pages.repo.ts`):

```ts
export async function createPageAction(raw: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = pageSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    const id = await createPageShell(parsed.data);
    revalidatePath("/admin/pages");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function savePageSettingsAction(id: string, raw: unknown): Promise<ActionResult> {
  await requireStaff();
  const parsed = pageSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  try {
    const existing = await getPageAdmin(id);
    if (!existing) return { ok: false, error: "Trang không tồn tại" };
    await updatePageSettings(id, parsed.data);
    for (const path of pagePathsToRevalidate(parsed.data.slug, {
      isSystem: existing.isSystem,
      previousSlug: existing.slug,
    })) {
      revalidatePath(path);
    }
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
```

Repo (`pages.repo.ts`):

```ts
import type { PageSettingsInput } from "@/lib/validators/cms";
```

```ts
export async function createPageShell(input: PageSettingsInput): Promise<string> {
  const [row] = await db
    .insert(pages)
    .values({
      slug: input.slug,
      title: input.title,
      status: input.status,
      blocks: [],
      content: { root: { props: {} }, content: [] },
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
    })
    .returning({ id: pages.id });
  return row.id;
}

export async function updatePageSettings(id: string, input: PageSettingsInput): Promise<void> {
  const existing = await getPageAdmin(id);
  if (!existing) throw new Error("Trang không tồn tại");
  const slug = existing.isSystem ? existing.slug : input.slug;
  await db
    .update(pages)
    .set({
      slug,
      title: input.title,
      status: input.status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id));
}
```

- [ ] **Step 2: `src/components/admin/page-settings-form.tsx`** — client form: title (auto-slugify như `page-builder.tsx` cũ — copy hàm slugify từ đó), slug (disabled nếu `isSystem`), status select, seoTitle, seoDescription, ogImage (`ImageFieldUi` tái dùng), nút Lưu; chế độ tạo mới (`id == null`) gọi `createPageAction` rồi `router.push(\`/admin/pages/\${res.id}/builder\`)`; chế độ sửa gọi `savePageSettingsAction`. Kèm nút lớn "🎨 Mở trình thiết kế" link tới `/admin/pages/{id}/builder` (chỉ khi sửa).

- [ ] **Step 3: Routes** — `new/page.tsx`: render `<PageSettingsForm />` (bỏ PageBuilder cũ). `[id]/page.tsx`: fetch page, render `<PageSettingsForm id={page.id} isSystem={page.isSystem} initial={...} />` (bỏ PageBuilder cũ). `pages/page.tsx` (list): thêm nút/link "Thiết kế" mỗi hàng trỏ `/admin/pages/{id}/builder` (đọc file hiện tại rồi thêm cột).

- [ ] **Step 4: Verify** — luồng đầy đủ: `/admin/pages/new` → nhập "Trang giới thiệu" (slug tự sinh) → Lưu → redirect vào builder → kéo widget → Xuất bản → `/trang/trang-gioi-thieu` hiện đúng; quay lại list thấy trang mới; sửa SEO ở trang cài đặt → lưu OK.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit
git add src/components/admin/page-settings-form.tsx "src/app/(admin)/admin/pages" src/server/actions/builder.ts src/lib/validators/cms.ts src/lib/repos/pages.repo.ts
git commit -m "feat(builder): page settings form, create-then-design flow, design buttons"
```

---

# PHASE 6 — Admin quản lý Menu

Bảng `menus` đã có sẵn trong schema (`src/db/schema/cms.ts:69-73`: key `"header" | "footer"`, `items: MenuNode[]` với `MenuNode = { label, href, children? }`) nhưng là dead code — chưa ai đọc/ghi. Header thật đang dùng `mainNav` (mega-menu theo gender, code-driven) + các link phụ; footer dùng `footerNav` từ `src/data/navigation.ts`.

**Phạm vi v1:** menu DB quản lý (a) các link phụ của header (phần SAU các mục gender mega-menu — gender menu vẫn code-driven vì gắn dữ liệu danh mục), (b) toàn bộ cột link footer. Fallback về nav tĩnh khi bảng trống.

### Task 6.1: Validator + repo + action (TDD validator)

**Files:**
- Modify: `src/lib/validators/cms.ts`
- Test: `src/lib/validators/menus.test.ts`
- Create: `src/lib/repos/menus.repo.ts`, `src/server/actions/menus.ts`

- [ ] **Step 1: Test fail trước** — `src/lib/validators/menus.test.ts`:

```ts
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
```

Run: `npx vitest run src/lib/validators/menus.test.ts` → FAIL (chưa có schema)

- [ ] **Step 2: Schema** — thêm vào `src/lib/validators/cms.ts`:

```ts
// ---- Menus ----
const menuLeafSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const menuItemsSchema = z.array(
  menuLeafSchema.extend({
    children: z.array(menuLeafSchema).optional(),
  })
);

export const menuKeySchema = z.enum(["header", "footer"]);
export type MenuItemsInput = z.infer<typeof menuItemsSchema>;
```

Run: `npm test` → PASS

- [ ] **Step 3: `src/lib/repos/menus.repo.ts`**

```ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { menus } from "@/db/schema";
import type { MenuNode } from "@/db/schema/cms";

export async function getMenu(key: "header" | "footer"): Promise<MenuNode[] | null> {
  const row = await db.query.menus.findFirst({ where: eq(menus.key, key) });
  return row?.items ?? null;
}

export async function saveMenu(key: "header" | "footer", items: MenuNode[]): Promise<void> {
  await db
    .insert(menus)
    .values({ key, items, updatedAt: new Date() })
    .onConflictDoUpdate({ target: menus.key, set: { items, updatedAt: new Date() } });
}
```

- [ ] **Step 4: `src/server/actions/menus.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/rbac";
import { menuItemsSchema, menuKeySchema } from "@/lib/validators/cms";
import { saveMenu } from "@/lib/repos/menus.repo";
import type { ActionResult } from "./catalog";

export async function saveMenuAction(rawKey: unknown, rawItems: unknown): Promise<ActionResult> {
  await requireStaff();
  const key = menuKeySchema.safeParse(rawKey);
  const items = menuItemsSchema.safeParse(rawItems);
  if (!key.success || !items.success) {
    return { ok: false, error: "Dữ liệu menu không hợp lệ" };
  }
  try {
    await saveMenu(key.data, items.data);
    // Header/footer render in the root layout — revalidate the whole tree.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
```

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit && npm test
git add src/lib/validators src/lib/repos/menus.repo.ts src/server/actions/menus.ts
git commit -m "feat(menus): validators, repo, save action"
```

### Task 6.2: UI quản lý menu `/admin/menus`

**Files:**
- Create: `src/components/admin/menu-editor.tsx`, `src/app/(admin)/admin/menus/page.tsx`
- Modify: `src/components/admin/admin-sidebar.tsx:36` (thêm mục)

- [ ] **Step 1: `src/app/(admin)/admin/menus/page.tsx`**

```tsx
import { getMenu } from "@/lib/repos/menus.repo";
import { MenuEditor } from "@/components/admin/menu-editor";

export const metadata = { title: "Quản lý menu" };

export default async function MenusPage() {
  const [header, footer] = await Promise.all([getMenu("header"), getMenu("footer")]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Menu điều hướng</h1>
      <MenuEditor initialHeader={header ?? []} initialFooter={footer ?? []} />
    </div>
  );
}
```

- [ ] **Step 2: `src/components/admin/menu-editor.tsx`** — client component:
  - 2 tab (shadcn `Tabs`): "Header" / "Footer"
  - Mỗi tab: danh sách item cấp 1 sortable bằng `@dnd-kit/sortable` (pattern y hệt `SortableBlock` trong `src/components/admin/page-builder.tsx` — copy `useSortable` setup từ đó); mỗi item: input label + input href + nút thêm con + danh sách con (label/href, không dnd cho con — mũi tên lên/xuống là đủ) + nút xóa
  - Nút "Thêm mục" cuối danh sách; nút "Lưu menu" gọi `saveMenuAction(activeTab, items)` + toast sonner
  - Helper gợi ý link: datalist từ các trang CMS đã publish — fetch `/api/widgets/pages`? KHÔNG cần API mới: truyền `pageOptions: { label, href }[]` từ server page (thêm `listPublishedPagesForSitemap()` vào `menus/page.tsx`, map sang `/trang/{slug}`) và render `<datalist>` cho input href.
  - State shape đúng `MenuNode[]`; id tạm cho dnd dùng index-based key `item-${i}` (đủ cho list nhỏ, không cần nanoid)

- [ ] **Step 3: Sidebar** — `src/components/admin/admin-sidebar.tsx`: thêm sau dòng 36 (`/admin/pages`):

```ts
  { href: "/admin/menus", label: "Menu", icon: MenuIcon },
```

(import `MenuIcon` từ lucide-react; sửa cả `admin-mobile-nav.tsx` nếu nav items khai riêng — kiểm tra file)

- [ ] **Step 4: Verify** — `/admin/menus`: thêm mục "Về chúng tôi" → `/trang/gioi-thieu` (gợi ý datalist hiện), kéo đổi thứ tự, Lưu → reload giữ nguyên.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit
git add src/components/admin/menu-editor.tsx "src/app/(admin)/admin/menus" src/components/admin/admin-sidebar.tsx src/components/admin/admin-mobile-nav.tsx
git commit -m "feat(menus): admin menu editor with dnd ordering"
```

### Task 6.3: Header/Footer đọc menu từ DB (fallback nav tĩnh)

**Files:**
- Modify: `src/app/layout.tsx`, `src/components/layout/site-chrome.tsx`, `src/components/layout/site-header.tsx`, `src/components/layout/desktop-nav.tsx`, `src/components/layout/site-footer.tsx`
- Create: `src/lib/cms/navigation.ts` (assembler + tests nếu logic merge phức tạp)

ĐỌC 4 file layout trước khi sửa — chúng chưa được đọc chi tiết trong lúc lập plan. Nguyên tắc thực hiện:

- [ ] **Step 1: Assembler** — `src/lib/cms/navigation.ts`:

```ts
import type { MenuNode } from "@/db/schema/cms";
import { getMenu } from "@/lib/repos/menus.repo";
import { mainNav, footerNav } from "@/data/navigation";
import type { NavItem } from "@/types";

/**
 * Header: gender mega-menu items stay code-driven (they embed category data);
 * DB "header" menu replaces the static tail links (Khuyến Mãi, Hàng Mới, ...).
 * Footer: DB "footer" menu replaces footerNav columns entirely when present.
 */
export async function getSiteNavigation(): Promise<{
  headerNav: NavItem[];
  footerNav: typeof footerNav;
}> {
  const [headerDb, footerDb] = await Promise.all([getMenu("header"), getMenu("footer")]);

  const genderItems = mainNav.filter((i) => i.gender);
  const headerTail: NavItem[] = headerDb?.length
    ? headerDb.map(menuNodeToNavItem)
    : mainNav.filter((i) => !i.gender);

  const footer = footerDb?.length
    ? footerDb.map((col) => ({
        title: col.label,
        items: (col.children ?? []).map((c) => ({ label: c.label, href: c.href })),
      }))
    : footerNav;

  return { headerNav: [...genderItems, ...headerTail], footerNav: footer };
}

function menuNodeToNavItem(node: MenuNode): NavItem {
  return {
    label: node.label,
    href: node.href,
    ...(node.children?.length
      ? {
          columns: [
            { title: node.label, items: node.children.map((c) => ({ label: c.label, href: c.href })) },
          ],
        }
      : {}),
  };
}
```

(Đối chiếu type `NavItem`/`NavColumn` thật trong `src/types` và shape `footerNav` trong `src/data/navigation.ts` — chỉnh field cho khớp.)

- [ ] **Step 2: Thread props** — `src/app/layout.tsx`: gọi `getSiteNavigation()` cạnh `getSettings()`, truyền vào `<SiteChrome nav={...}>`; `site-chrome.tsx` nhận prop `nav` chuyển tiếp `SiteHeader`/`SiteFooter`; 2 component đó (và `desktop-nav.tsx`) đổi từ import tĩnh sang nhận props, giữ nguyên markup. Mobile nav nếu cũng import `mainNav` → cùng pattern.

- [ ] **Step 3: Verify** — chưa có menu DB: site y nguyên (fallback). Tạo menu footer trong admin với 2 cột → footer đổi theo; xóa hết item → fallback trở lại. Header thêm link "Blog" → hiện sau các mục gender.

- [ ] **Step 4: Seed menus** — thêm `seedMenus()` vào `src/db/seed/index.ts` (gọi trong `main()` sau `seedPages()`): insert `header` = các link phụ hiện tại (Khuyến Mãi `/uu-dai/khuyen-mai`, Hàng Mới `/uu-dai/hang-moi`, Tin Tức `/tin-tuc`), `footer` = convert từ `footerNav` tĩnh (map ngược `{title, items}` → `{label, href: "#", children}` — cột không có href thì dùng `"#"`).

- [ ] **Step 5: Build + commit**

```bash
npx tsc --noEmit && npm run build
git add src/lib/cms/navigation.ts src/app/layout.tsx src/components/layout src/db/seed/index.ts
git commit -m "feat(menus): header/footer navigation from DB with static fallback"
```

---

# PHASE 7 — Cleanup + verification tổng

### Task 7.1: Gỡ hệ legacy

**Files:**
- Delete: `src/components/admin/page-builder.tsx`, `src/components/cms/widget-renderer.tsx`, `src/lib/cms/widgets.ts`
- Modify: `src/app/(content)/trang/[slug]/page.tsx`, `src/app/page.tsx`, `src/server/actions/pages.ts`, `src/lib/validators/cms.ts`, `src/lib/repos/pages.repo.ts`

Điều kiện tiên quyết: `npm run db:migrate-puck` đã chạy trên mọi môi trường có dữ liệu thật (mọi page có `content` non-null — kiểm tra: `SELECT slug FROM pages WHERE content IS NULL;` qua `npm run db:studio` phải rỗng).

- [ ] **Step 1: Gỡ nhánh legacy render** — `trang/[slug]/page.tsx` + `page.tsx` (root): xóa import + nhánh `WidgetRenderer`; trang không có `content` → render `<Render>` với data rỗng hoặc `notFound()`:

```tsx
  if (!page.content) notFound(); // mọi trang đã migrate; thiếu content = dữ liệu hỏng
  return <Render config={serverConfig} data={page.content} />;
```

(trang chủ: `if (homePage?.content)` giữ nguyên — fallback hardcode giữ lại làm an toàn cuối)

- [ ] **Step 2: Xóa file legacy** — `git rm src/components/admin/page-builder.tsx src/components/cms/widget-renderer.tsx src/lib/cms/widgets.ts`. Sửa các import gãy: `savePageAction` trong `pages.ts` actions (xóa luôn action + `pageInputSchema`/`pageBlockSchema` nếu không còn ai dùng — `page-settings-form` dùng schema mới rồi; `processBlocks` + import `renderTiptapHtml` trong `pages.repo.ts` xóa cùng `createPage`/`updatePage` legacy — `createPageShell`/`updatePageSettings`/`updatePageContent` là bộ thay thế). Lưu ý: copy hàm `slugify` từ `page-builder.tsx` sang `page-settings-form.tsx` TRƯỚC khi xóa (đã làm ở Task 5.1).

- [ ] **Step 3: Typecheck quét import gãy**

```bash
npx tsc --noEmit && npm test && npm run build
```

Expected: sạch. Nếu file nào còn import widget-renderer/widgets.ts → sửa nốt.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove legacy page builder and widget renderer"
```

### Task 7.2: Drop cột `blocks` (chỉ sau khi 7.1 đã verify trên môi trường thật)

**Files:**
- Modify: `src/db/schema/cms.ts`, `src/db/seed/index.ts`, drizzle migration mới

- [ ] **Step 1:** Xóa cột `blocks` + type `PageBlock` khỏi schema. `migrate-legacy.ts` giữ type `PageBlock` cục bộ (định nghĩa lại trong file đó — script lịch sử vẫn compile). Seed bỏ field `blocks`.
- [ ] **Step 2:** `npm run db:generate` → kiểm tra SQL chỉ DROP COLUMN → `npm run db:migrate`.
- [ ] **Step 3:** `npx tsc --noEmit && npm test && npm run build` sạch → commit `"chore: drop legacy pages.blocks column"`.

### Task 7.3: Verification tổng (E2E thủ công bằng Playwright MCP hoặc tay)

- [ ] **Checklist nghiệm thu** (chạy `npm run dev`, login admin):
  1. **Typography (yêu cầu gốc):** editor bài viết `/admin/articles` — H2/H3/ul/blockquote hiển thị đúng style prose NGAY TRONG editor; bài viết public render đúng; richText widget trong builder + trang public đúng.
  2. **Builder Elementor-like:** tạo trang mới end-to-end (Task 5.1 Step 4 flow); kéo-thả TRỰC TIẾP trên preview; nested Section→Columns→Widget; sửa props thấy ngay; viewport mobile/tablet/desktop; undo/redo (Ctrl+Z mặc định của Puck); inline edit heading nếu bật contentEditable.
  3. **26 widget:** mỗi widget kéo vào canvas hiển thị không lỗi console.
  4. **Trang chủ:** sửa trong builder → Xuất bản → `/` cập nhật (fix revalidate hoạt động).
  5. **Draft:** Lưu nháp → public không đổi; Xem trước thấy bản nháp; user thường truy cập `/xem-truoc/{id}` → redirect.
  6. **Bug fixes:** xóa trang hệ thống bị chặn; sitemap có `/trang/*`; build không warning middleware.
  7. **Menu:** sửa menu footer → footer đổi sau reload.
  8. **Regression:** giỏ hàng, listing sản phẩm, chi tiết sản phẩm, đặt hàng — hoạt động bình thường (không đụng code nhưng vẫn smoke test).
- [ ] **Gate cuối:** `npx tsc --noEmit && npm test && npm run build` — tất cả sạch.
- [ ] **Push:** `git push origin main`.

---

## Ghi chú thực thi

- **Thứ tự bắt buộc:** Phase 0 → 1 → 2 → 3 → (4, 5, 6 độc lập, làm song song được) → 7. Phase 7 chỉ chạy khi 1-6 xong và đã verify.
- **Mỗi phase ship được:** sau Phase 0 đã fix được toàn bộ bug user báo; sau Phase 1 builder dùng được tối thiểu; sau Phase 3 dữ liệu an toàn 2 chiều (content + blocks song song).
- **Khi API Puck lệch so với plan** (0.x): tin `node_modules/@puckeditor/core/dist/*.d.ts` + docs https://puckeditor.com/docs hơn là code trong plan; giữ nguyên Ý ĐỊNH của task.
- **Không sửa** `src/components/cms/widget-renderer.tsx` trong Phase 2 — chỉ copy. File sống đến Phase 7.




