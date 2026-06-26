"use client";

import { useState } from "react";
import { AccountPageHeader } from "@/modules/account/components/account-page-header";
import { AccountNav } from "@/modules/account/components/account-nav";
import { AccountOverview } from "@/modules/account/components/account-overview";
import { AccountOrders } from "@/modules/account/components/account-orders";
import { AccountProfile } from "@/modules/account/components/account-profile";
import { AccountAddresses } from "@/modules/account/components/account-addresses";
import type { AccountTab, AccountUser } from "@/modules/account/types";

export const AccountView = ({ user }: { user: AccountUser }) => {
  const [tab, setTab] = useState<AccountTab>("overview");

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16">
        <AccountPageHeader user={user} />

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <AccountNav active={tab} onSelect={setTab} />
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            {tab === "overview" && (
              <AccountOverview user={user} onNavigate={setTab} />
            )}
            {tab === "orders" && <AccountOrders />}
            {tab === "profile" && <AccountProfile user={user} />}
            {tab === "addresses" && <AccountAddresses />}
          </div>
        </div>
      </div>
    </section>
  );
};
