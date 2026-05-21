"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ImageOff, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { centsToReais } from "@/lib/utils";
import { ProductStatusCell } from "@/modules/products/components/product-status-cell";
import { ProductsCellAction } from "@/modules/products/components/products-cell-action";
import type { ProductListItem } from "@/modules/products/types";

export const columns: ColumnDef<ProductListItem>[] = [
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
    header: "Produto",
    cell: ({ row }) => {
      const product = row.original;
      const productHref = `/admin/products/${product.id}`;
      const primaryImage = product.primaryImage;

      const nameNode = (
        <span
          className={
            product.name.length > 38
              ? "inline-block max-w-48 truncate"
              : undefined
          }>
          {product.name}
        </span>
      );

      const nameLink = (
        <Link className="font-semibold" href={productHref}>
          {nameNode}
        </Link>
      );

      return (
        <div className="flex min-w-56 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
            {primaryImage?.url ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="size-4" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {product.name.length > 38 ? (
                <Tooltip>
                  <TooltipTrigger asChild>{nameLink}</TooltipTrigger>
                  <TooltipContent>
                    <span>{product.name}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                nameLink
              )}
              {product.isFeatured && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Sparkles
                      className="size-3.5 text-primary"
                      aria-label="Produto em destaque"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Produto em destaque</TooltipContent>
                </Tooltip>
              )}
            </div>
            <span className="max-w-48 truncate text-xs text-muted-foreground">
              /{product.slug}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      const category = row.original.category;

      if (!category) {
        return <span className="text-muted-foreground">Sem categoria</span>;
      }

      return (
        <span className="inline-block max-w-40 truncate">{category.name}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <ProductStatusCell id={row.original.id} status={row.original.status} />
    ),
  },
  {
    accessorKey: "basePriceCents",
    header: "Preço",
    cell: ({ row }) => {
      const product = row.original;
      const compare = product.compareAtPriceCents;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium tabular-nums">
            {centsToReais(product.basePriceCents)}
          </span>
          {compare != null && compare > product.basePriceCents && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {centsToReais(compare)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalStock",
    header: "Estoque",
    cell: ({ row }) => {
      const product = row.original;
      const out = product.outOfStockVariantCount;
      const low = product.lowStockVariantCount;

      const variantLabel =
        product.variantCount === 1
          ? "1 variação"
          : `${product.variantCount} variações`;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium tabular-nums">
            {product.totalStock} un.
          </span>
          <span className="text-xs text-muted-foreground">
            {variantLabel}
            {out > 0 ? ` · ${out} sem estoque` : low > 0 ? ` · ${low} baixo` : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Atualizado em",
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;
      return format(updatedAt, "dd/MM/yyyy", { locale: ptBR });
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const product = row.original;
      return <ProductsCellAction id={product.id} name={product.name} />;
    },
  },
];
