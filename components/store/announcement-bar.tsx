const messages = [
  "Frete grátis em compras acima de R$ 500",
  "Novidades da estação chegaram",
  "Parcele em até 6x sem juros",
];

export const AnnouncementBar = () => {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex h-9 max-w-screen-2xl items-center justify-center gap-12 px-6 text-[11px] uppercase tracking-[0.2em] md:px-10">
        <span className="hidden md:inline">{messages[0]}</span>
        <span>{messages[1]}</span>
        <span className="hidden md:inline">{messages[2]}</span>
      </div>
    </div>
  );
};
