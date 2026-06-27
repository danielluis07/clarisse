"use client";

import { cn } from "@/lib/utils";
import { ACCOUNT_NAV } from "@/modules/account/constants";
import type { AccountTab } from "@/modules/account/types";

export const AccountNav = ({
  active,
  onSelect,
}: {
  active: AccountTab;
  onSelect: (tab: AccountTab) => void;
}) => {
  return (
    <nav
      aria-label="Navegação da conta"
      className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
      {ACCOUNT_NAV.map((item) => {
        const isActive = item.id === active;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex shrink-0 items-center gap-3 px-4 py-3 text-left transition-colors lg:w-full",
              isActive
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
            )}>
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-background" : "text-foreground/45",
              )}
            />
            <span className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.18em] whitespace-nowrap">
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 hidden text-[11px] leading-tight lg:block",
                  isActive ? "text-background/55" : "text-foreground/40",
                )}>
                {item.description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
};
