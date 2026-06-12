# Thiết kế: Page Builder chuyên nghiệp (Elementor-like) cho Admin

**Ngày:** 2026-06-12
**Trạng thái:** Chờ duyệt
**Quyết định đã chốt với user:** dùng Puck · migrate tự động dữ liệu cũ · scope đầy đủ (fix bugs + mở rộng widget + menus admin) · builder fullscreen

## 1. Mục tiêu

Thay builder tự chế hiện tại (`src/components/admin/page-builder.tsx` — canvas dạng danh sách card, không preview) bằng trình thiết kế trực quan chuẩn Elementor/UX Builder:

- Kéo-thả widget **trực tiếp trên preview thật** của trang (iframe canvas)
- Bố cục lồng nhau: Section → Columns → Widget
- Panel cài đặt widget tự sinh từ field config, chỉnh sửa thấy ngay
- Chuyển viewport responsive (mobile/tablet/desktop)
- Inline editing cho text, undo/redo
- Đầy đủ bộ widget (20 widget hiện có + widget mới từ section trang chủ)

Kèm theo: fix lỗi thiếu `@tailwindcss/typography`, fix 4 bug đã phát hiện, xây admin quản lý Menu.

## 2. Nền tảng: Puck (`@puckeditor/core` ^0.21.3)

- MIT, công ty Measured đứng sau, phát triển tích cực (release 2026-06-08), React 19 + Next App Router + RSC first-class.
- **Lưu ý scope npm:** dùng `@puckeditor/core` (scope mới từ v0.21), KHÔNG dùng `@measured/puck` (đã đóng băng ở 0.20.2).
- Map khái niệm: Puck `Config` component = widget · `slot` field = vùng chứa con (section/columns) · auto-generated fields panel = inspector · `<Render>` = render công khai RSC · viewport switcher có sẵn.
- Dữ liệu là JSON tree `{ root: { props }, content: ComponentData[] }`, slot lồng trong props — lưu thẳng vào JSONB.
- Rủi ro 0.x: dùng `migrate()` API của Puck khi nâng version; pin minor version.

## 3. Kiến trúc

### 3.1 Cấu trúc module mới

```
src/lib/builder/
  definitions.ts        # Metadata dùng chung: type, label, category, fields, defaultProps
                        # (kế thừa/thay thế src/lib/cms/widgets.ts)
  config.client.tsx     # Puck Config cho editor (client) — commerce widget fetch /api/*
  config.server.tsx     # Config cho <Render> công khai (RSC) — commerce widget query DB trực tiếp
  migrate-legacy.ts     # Hàm thuần: PageBlock[] (cũ) -> Puck Data (mới). Unit-test được.
src/components/cms/widgets/   # Tách toàn bộ switch trong widget-renderer.tsx thành
                              # component per-widget, dùng chung cho cả 2 config
```

Nguyên tắc: **một widget = một file render + một entry definitions**. Editor config và server config chỉ khác nhau ở cách lấy data (client fetch API vs RSC query repo), phần render UI dùng chung component.

### 3.2 Widget chứa data động (commerce)

- `productGrid`, `productCarousel`, `featuredCategories`, `articleStrip`: trên trang công khai render qua RSC query trực tiếp repo (như hiện tại). Trong editor iframe (client), component tự fetch qua API có sẵn: `/api/products?flag=...&limit=...`, `/api/categories`, `/api/articles` — có skeleton loading.

### 3.3 Bố cục (layout widgets)

- **Section** (mới): full-width, props nền (màu/ảnh), padding, độ rộng container; chứa 1 slot.
- **Columns** (làm lại): fields `count` (2-4) + `gap`; định nghĩa 4 slot `column1..4`, render `count` slot đầu theo CSS grid. Theo guide chính thức "multi-column layouts" của Puck.
- Spacer/Divider giữ nguyên (giá trị px → inline style, tránh vấn đề Tailwind v4 dynamic class).

### 3.4 Rich text

- Giữ pipeline Tiptap hiện có: widget `richText` lưu `contentJson` (Tiptap JSON), server cache HTML qua `renderTiptapHtml()` trong `processBlocks()` (port sang xử lý Puck Data).
- Field editor: bọc `RichTextEditor` (Tiptap, đã có) thành Puck `custom` field. Không dùng richtext field built-in của Puck để khỏi đổi format dữ liệu + giữ MediaPicker tích hợp.

### 3.5 Routes & UX

| Route | Vai trò |
|---|---|
| `/admin/pages` | List (giữ nguyên), nút "Thiết kế" → builder |
| `/admin/pages/new` | Form gọn: title + slug → tạo draft → redirect builder |
| `/admin/pages/[id]` | Trang cài đặt: title/slug/status/SEO + nút "Mở trình thiết kế" |
| `/admin/pages/[id]/builder` | **Builder fullscreen** — route group mới `(builder)` với layout riêng tối giản (vẫn `requireStaff()`), thoát sidebar admin |
| `/xem-truoc/[id]` | Preview trang nháp: chrome site thật, `requireStaff()` trong page, `force-dynamic` |

Builder header (Puck overrides/compositional API): tên trang, viewport switcher, undo/redo, nút Xem trước, Lưu nháp, Xuất bản, Thoát.

### 3.6 Dữ liệu & migration

1. Drizzle migration: thêm cột `content jsonb` (Puck Data) vào `pages`. Giữ cột `blocks` làm backup.
2. Script `scripts/migrate-pages-to-puck.ts`: đọc mọi page, chạy `migrate-legacy.ts` map `blocks[]` → Puck Data, ghi vào `content`. Idempotent (bỏ qua page đã có content).
3. Mapping: mỗi block `{id, type, props}` → `{type, props: {id, ...props}}`; `columns` cũ (`{count, columns: PageBlock[][]}`) → `Columns` mới với slot `column1..4`; props giữ nguyên tên.
4. Cập nhật seed (`src/db/seed/index.ts`) sinh thẳng Puck Data cho trang home.
5. App code chuyển hết sang `content`; renderer cũ (`widget-renderer.tsx` switch) và `page-builder.tsx` cũ xóa sau khi hoàn tất.
6. Migration cuối (sau khi verify): drop cột `blocks`.

### 3.7 Tailwind v4 + iframe

- Thêm `@plugin "@tailwindcss/typography";` vào `globals.css` ngay sau 3 dòng `@import` → fix lỗi typography cho: editor admin (`prose prose-sm` trong `rich-text-editor.tsx`), `RichTextContent`, bài viết, product tabs, và mọi trang builder.
- Mọi giá trị động (số cột, căn lề, chiều cao hero...) dùng **map class literal** hoặc inline style — không template string class (Tailwind v4 không sinh class runtime).
- Iframe editor: Puck tự inject style của parent; fonts dùng `next/font` gắn CSS variable trên `<html>` — cần verify trong iframe, nếu thiếu thì set biến font trong root render wrapper của config.

## 4. Bộ widget v1

**Giữ & port (20):** columns, spacer, divider, heading, richText, button, iconList, faqAccordion, testimonial, hero, bannerImage, image, gallery, videoEmbed, logoMarquee, productGrid, productCarousel, featuredCategories, countdown, newsletter.

**Mới (6):**
| Widget | Nguồn | Ghi chú |
|---|---|---|
| `section` | mới | Container nền/padding/width, 1 slot |
| `heroCarousel` | `src/components/home/hero-carousel.tsx` | Array field slides (image, alt, href), autoplay |
| `promoBanner` | `src/components/home/promo-banner.tsx` | Gradient from/to, CTA |
| `articleStrip` | `src/components/home/story-strip.tsx` | Bài viết mới nhất, limit |
| `categoryTiles` | `src/components/home/category-tiles.tsx` | Array field tiles (image, label, href) |
| `htmlEmbed` | mới | Raw HTML (sanitize DOMPurify) cho mã nhúng |

Nâng cấp field: dùng `array` field của Puck cho gallery/logoMarquee/faqAccordion/iconList (thay vì "mỗi dòng 1 mục" — UX kém). `image` field = custom field bọc MediaPicker có sẵn.

## 5. Fix bugs (ngoài typography)

1. **revalidatePath sai** (`src/server/actions/pages.ts`): sửa thành `/trang/{slug}`; nếu `isSystem && slug === "home"` thì revalidate `/`; khi đổi slug revalidate cả path cũ.
2. **Sitemap** (`src/app/sitemap.ts`): thêm `listPublishedPageSlugs()` → `/trang/{slug}` (loại trang system home).
3. **Bảo vệ isSystem**: chặn delete + chặn đổi slug ở cả UI lẫn server action.
4. **middleware → proxy**: rename theo deprecation của Next 16.2.9 (codemod `middleware-to-proxy`), giữ nguyên logic auth gate.
5. **Draft preview**: route `/xem-truoc/[id]` (mục 3.5).

## 6. Admin quản lý Menu

- Dùng bảng `menus` có sẵn (key `header`/`footer`, `items: MenuNode[]` — hiện là dead code).
- Thêm mục "Menu" vào admin sidebar (`src/components/admin/admin-sidebar.tsx`) → trang mới `/admin/menus`: 2 tab header/footer, cây item (label, href, con 1 cấp), kéo-thả sắp xếp (dnd-kit đã có), picker link nhanh từ trang CMS/danh mục.
- Render: `site-header`/`desktop-nav`/`site-footer` đọc menu từ DB (fetch trong layout RSC, cache + `revalidateTag("menus")` khi lưu), fallback về `src/data/navigation.ts` khi bảng trống.
- Seed menus từ nav tĩnh hiện tại.

## 7. Ngoài phạm vi (v2+)

- Per-breakpoint props (padding riêng mobile) — viewport switcher chỉ là preview
- Page revisions/version history, A-B test, i18n
- Template library/saved blocks
- Global theme panel trong builder

## 8. Kiểm thử & xác minh

- **Unit (vitest, thêm mới tối thiểu):** `migrate-legacy.ts` (mọi widget type, columns lồng, props lạ), guard isSystem, menu validators.
- **Build gate:** `tsc --noEmit` + `next build` sạch.
- **E2E thủ công (Playwright MCP):** tạo trang → kéo widget vào section/columns → sửa props → preview draft → publish → kiểm tra `/trang/{slug}` và `/` (home) cập nhật; kiểm tra typography H1-H4/ul/blockquote render đúng trong editor lẫn trang công khai.
- **Migration:** chạy script trên DB seed, so sánh render trang home trước/sau.

## 9. Rủi ro & đối sách

| Rủi ro | Đối sách |
|---|---|
| Puck 0.x breaking changes | Pin `~0.21.3`, dùng `migrate()` API, cô lập import Puck trong `src/lib/builder/` |
| Iframe thiếu style/font | Verify sớm ngay task setup; fallback `iframe: false` của Puck nếu kẹt (mất isolation nhưng vẫn chạy) |
| Commerce widget chậm trong editor | Skeleton + cache fetch theo (flag, limit) |
| Mất dữ liệu khi migrate | Giữ cột `blocks` đến migration cuối; script idempotent; chạy thử trên seed trước |
