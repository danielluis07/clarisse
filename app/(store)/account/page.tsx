import type { Metadata } from "next";

import { requireUser } from "@/lib/auth-utils";
import { AccountView } from "@/modules/account/components/account-view";

export const metadata: Metadata = {
  title: "Minha conta | Clarisse",
  description:
    "Acompanhe os seus pedidos, gerencie os seus dados e os seus endereços na Clarisse.",
  robots: { index: false, follow: false },
};

const AccountPage = async () => {
  const session = await requireUser();

  return (
    <AccountView
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        createdAt: session.user.createdAt,
      }}
    />
  );
};

export default AccountPage;
