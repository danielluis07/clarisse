import { AccountSignOutButton } from "@/modules/account/components/account-sign-out-button";
import type { AccountUser } from "@/modules/account/types";

const getFirstName = (name: string) => name.trim().split(/\s+/)[0] || name;

export const AccountPageHeader = ({ user }: { user: AccountUser }) => {
  const firstName = getFirstName(user.name);
  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div className="flex flex-wrap items-start justify-between gap-6 border-b border-foreground/10 pb-8">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.4em] text-foreground/45">
          Minha conta
        </p>
        <h1 className="mt-5 font-heading text-4xl font-light leading-[1.02] tracking-tight md:text-6xl">
          Olá, {firstName}.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/60">
          Acompanhe os seus pedidos, gerencie os seus dados e mantenha os seus
          endereços sempre atualizados.
        </p>
      </div>

      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/40">
          Membro desde {memberSince}
        </span>
        <AccountSignOutButton />
      </div>
    </div>
  );
};
