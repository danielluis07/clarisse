"use client";

import { Bell, BellOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const NotificationsBell = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative">
          <Bell className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">Notificações</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <BellOff className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Nenhuma notificação</p>
          <p className="text-xs text-muted-foreground">
            Você está em dia. Novas notificações aparecerão aqui.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
