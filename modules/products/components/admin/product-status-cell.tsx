"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateProductStatus } from "@/modules/products/hooks";
import type { ProductListItem } from "@/modules/products/types";
import { getProductStatusLabel } from "@/modules/products/utils";

type ProductStatus = ProductListItem["status"];

const STATUS_DOT_CLASS: Record<ProductStatus, string> = {
  draft: "bg-muted-foreground/40",
  active: "bg-primary",
  archived: "bg-destructive/60",
};

const STATUS_OPTIONS: ProductStatus[] = ["draft", "active", "archived"];

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Não foi possível atualizar o status do produto.";

export const ProductStatusCell = ({
  id,
  status,
}: {
  id: string;
  status: ProductStatus;
}) => {
  const updateStatus = useUpdateProductStatus();
  const isPending = updateStatus.isPending;

  const handleSelect = async (next: string) => {
    if (next === status || isPending) return;

    try {
      await updateStatus.mutateAsync({
        id,
        status: next as ProductStatus,
      });
      toast.success("Status atualizado.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-hidden disabled:opacity-60"
        aria-label="Alterar status do produto">
        <span
          aria-hidden
          className={`size-2 rounded-full ${STATUS_DOT_CLASS[status]}`}
        />
        {getProductStatusLabel(status)}
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={status} onValueChange={handleSelect}>
          {STATUS_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              <span
                aria-hidden
                className={`size-2 rounded-full ${STATUS_DOT_CLASS[option]}`}
              />
              {getProductStatusLabel(option)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
