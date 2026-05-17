"use client";

import { SidebarHeader as Header, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export const SidebarHeader = () => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  if (isPending) {
    return (
      <Header>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-1.5",
            isCollapsed && "justify-center",
          )}>
          <Skeleton className="size-8 shrink-0 rounded-full" />
          {!isCollapsed && (
            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          )}
        </div>
      </Header>
    );
  }

  return (
    <Header>
      <div
        aria-label="Admin"
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
          isCollapsed && "justify-center",
        )}>
        <Avatar className="shrink-0">
          <AvatarImage
            src={user?.image ?? "/images/user-placeholder.jpg"}
            alt={user?.name ?? "Admin"}
          />
          <AvatarFallback className="text-xs font-semibold">
            {user?.name ? getInitials(user.name) : "AD"}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-tight">
              {user?.name ?? "Admin"}
            </span>
            <span className="truncate text-xs leading-tight text-muted-foreground">
              {user?.email ?? ""}
            </span>
          </div>
        )}
      </div>
    </Header>
  );
};
