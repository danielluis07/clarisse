export const Newsletter = () => {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/55">
          Newsletter
        </p>
        <h2 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight md:text-5xl">
          Receba antes <span className="italic">de todos</span>
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-foreground/70 md:text-base">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lançamentos,
          editoriais e acesso antecipado às novas coleções diretamente no seu
          e-mail.
        </p>

        <form
          className="mx-auto mt-10 flex max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:gap-0"
          aria-label="Inscrição na newsletter"
        >
          <input
            type="email"
            required
            placeholder="seu e-mail"
            aria-label="Seu e-mail"
            className="w-full border-b border-foreground/30 bg-transparent px-2 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none sm:border-b sm:border-r-0"
          />
          <button
            type="submit"
            className="whitespace-nowrap bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-85"
          >
            Inscrever
          </button>
        </form>

        <p className="mt-6 text-xs text-foreground/50">
          Ao se inscrever, você concorda com nossa política de privacidade.
        </p>
      </div>
    </section>
  );
};
