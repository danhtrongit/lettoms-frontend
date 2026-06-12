// Helpers to build real Uniqlo VN CDN image URLs from a product id + color code.
// Pattern verified live:
//   main item: https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/{id}/item/vngoods_{color}_{id}_3x4.jpg
//   sub:       https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/{id}/sub/vngoods_{id}_sub{n}_3x4.jpg
//   chip:      https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/{id}/chip/goods_{color}_{id}_chip.jpg

const CDN = "https://image.uniqlo.com/UQ/ST3";

/** 6-digit numeric id, e.g. "484421". Accepts "E484421-000" and normalizes it. */
export function normalizeUniqloId(id: string): string {
  const m = id.match(/(\d{6})/);
  return m ? m[1] : id;
}

export function uniqloItemImage(
  id: string,
  colorCode: string,
  width = 600
): string {
  const pid = normalizeUniqloId(id);
  return `${CDN}/vn/imagesgoods/${pid}/item/vngoods_${colorCode}_${pid}_3x4.jpg?width=${width}`;
}

export function uniqloSubImage(id: string, n: number, width = 600): string {
  const pid = normalizeUniqloId(id);
  return `${CDN}/vn/imagesgoods/${pid}/sub/vngoods_${pid}_sub${n}_3x4.jpg?width=${width}`;
}

export function uniqloChip(id: string, colorCode: string): string {
  const pid = normalizeUniqloId(id);
  return `${CDN}/AsianCommon/imagesgoods/${pid}/chip/goods_${colorCode}_${pid}_chip.jpg`;
}
