import Image from "next/image";

export function TestimonialWidget({
  quote,
  author,
  role,
  avatar,
}: {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: string;
}) {
  return (
    <section className="container-page py-8">
      <figure className="mx-auto max-w-2xl text-center">
        <blockquote className="text-xl font-medium leading-relaxed">
          "{quote}"
        </blockquote>
        <figcaption className="mt-4 flex items-center justify-center gap-3">
          {avatar && (
            <span className="relative size-10 overflow-hidden rounded-full border bg-muted">
              <Image src={avatar} alt={author ?? ""} fill sizes="40px" className="object-cover" />
            </span>
          )}
          <span className="text-sm">
            <span className="font-semibold">{author}</span>
            {role && (
              <span className="block text-muted-foreground">{role}</span>
            )}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
