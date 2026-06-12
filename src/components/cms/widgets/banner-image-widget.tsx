import Image from "next/image";
import Link from "next/link";

export function BannerImageWidget({
  image = "",
  href = "/",
  alt = "",
  ratio = "16/6",
}: {
  image?: string;
  href?: string;
  alt?: string;
  ratio?: string;
}) {
  if (!image) return null;
  return (
    <section className="container-page py-6">
      <Link href={href || "/"} className="block overflow-hidden rounded-xl">
        <div className="relative w-full" style={{ aspectRatio: (ratio || "16/6").replace("/", " / ") }}>
          <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" />
        </div>
      </Link>
    </section>
  );
}
