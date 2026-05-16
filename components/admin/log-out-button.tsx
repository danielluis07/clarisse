"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useConfirm } from "@/providers/confirm-provider";

export const LogOutButton = () => {
  const router = useRouter();

  const { confirm, closeConfirm, setPending } = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm(
      "Tem certeza que deseja sair?",
      "Ao continuar, você será desconectado da sua conta.",
    );

    if (confirmed) {
      setPending(true);

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setPending(false);
            closeConfirm();
            router.push("/login");
          },
          onError: (e) => {
            console.error("Sign-out error:", e);
            setPending(false);
            toast.error("Erro ao sair da conta. Tente novamente.");
          },
        },
      });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip="Sair"
          className="text-red-500 hover:bg-red-500/10 hover:text-red-500 dark:text-red-400 dark:hover:bg-red-400/10 dark:hover:text-red-400 [&>svg]:shrink-0">
          <LogOut className="size-4" />
          <span className="font-medium pb-0.5">Sair</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
