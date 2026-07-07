import Image from "next/image";

export const ProductEditorial = ({
  image,
  alt,
  eyebrow = "O ofício por trás da peça",
  quote,
  caption,
}: {
  image: string;
  alt: string;
  eyebrow?: string;
  quote: string;
  caption?: string;
}) => {
  return (
    <section className="relative overflow-hidden border-t border-foreground/10">
      <div className="relative h-[68vh] min-h-120 w-full md:h-[78vh]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-screen-2xl px-6 pb-14 md:px-10 md:pb-20">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">
            {eyebrow}
          </p>
          <blockquote className="mt-6 max-w-3xl font-heading text-3xl font-light italic leading-[1.15] text-white md:text-4xl lg:text-5xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          {caption && (
            <p className="mt-7 text-[11px] uppercase tracking-[0.3em] text-white/70">
              — {caption}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
