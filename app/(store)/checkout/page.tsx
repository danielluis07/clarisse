import type { Metadata } from "next";

import { requireUser } from "@/lib/auth-utils";
import { CheckoutView } from "@/components/store/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Finalizar compra | Clarisse",
  description:
    "Revise as suas peças e conclua o seu pedido na Clarisse — moda feminina premium e editorial.",
  robots: { index: false, follow: false },
};

const CheckoutPage = async () => {
  const session = await requireUser();

  return <CheckoutView contactEmail={session.user.email} />;
};

export default CheckoutPage;
