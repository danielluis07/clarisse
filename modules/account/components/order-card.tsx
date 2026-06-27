import { ArrowRight } from "lucide-react";
import { centsToReais } from "@/lib/utils";
import { OrderStatusBadge } from "@/modules/account/components/order-status-badge";
import type { AccountOrder } from "@/modules/account/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const formatItemCount = (count: number) =>
  count === 1 ? "1 item" : `${count} itens`;

export const OrderCard = ({ order }: { order: AccountOrder }) => {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <article className="border border-foreground/10 bg-background">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-base font-light tracking-tight">
            Pedido {order.number}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-foreground/45">
            {dateFormatter.format(new Date(order.placedAt))} ·{" "}
            {formatItemCount(itemCount)}
          </span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="divide-y divide-foreground/5 px-5 md:px-6">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 py-4 last:pb-5 first:pt-5">
            <div className="flex aspect-3/4 w-12 shrink-0 items-center justify-center bg-foreground/5 font-heading text-lg text-foreground/25">
              {item.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-light leading-tight">
                {item.name}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                {item.variant} · {item.quantity}x
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-4 border-t border-foreground/10 px-5 py-4 md:px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            Total
          </span>
          <span className="font-heading text-lg tabular-nums">
            {centsToReais(order.totalCents)}
          </span>
        </div>
        <button
          type="button"
          className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-foreground">
          Ver detalhes
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
};
