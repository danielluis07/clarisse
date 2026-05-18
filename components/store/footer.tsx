import Link from "next/link";

const columns = [
  {
    title: "Loja",
    links: [
      { label: "Novidades", href: "/novidades" },
      { label: "Vestidos", href: "/categorias/vestidos" },
      { label: "Alfaiataria", href: "/categorias/alfaiataria" },
      { label: "Bolsas", href: "/categorias/bolsas" },
      { label: "Coleções", href: "/colecoes" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Fale conosco", href: "/contato" },
      { label: "Trocas e devoluções", href: "/trocas" },
      { label: "Envio e prazos", href: "/envio" },
      { label: "Guia de tamanhos", href: "/guia-de-tamanhos" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Sobre",
    links: [
      { label: "A marca", href: "/sobre" },
      { label: "Editorial", href: "/editorial" },
      { label: "Sustentabilidade", href: "/sustentabilidade" },
      { label: "Imprensa", href: "/imprensa" },
      { label: "Carreira", href: "/carreira" },
    ],
  },
];

const social = [
  { label: "Instagram", href: "#" },
  { label: "Pinterest", href: "#" },
  { label: "Spotify", href: "#" },
];

const legal = [
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
  { label: "Cookies", href: "/cookies" },
  { label: "Acessibilidade", href: "/acessibilidade" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4 lg:col-span-5">
            <Link
              href="/"
              className="font-heading text-3xl tracking-[0.32em] md:text-[34px]"
            >
              CLARISSE
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-foreground/65">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Peças
              atemporais para a mulher contemporânea, feitas para durar muito
              além das estações.
            </p>
            <div className="mt-10 flex items-center gap-6 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
              {social.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="transition-colors hover:text-foreground"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2 lg:col-span-2">
              <h3 className="font-body text-[11px] uppercase tracking-[0.22em] text-foreground">
                {col.title}
              </h3>
              <ul className="mt-6 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/65 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-body text-[11px] uppercase tracking-[0.22em] text-foreground">
              Estúdio
            </h3>
            <address className="mt-6 text-sm not-italic leading-relaxed text-foreground/65">
              Rua Oscar Freire, 1234
              <br />
              Jardins · São Paulo
              <br />
              SP · 01234-567
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-6 border-t border-foreground/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground/55">
            © 2026 Clarisse. Todos os direitos reservados.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-foreground/55">
            {legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
