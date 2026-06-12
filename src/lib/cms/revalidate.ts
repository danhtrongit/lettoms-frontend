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
