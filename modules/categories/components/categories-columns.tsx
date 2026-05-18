"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import type { CategoryOutput } from "@/modules/categories/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TruncatedText = ({
  value,
  className,
  maxLength = 38,
}: {
  value: string;
  className?: string;
  maxLength?: number;
}) => {
  const content = (
    <span className={value.length > maxLength ? className : undefined}>
      {value}
    </span>
  );

  if (value.length <= maxLength) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>
        <span>{value}</span>
      </TooltipContent>
    </Tooltip>
  );
};

export const columns: ColumnDef<CategoryOutput>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex min-w-40 flex-col gap-1">
          <span className="font-semibold">
            <TruncatedText
              value={category.name}
              className="inline-block max-w-40 truncate"
            />
          </span>
          <span className="max-w-40 truncate text-xs text-muted-foreground">
            /{category.slug}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.original.description;

      if (!description) {
        return <span className="text-muted-foreground">Sem descrição</span>;
      }

      return (
        <TruncatedText
          value={description}
          className="inline-block max-w-72 truncate"
          maxLength={64}
        />
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <span className="inline-flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className={
              isActive
                ? "size-2 rounded-full bg-primary"
                : "size-2 rounded-full bg-muted-foreground/40"
            }
          />
          {isActive ? "Ativa" : "Inativa"}
        </span>
      );
    },
  },
  {
    accessorKey: "displayOrder",
    header: "Ordem",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {row.original.displayOrder}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Atualizada em",
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;
      return format(updatedAt, "dd/MM/yyyy", { locale: ptBR });
    },
  },
];
