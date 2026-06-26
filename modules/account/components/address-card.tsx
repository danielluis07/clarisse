import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AccountAddress } from "@/modules/account/types";

export const AddressCard = ({
  address,
  onEdit,
}: {
  address: AccountAddress;
  onEdit?: (address: AccountAddress) => void;
}) => {
  return (
    <article className="flex flex-col border border-foreground/10 bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-foreground/10 px-5 py-4">
        <span className="text-[11px] uppercase tracking-[0.22em] text-foreground/70">
          {address.label}
        </span>
        {address.isDefault && (
          <Badge className="text-[10px] uppercase tracking-[0.14em]">
            Padrão
          </Badge>
        )}
      </div>

      <div className="flex-1 px-5 py-5 text-sm leading-relaxed text-foreground/70">
        <p className="font-heading text-base font-light text-foreground">
          {address.recipient}
        </p>
        <p className="mt-3">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
        </p>
        <p>
          {address.neighborhood} · {address.city} — {address.state}
        </p>
        <p>CEP {address.postalCode}</p>
        {address.phone && (
          <p className="mt-3 text-foreground/50">{address.phone}</p>
        )}
      </div>

      <div className="flex items-center gap-5 border-t border-foreground/10 px-5 py-3.5">
        <button
          type="button"
          onClick={() => onEdit?.(address)}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-foreground">
          <Pencil className="size-3.5" />
          Editar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-rose-500 transition-colors hover:text-rose-600">
          <Trash2 className="size-3.5" />
          Remover
        </button>
      </div>
    </article>
  );
};
