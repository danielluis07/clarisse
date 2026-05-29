import { Truck, Undo2, ShieldCheck, Headset } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const services: Service[] = [
  {
    icon: Truck,
    title: "Frete grátis",
    description: "Em compras acima de R$ 800 para todo o Brasil.",
  },
  {
    icon: Undo2,
    title: "Trocas em 30 dias",
    description: "Devoluções gratuitas, sem complicação.",
  },
  {
    icon: ShieldCheck,
    title: "Pagamento seguro",
    description: "Em até 6x sem juros nos cartões.",
  },
  {
    icon: Headset,
    title: "Atendimento",
    description: "Consultoria de estilo de segunda a sábado.",
  },
];

export const ServiceHighlights = () => {
  return (
    <section className="border-y border-foreground/10 bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
        <ul className="grid grid-cols-1 divide-y divide-foreground/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {services.map((service, index) => (
            <li
              key={service.title}
              className="flex items-start gap-4 py-10 lg:border-l lg:border-foreground/10 lg:px-8 lg:first:border-l-0 lg:first:pl-0"
              data-index={index}
            >
              <service.icon
                className="size-5 shrink-0 text-foreground/70"
                strokeWidth={1.5}
              />
              <div>
                <h3 className="font-body text-[12px] uppercase tracking-[0.22em] text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {service.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
