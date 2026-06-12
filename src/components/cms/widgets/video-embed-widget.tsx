export function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export function VideoEmbedWidget({
  url = "",
  ratio = "16/9",
}: {
  url?: string;
  ratio?: string;
}) {
  if (!url) return null;
  const embed = toEmbedUrl(url);
  return (
    <section className="container-page py-6">
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: (ratio || "16/9").replace("/", " / ") }}
      >
        <iframe
          src={embed}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
