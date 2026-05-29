export const BrandStatement = () => {
  return (
    <section className="border-b border-foreground/10 bg-background">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <p className="text-[11px] uppercase tracking-[0.4em] text-foreground/45">
          A marca
        </p>
        <p className="mt-8 font-heading text-2xl font-light leading-[1.45] tracking-tight text-foreground md:text-4xl md:leading-[1.4]">
          Acreditamos no luxo silencioso — no corte preciso, no tecido nobre e
          na peça que{" "}
          <span className="italic text-foreground/55">permanece</span> muito além
          das estações, acompanhando a mulher que escolhe menos, melhor e com
          intenção.
        </p>
        <div className="mx-auto mt-12 h-px w-16 bg-foreground/20" />
      </div>
    </section>
  );
};
