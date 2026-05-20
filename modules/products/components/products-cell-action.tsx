"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteProduct } from "@/modules/products/hooks";
import { useConfirm } from "@/providers/confirm-provider";

const getErrorMessage = (error: unknown) => {
  return error instanceof Error
    ? error.message
    : "Não foi possível excluir o produto.";
};

export const ProductsCellAction = ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const { confirm, closeConfirm, setPending } = useConfirm();
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    const confirmed = await confirm(
      "Excluir produto?",
      `O produto "${name}" será removido permanentemente. Para produtos com pedidos vinculados, arquive em vez de excluir.`,
    );

    if (!confirmed) return;

    try {
      setPending(true);
      await deleteProduct.mutateAsync({ id });
      toast.success("Produto excluído com sucesso.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      closeConfirm();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Abrir menu">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${id}`}>
              <Edit />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
