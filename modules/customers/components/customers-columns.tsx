"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import type { CustomerOutput } from "@/modules/customers/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export const columns: ColumnDef<CustomerOutput>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
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
    header: "Nome",
    cell: ({ row }) => {
      const name = row.original.name;
      const customerHref = `/admin/customers/${row.original.id}`;
      const customerLink = (
        <Link className="font-semibold" href={customerHref}>
          <span
            className={
              name.length > 30 ? "inline-block max-w-24 truncate" : ""
            }>
            {name}
          </span>
        </Link>
      );

      return (
        <>
          {name.length > 30 ? (
            <Tooltip>
              <TooltipTrigger asChild>{customerLink}</TooltipTrigger>
              <TooltipContent>
                <span>{name}</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            customerLink
          )}
        </>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Cadastro em",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return format(createdAt, "dd/MM/yyyy", { locale: ptBR });
    },
  },
];
