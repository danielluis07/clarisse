"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export const AccountSignOutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
          onError: (e) => {
            console.error("Sign-out error:", e);
            toast.error("Erro ao sair da conta. Tente novamente.");
          },
        },
      });
    } catch (e) {
      console.error("Sign-out error:", e);
      toast.error("Erro ao sair da conta. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="group inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50">
      {isPending ? (
        <Spinner className="size-3.5" />
      ) : (
        <LogOut className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
      Sair
    </button>
  );
};
