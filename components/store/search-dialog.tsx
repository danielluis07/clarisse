"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const SearchDialog = ({
  trigger = "desktop",
}: {
  trigger?: "desktop" | "mobile";
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/products");
      setOpen(false);
      return;
    }

    const params = new URLSearchParams({ search: query });

    router.push(`/products?${params.toString()}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Buscar"
          className={cn(
            "text-foreground/80 transition-colors hover:text-foreground",
            trigger === "desktop"
              ? "hidden items-center gap-2 lg:flex"
              : "lg:hidden",
          )}>
          <Search className={trigger === "desktop" ? "size-4" : "size-5"} />
          {trigger === "desktop" ? (
            <span className="text-[11px] uppercase tracking-[0.22em]">
              Buscar
            </span>
          ) : null}
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-none p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Buscar produtos</DialogTitle>
        <DialogDescription className="sr-only">
          Digite o nome do produto que deseja encontrar.
        </DialogDescription>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-foreground/45"
            />
            <Input
              autoFocus
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar peças"
              aria-label="Buscar produtos"
              className="h-16 rounded-none border-0 px-14 text-base shadow-none focus-visible:ring-0"
            />
            {search ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Limpar busca"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-none"
                onClick={() => setSearch("")}>
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
