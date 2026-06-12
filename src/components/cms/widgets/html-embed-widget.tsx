import DOMPurify from "isomorphic-dompurify";

export function HtmlEmbedWidget({ html = "" }: { html?: string }) {
  if (!html.trim()) return null;
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "src"],
  });
  return (
    <section className="container-page py-6">
      <div dangerouslySetInnerHTML={{ __html: clean }} />
    </section>
  );
}
