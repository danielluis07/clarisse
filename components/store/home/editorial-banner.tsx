import Image from "next/image";

export const EditorialBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[72vh] min-h-[540px] w-full md:h-[80vh]">
        <Image
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2400&auto=format&fit=crop"
          alt="Editorial Clarisse"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white md:px-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">
            Manifesto
          </p>
          <blockquote className="mt-8 max-w-3xl font-heading text-3xl font-light italic leading-[1.15] md:text-5xl lg:text-6xl">
            “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna.”
          </blockquote>
          <p className="mt-10 text-[11px] uppercase tracking-[0.3em] text-white/75">
            — Clarisse, fundadora
          </p>
        </div>
      </div>
    </section>
  );
};
