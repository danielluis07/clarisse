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
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
      return (
        <>
          {name.length > 30 ? (
            <Tooltip>
              <TooltipTrigger className="cursor-pointer" asChild>
                <Link
                  className="w-24 truncate cursor-default font-semibold"
                  href={`/admin/customers/${row.original.id}`}>
                  <span>{name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <span>{name}</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href={`/admin/customers/${row.original.id}`}>
              <span className="font-semibold">{name}</span>
            </Link>
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
