import Link from "next/link";
import { Search, User, Menu } from "lucide-react";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { CartSheet } from "@/components/store/cart/cart-sheet";

const primaryNav = [
  { label: "Novidades", href: "/novidades" },
  { label: "Coleções", href: "/colecoes" },
  { label: "Vestidos", href: "/categorias/vestidos" },
  { label: "Alfaiataria", href: "/categorias/alfaiataria" },
  { label: "Bolsas", href: "/categorias/bolsas" },
  { label: "Editorial", href: "/editorial" },
];

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
            <button
              type="button"
              aria-label="Buscar"
              className="hidden items-center gap-2 text-foreground/80 transition-colors hover:text-foreground lg:flex">
              <Search className="size-4" />
              <span className="text-[11px] uppercase tracking-[0.22em]">
                Buscar
              </span>
            </button>
          </div>

          <Link
            href="/"
            aria-label="Clarisse — Início"
            className="font-heading text-xl tracking-[0.32em] md:text-[26px]">
            CLARISSE
          </Link>

          <div className="flex flex-1 items-center justify-end gap-5">
            <button
              type="button"
              aria-label="Buscar"
              className="text-foreground/80 transition-colors hover:text-foreground lg:hidden">
              <Search className="size-5" />
            </button>
            <Link
              href="/login"
              aria-label="Conta"
              className="hidden text-foreground/80 transition-colors hover:text-foreground md:inline-flex">
              <User className="size-5" />
            </Link>
            <CartSheet />
          </div>
        </div>

        <nav className="hidden border-t border-foreground/10 lg:block">
          <ul className="mx-auto flex max-w-screen-2xl items-center justify-center gap-12 px-10 py-3">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[11px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </div>
  );
};
