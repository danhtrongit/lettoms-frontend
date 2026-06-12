import Image from "next/image";

export function LogoMarqueeWidget({
  heading = "",
  images = [],
}: {
  heading?: string;
  images?: { src: string }[];
}) {
  const valid = images.filter((i) => i.src);
  return (
    <section className="container-page py-8">
      {heading && (
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
          {heading}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
        {valid.map((img, i) => (
          <div key={i} className="relative h-10 w-28">
            <Image src={img.src} alt="" fill sizes="112px" className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
