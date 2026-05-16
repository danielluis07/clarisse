import { Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsBell } from "@/components/admin/notifications-bell";

export const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <div className="ml-auto flex items-center gap-1">
        <NotificationsBell />
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Moon className="size-4" />
        </Button>
      </div>
    </header>
  );
};
