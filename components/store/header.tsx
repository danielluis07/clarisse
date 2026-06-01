import Link from "next/link";
import { Suspense } from "react";
import { User, Menu } from "lucide-react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { CartSheet } from "@/components/store/cart/cart-sheet";
import { HeaderNav, HeaderNavSkeleton } from "@/components/store/header-nav";
import { SearchDialog } from "@/components/store/search-dialog";

export const Header = () => {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur">
      <AnnouncementBar />
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-6 md:h-20 md:px-10">
          <div className="flex flex-1 items-center gap-6">
            <button
              type="button"
              aria-label="Abrir menu"
              className="text-foreground/80 transition-colors hover:text-foreground lg:hidden">
              <Menu className="size-5" />
            </button>
            <SearchDialog />
          </div>

          <Link
            href="/"
            aria-label="Clarisse — Início"
            className="font-heading text-xl tracking-[0.32em] md:text-[26px]">
            CLARISSE
          </Link>

          <div className="flex flex-1 items-center justify-end gap-5">
            <SearchDialog trigger="mobile" />
            <Link
              href="/login"
              aria-label="Conta"
              className="hidden text-foreground/80 transition-colors hover:text-foreground md:inline-flex">
              <User className="size-5" />
            </Link>
            <CartSheet />
          </div>
        </div>

        <Suspense fallback={<HeaderNavSkeleton />}>
          <HeaderNav />
        </Suspense>
      </header>
    </div>
  );
};
