"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCategory } from "@/modules/categories/hooks";
import { useConfirm } from "@/providers/confirm-provider";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const getErrorMessage = (error: unknown) => {
  return error instanceof Error
    ? error.message
    : "Não foi possível excluir a categoria.";
};

export const CategoriesCellAction = ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const { confirm, closeConfirm, setPending } = useConfirm();
  const deleteCategory = useDeleteCategory();

  const handleDelete = async () => {
    const confirmed = await confirm(
      "Excluir categoria?",
      `A categoria "${name}" será removida permanentemente. Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setPending(true);
      await deleteCategory.mutateAsync({ id });
      toast.success("Categoria excluída com sucesso.");
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
            <Link href={`/admin/categories/${id}`}>
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
