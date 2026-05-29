"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="border-t border-foreground/10 bg-secondary">
      <div className="mx-auto max-w-xl px-6 py-24 text-center md:py-32">
        <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/50">
          Newsletter
        </p>
        <h2 className="mt-6 font-heading text-3xl font-light leading-tight tracking-tight md:text-5xl">
          Junte-se à Clarisse
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-foreground/65">
          Receba lançamentos, editoriais de styling e acesso antecipado às
          coleções antes de chegarem ao catálogo.
        </p>

        {submitted ? (
          <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-3 border-y border-foreground/15 py-6 text-sm text-foreground/75">
            <Check className="size-4 text-foreground" />
            Obrigada. Em breve você terá novidades na sua caixa de entrada.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-md">
            <div className="flex items-end border-b border-foreground/25 transition-colors focus-within:border-foreground">
              <label htmlFor="newsletter-email" className="sr-only">
                Seu e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Seu e-mail"
                className="w-full bg-transparent pb-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Assinar a newsletter"
                className="group flex shrink-0 items-center gap-2 pb-3 pl-4 text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground"
              >
                Assinar
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-foreground/45">
              Ao assinar, você concorda em receber comunicações da Clarisse.
              Você pode cancelar quando quiser.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
